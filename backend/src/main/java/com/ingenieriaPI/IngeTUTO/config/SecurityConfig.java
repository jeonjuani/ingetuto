package com.ingenieriaPI.IngeTUTO.config;

import com.ingenieriaPI.IngeTUTO.security.JwtAuthFilter;
import com.ingenieriaPI.IngeTUTO.security.SessionManager;
import com.ingenieriaPI.IngeTUTO.service.JwtService;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/**", "/api/auth/logout").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
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

                // ✅ Genera el token JWT
                String token = jwtService.generateToken(usuario.getCorreoUsuario());
                sessionManager.touch(token);

                // ✅ Responde con el token en JSON
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"token\":\"" + token + "\"}");

            } catch (IllegalArgumentException e) {
                // Caso de correo no permitido (no @udea.edu.co)
                response.sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
            }
        };
    }
}
