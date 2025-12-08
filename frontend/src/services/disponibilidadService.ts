import { axiosInstance } from './axiosConfig';

export interface DisponibilidadSemanalDTO {
    idDisponibilidadSemanal?: number;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    modalidad: 'VIRTUAL' | 'PRESENCIAL';
}

export interface DisponibilidadMensualDTO {
    idDisponibilidadMensual: number;
    idTutor: number;
    nombreTutor: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    modalidad: 'VIRTUAL' | 'PRESENCIAL';
    estado: 'DISPONIBLE' | 'RESERVADO' | 'OCUPADO' | 'CANCELADO';
}

export interface GeneracionResponse {
    exito: boolean;
    mensaje: string;
    bloquesGenerados: number;
    fechaLimiteRegistro: string;
}

export interface ValidacionResponse {
    valido: boolean;
    errores: string[];
    advertencias: string[];
    bloquesSinModalidad: any[];
}

export const disponibilidadService = {
    // Weekly template
    crearPlantillaSemanal: async (bloques: DisponibilidadSemanalDTO[], token: string) => {
        const response = await axiosInstance.post('/api/disponibilidad/plantilla-semanal', bloques, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    obtenerPlantillaSemanal: async (token: string): Promise<DisponibilidadSemanalDTO[]> => {
        const response = await axiosInstance.get('/api/disponibilidad/plantilla-semanal', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Monthly availability
    generarMensual: async (mes: number, anio: number, token: string): Promise<GeneracionResponse> => {
        const response = await axiosInstance.post('/api/disponibilidad/generar-mensual', { mes, anio }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    obtenerMensual: async (mes: number, anio: number, token: string): Promise<DisponibilidadMensualDTO[]> => {
        const response = await axiosInstance.get(`/api/disponibilidad/mensual/${mes}/${anio}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    validarConfirmar: async (mes: number, anio: number, token: string): Promise<ValidacionResponse> => {
        const response = await axiosInstance.post('/api/disponibilidad/validar-confirmar', { mes, anio }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    eliminarBloque: async (bloqueId: number, token: string) => {
        const response = await axiosInstance.delete(`/api/disponibilidad/bloque/${bloqueId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    modificarModalidad: async (bloqueId: number, modalidad: string, token: string) => {
        const response = await axiosInstance.patch(`/api/disponibilidad/bloque/${bloqueId}/modalidad`, { modalidad }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Student view
    obtenerPorMateria: async (materiaId: number, fechaInicio: string, fechaFin: string, token: string): Promise<DisponibilidadMensualDTO[]> => {
        const response = await axiosInstance.get(`/api/disponibilidad/por-materia/${materiaId}`, {
            params: { fechaInicio, fechaFin },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
};
