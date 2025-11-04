package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.security.SessionManager;
import com.ingenieriaPI.IngeTUTO.security.TokenBlacklist;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TokenBlacklist tokenBlacklist;
    private final SessionManager sessionManager;

    public AuthController(TokenBlacklist tokenBlacklist, SessionManager sessionManager) {
        this.tokenBlacklist = tokenBlacklist;
        this.sessionManager = sessionManager;
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
