package com.ingenieriaPI.IngeTUTO.dto;

public class ActualizarLinkRequest {
    private String linkTutoria;

    // Constructors
    public ActualizarLinkRequest() {
    }

    public ActualizarLinkRequest(String linkTutoria) {
        this.linkTutoria = linkTutoria;
    }

    // Getters and Setters
    public String getLinkTutoria() {
        return linkTutoria;
    }

    public void setLinkTutoria(String linkTutoria) {
        this.linkTutoria = linkTutoria;
    }
}
