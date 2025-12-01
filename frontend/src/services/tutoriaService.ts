import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tutorias';

export interface TutoriaDTO {
    idTutoria: number;
    idEstudiante: number;
    nombreEstudiante: string;
    telefonoEstudiante?: string;
    idTutor: number;
    nombreTutor: string;
    telefonoTutor?: string;
    idMateria: number;
    nombreMateria: string;
    nombreTema: string;
    fechaTutoria: string;
    horaInicio: string;
    horaFin: string;
    modalidad: string;
    linkTutoria?: string;
    estado: string;
    observaciones?: string;
    confirmacionEstudiante?: boolean;
    confirmacionTutor?: boolean;
}

export const tutoriaService = {
    /**
     * Reserva una tutoría
     */
    reservarTutoria: async (bloqueId: number, materiaId: number, nombreTema: string, token: string): Promise<TutoriaDTO> => {
        const response = await axios.post(
            `${API_URL}/reservar`,
            { bloqueId, materiaId, nombreTema },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    /**
     * Obtiene las tutorías del estudiante
     */
    obtenerMisTutorias: async (estados?: string[], token?: string): Promise<TutoriaDTO[]> => {
        const params = estados && estados.length > 0 ? { estados: estados.join(',') } : {};
        const response = await axios.get(`${API_URL}/estudiante`, {
            params,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        return response.data;
    },

    /**
     * Obtiene las tutorías asignadas al tutor
     */
    obtenerTutoriasAsignadas: async (estados?: string[], token?: string): Promise<TutoriaDTO[]> => {
        const params = estados && estados.length > 0 ? { estados: estados.join(',') } : {};
        const response = await axios.get(`${API_URL}/tutor`, {
            params,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        return response.data;
    },

    /**
     * Tutor agrega link de Meet
     */
    agregarLink: async (tutoriaId: number, linkTutoria: string, token: string): Promise<void> => {
        await axios.put(
            `${API_URL}/${tutoriaId}/link`,
            { linkTutoria },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    },

    /**
     * Cancela una tutoría
     */
    cancelarTutoria: async (tutoriaId: number, observaciones: string, token: string): Promise<void> => {
        await axios.put(
            `${API_URL}/${tutoriaId}/cancelar`,
            { observaciones },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    },

    /**
     * Estudiante confirma asistencia
     */
    confirmarAsistenciaEstudiante: async (tutoriaId: number, token: string): Promise<void> => {
        await axios.put(
            `${API_URL}/${tutoriaId}/confirmar-estudiante`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
    },

    /**
     * Tutor confirma asistencia
     */
    confirmarAsistenciaTutor: async (tutoriaId: number, token: string): Promise<void> => {
        await axios.put(
            `${API_URL}/${tutoriaId}/confirmar-tutor`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
    }
};
