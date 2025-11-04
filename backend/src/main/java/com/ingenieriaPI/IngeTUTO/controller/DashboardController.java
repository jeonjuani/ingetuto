package com.ingenieriaPI.IngeTUTO.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/api/dashboard")
    public String dashboard() {
        return "Bienvenido al dashboard seguro con JWT!";
    }

    @GetMapping("/api/public/hello")
    public String publicEndpoint() {
        return "Este endpoint es público, no requiere login.";
    }
}
