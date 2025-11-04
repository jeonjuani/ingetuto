package com.ingenieriaPI.IngeTUTO.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionManager {

    private static final long INACTIVITY_MS = 10 * 60 * 1000; // 10 minutos

    // token -> lastAccessMillis
    private final ConcurrentHashMap<String, Long> lastAccess = new ConcurrentHashMap<>();

    public boolean checkAndUpdate(String token, TokenBlacklist blacklist) {
        long now = System.currentTimeMillis();
        Long last = lastAccess.get(token);

        if (last == null) {
            // primer uso: registrar acceso
            lastAccess.put(token, now);
            return true;
        }

        if (now - last > INACTIVITY_MS) {
            // inactivo > 10 min => invalidar
            blacklist.blacklistToken(token);
            lastAccess.remove(token);
            return false;
        }

        // actualizar timestamp de actividad
        lastAccess.put(token, now);
        return true;
    }

    public void touch(String token) {
        lastAccess.put(token, System.currentTimeMillis());
    }

    public void remove(String token) {
        lastAccess.remove(token);
    }
}
