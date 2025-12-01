package com.ingenieriaPI.IngeTUTO.security;

import com.ingenieriaPI.IngeTUTO.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;
    private final SessionManager sessionManager;
    private final com.ingenieriaPI.IngeTUTO.repository.RolRepository rolRepository;

    public JwtAuthFilter(JwtService jwtService, TokenBlacklist tokenBlacklist, SessionManager sessionManager,
            com.ingenieriaPI.IngeTUTO.repository.RolRepository rolRepository) {
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
        this.sessionManager = sessionManager;
        this.rolRepository = rolRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        // Si el token está en la blacklist, rechazarlo
        if (tokenBlacklist.isTokenBlacklisted(jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token inválido o cerrado.");
            return;
        }

        // Control de inactividad del token
        boolean active = sessionManager.checkAndUpdate(jwt, tokenBlacklist);
        if (!active) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Sesión cerrada por inactividad.");
            return;
        }

        String userEmail = jwtService.extractUsername(jwt);
        String activeRoleName = jwtService.extractActiveRole(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(jwt, userEmail)) {

                // Cargar permisos del rol activo
                java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

                if (activeRoleName != null) {
                    rolRepository.findByNombre(activeRoleName).ifPresent(rol -> {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                "ROLE_" + rol.getNombre())); // Asegurar prefijo ROLE_
                        // También agregar la autoridad sin prefijo para compatibilidad
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                rol.getNombre()));
                    });
                }

                UserDetails userDetails = User.withUsername(userEmail)
                        .password("")
                        .authorities(authorities)
                        .build();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                        null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
