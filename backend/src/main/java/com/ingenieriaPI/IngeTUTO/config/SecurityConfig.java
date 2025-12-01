package com.ingenieriaPI.IngeTUTO.config;

import com.ingenieriaPI.IngeTUTO.security.JwtAuthFilter;
import com.ingenieriaPI.IngeTUTO.security.SessionManager;
import com.ingenieriaPI.IngeTUTO.service.JwtService;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final JwtService jwtService;
    private final UsuarioService usuarioService;
    private final JwtAuthFilter jwtAuthFilter;
    private final SessionManager sessionManager;

    public SecurityConfig(JwtService jwtService, UsuarioService usuarioService,
            JwtAuthFilter jwtAuthFilter, SessionManager sessionManager) {
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.sessionManager = sessionManager;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/**", "/api/auth/**", "/oauth2/**", "/login/**", "/v3/api-docs/**",
                                "/swagger-ui/**", "/swagger-ui.html")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/usuarios/phone").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
                        new org.springframework.security.web.authentication.HttpStatusEntryPoint(
                                org.springframework.http.HttpStatus.UNAUTHORIZED),
                        new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")))
                .oauth2Login(oauth2 -> oauth2.successHandler(authenticationSuccessHandler()));

        return http.build();
    }

    private AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            OAuth2User user = (OAuth2User) authentication.getPrincipal();

            // Datos que vienen de Google
            String givenName = user.getAttribute("given_name");
            String familyName = user.getAttribute("family_name");
            String email = user.getAttribute("email");

            try {
                // ✅ Centraliza toda la lógica en el servicio
                Usuario usuario = usuarioService.registrarUsuarioDesdeGoogle(givenName, familyName, email);

                // ✅ Determinar el rol inicial (prioridad: ESTUDIANTE, sino el primero que
                // tenga)
                String activeRole = "ESTUDIANTE";
                boolean hasEstudiante = usuario.getRoles().stream()
                        .anyMatch(r -> r.getNombre().equals("ESTUDIANTE"));

                if (!hasEstudiante && !usuario.getRoles().isEmpty()) {
                    activeRole = usuario.getRoles().iterator().next().getNombre();
                }

                // ✅ Genera el token JWT con el rol seleccionado
                String token = jwtService.generateToken(usuario.getCorreoUsuario(), activeRole);
                sessionManager.touch(token);

                // ✅ Limpiar cualquier contenido previo y redirigir al frontend con el token
                response.resetBuffer();
                response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                String frontendUrl = "http://localhost:3000/?token="
                        + java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8);
                response.setHeader("Location", frontendUrl);
                response.flushBuffer();

            } catch (IllegalArgumentException e) {
                // Caso de correo no permitido (no @udea.edu.co)
                response.resetBuffer();
                response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                String frontendUrl = "http://localhost:3000/?message=" +
                        java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
                response.setHeader("Location", frontendUrl);
                response.flushBuffer();
            } catch (Exception e) {
                // Error inesperado
                response.resetBuffer();
                response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                String frontendUrl = "http://localhost:3000/?message=" +
                        java.net.URLEncoder.encode("Error al procesar la autenticación",
                                java.nio.charset.StandardCharsets.UTF_8);
                response.setHeader("Location", frontendUrl);
                response.flushBuffer();
            }
        };
    }
}
