const API_URL = 'http://localhost:8080/api/disponibilidad';

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

const handleResponse = async (response: Response) => {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        console.error('Error parsing JSON:', text);
        throw new Error('Respuesta del servidor inválida');
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la petición');
    }
    return data;
};

export const disponibilidadService = {
    // Weekly template
    crearPlantillaSemanal: async (bloques: DisponibilidadSemanalDTO[], token: string) => {
        const response = await fetch(`${API_URL}/plantilla-semanal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bloques)
        });
        return handleResponse(response);
    },

    obtenerPlantillaSemanal: async (token: string): Promise<DisponibilidadSemanalDTO[]> => {
        const response = await fetch(`${API_URL}/plantilla-semanal`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Monthly availability
    generarMensual: async (mes: number, anio: number, token: string): Promise<GeneracionResponse> => {
        const response = await fetch(`${API_URL}/generar-mensual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mes, anio })
        });
        return handleResponse(response);
    },

    obtenerMensual: async (mes: number, anio: number, token: string): Promise<DisponibilidadMensualDTO[]> => {
        const response = await fetch(`${API_URL}/mensual/${mes}/${anio}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    validarConfirmar: async (mes: number, anio: number, token: string): Promise<ValidacionResponse> => {
        const response = await fetch(`${API_URL}/validar-confirmar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mes, anio })
        });
        return handleResponse(response);
    },

    eliminarBloque: async (bloqueId: number, token: string) => {
        const response = await fetch(`${API_URL}/bloque/${bloqueId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    modificarModalidad: async (bloqueId: number, modalidad: string, token: string) => {
        const response = await fetch(`${API_URL}/bloque/${bloqueId}/modalidad`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ modalidad })
        });
        return handleResponse(response);
    },

    // Student view
    obtenerPorMateria: async (materiaId: number, fechaInicio: string, fechaFin: string, token: string): Promise<DisponibilidadMensualDTO[]> => {
        const response = await fetch(`${API_URL}/por-materia/${materiaId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};
