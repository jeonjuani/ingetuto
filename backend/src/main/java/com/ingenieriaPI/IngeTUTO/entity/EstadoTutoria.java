package com.ingenieriaPI.IngeTUTO.entity;

/**
 * Estados del ciclo de vida de una tutoría
 */
public enum EstadoTutoria {
    /**
     * Estudiante reservó el bloque, esperando que tutor agregue link de Meet
     */
    RESERVADA,

    /**
     * Tutor agregó link de Meet, tutoría lista para ejecutarse
     */
    PROGRAMADA,

    /**
     * Pasó la fecha/hora de la tutoría, esperando confirmación de asistencia de
     * ambas partes
     */
    PENDIENTE_CONFIRMACION,

    /**
     * Ambos confirmaron asistencia dentro de 3 días hábiles
     */
    REALIZADA,

    /**
     * Pasaron 3 días hábiles sin confirmación completa, requiere revisión de
     * Bienestar
     */
    SIN_CONFIRMAR,

    /**
     * Funcionario de Bienestar confirmó que la tutoría se realizó
     */
    COMPLETADA,

    /**
     * Funcionario de Bienestar confirmó que la tutoría NO se realizó
     */
    NO_EJECUTADA,

    /**
     * Cancelada antes de la fecha por estudiante o tutor
     */
    CANCELADA
}
