package com.ingenieriaPI.IngeTUTO.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    // Cargamos la clave desde las variables de entorno (más seguro)
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private static final long EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutos

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Genera el token usando el correo del usuario
    public String generateToken(String correoUsuario) {
        return Jwts.builder()
                .setSubject(correoUsuario)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extrae el correo del token
    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    // Valida el token y su expiración
    public boolean isTokenValid(String token, String username) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String subject = claims.getSubject();
            Date expiration = claims.getExpiration();

            return subject != null && subject.equals(username) && expiration.after(new Date());
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado");
        } catch (JwtException e) {
            System.out.println("Token inválido");
        }
        return false;
    }
}
