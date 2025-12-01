package com.ingenieriaPI.IngeTUTO.dto;

public class TutorSubjectDTO {
    private Integer idTutorXMateria;
    private Integer idMateria;
    private String nombreMateria;
    private String codigoMateria;

    public TutorSubjectDTO(Integer idTutorXMateria, Integer idMateria, String nombreMateria, String codigoMateria) {
        this.idTutorXMateria = idTutorXMateria;
        this.idMateria = idMateria;
        this.nombreMateria = nombreMateria;
        this.codigoMateria = codigoMateria;
    }

    public Integer getIdTutorXMateria() {
        return idTutorXMateria;
    }

    public void setIdTutorXMateria(Integer idTutorXMateria) {
        this.idTutorXMateria = idTutorXMateria;
    }

    public Integer getIdMateria() {
        return idMateria;
    }

    public void setIdMateria(Integer idMateria) {
        this.idMateria = idMateria;
    }

    public String getNombreMateria() {
        return nombreMateria;
    }

    public void setNombreMateria(String nombreMateria) {
        this.nombreMateria = nombreMateria;
    }

    public String getCodigoMateria() {
        return codigoMateria;
    }

    public void setCodigoMateria(String codigoMateria) {
        this.codigoMateria = codigoMateria;
    }
}
