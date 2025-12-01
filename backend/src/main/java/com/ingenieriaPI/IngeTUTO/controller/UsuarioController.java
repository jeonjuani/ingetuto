package com.ingenieriaPI.IngeTUTO.controller;

import com.ingenieriaPI.IngeTUTO.entity.Usuario;
import com.ingenieriaPI.IngeTUTO.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // 🧪 Endpoint para simular registro con Google (para pruebas en Postman)
    @PostMapping("/google")
    public Usuario registrarDesdeGoogle(@RequestParam String givenName,
            @RequestParam String familyName,
            @RequestParam String email) {
        return usuarioService.registrarUsuarioDesdeGoogle(givenName, familyName, email);
    }

    /**
     * Actualiza el número de teléfono del usuario autenticado
     */
    @PutMapping("/phone")
    public Usuario updatePhoneNumber(@RequestParam String phoneNumber,
            @RequestParam Integer userId) {
        return usuarioService.updatePhoneNumber(userId, phoneNumber);
    }
}
