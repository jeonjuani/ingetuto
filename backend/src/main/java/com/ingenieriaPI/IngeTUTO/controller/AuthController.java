package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.security.SessionManager;
import com.ingenieriaPI.IngeTUTO.security.TokenBlacklist;
import com.ingenieriaPI.IngeTUTO.service.JwtService;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TokenBlacklist tokenBlacklist;
    private final SessionManager sessionManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(TokenBlacklist tokenBlacklist, SessionManager sessionManager,
                         JwtService jwtService, UsuarioService usuarioService) {
        this.tokenBlacklist = tokenBlacklist;
        this.sessionManager = sessionManager;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            
            if (email != null && jwtService.isTokenValid(token, email)) {
                return usuarioService.buscarPorCorreo(email)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
            }
        }

        return ResponseEntity.status(401).body("Token inválido o expirado");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklist.blacklistToken(token);
            sessionManager.remove(token);
            return ResponseEntity.ok("Sesión cerrada correctamente.");
        }

        return ResponseEntity.badRequest().body("Token no encontrado o inválido.");
    }
}
