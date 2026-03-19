import { axiosInstance } from './axiosConfig';

export interface MensajeDTO {
    idMensaje: number;
    idTutoria: number;
    idEmisor: number;
    nombreEmisor: string;
    contenido: string;
    fechaEnvio: string;
    leido: boolean;
    fechaLectura?: string;
}

export const mensajeService = {

    /**
     * Enviar un mensaje en una tutoría
     */
    enviarMensaje: async (tutoriaId: number, contenido: string, token: string): Promise<MensajeDTO> => {
        const response = await axiosInstance.post(
            `/api/mensajes/${tutoriaId}`,
            contenido,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );
        return response.data;
    },

    /**
     * Obtener mensajes de una tutoría
     */
    obtenerMensajes: async (tutoriaId: number, token: string): Promise<MensajeDTO[]> => {
        const response = await axiosInstance.get(`/api/mensajes/${tutoriaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    /**
     * Contar mensajes no leídos de una tutoría
     */
    contarNoLeidos: async (tutoriaId: number, token: string): Promise<number> => {
        const response = await axiosInstance.get(`/api/mensajes/${tutoriaId}/no-leidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
};