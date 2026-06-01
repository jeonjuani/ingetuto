import { axiosInstance } from './axiosConfig';

export interface RankingDTO {
    nombre: string;
    cantidad: number;
}

export interface TutoriasPorMesDTO {
    anio: number;
    mes: number;
    cantidad: number;
}

export interface DashboardDTO {
    totalTutorias: number;
    totalRealizadas: number;
    totalCanceladas: number;
    tasaCancelacion: number;
    totalTutoresActivos: number;
    totalEstudiantesSolicitantes: number;
    tutoriasPorMes: TutoriasPorMesDTO[];
    crecimientoMensual: number;
    topTutores: RankingDTO[];
    topMaterias: RankingDTO[];
    topEstudiantes: RankingDTO[];
    distribucionEstados: Record<string, number>;
    tasaConfirmacion: number;
    modalidadDistribucion: Record<string, number>;
}

export const dashboardService = {
    /**
     * Obtiene las métricas consolidadas para el funcionario de bienestar
     */
    obtenerDashboard: async (token: string): Promise<DashboardDTO> => {
        const response = await axiosInstance.get('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
};
