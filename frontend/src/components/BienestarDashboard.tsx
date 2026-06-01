import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardDTO } from '../services/dashboardService';
import { 
    FaChartBar, 
    FaGraduationCap, 
    FaUsers, 
    FaBook, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaPercent, 
    FaSyncAlt, 
    FaPrint,
    FaArrowUp,
    FaChalkboardTeacher
} from 'react-icons/fa';
import './BienestarDashboard.css';

const FaTimesCircleIcon = FaTimesCircle as any;
const FaSyncAltIcon = FaSyncAlt as any;
const FaPrintIcon = FaPrint as any;
const FaGraduationCapIcon = FaGraduationCap as any;
const FaCheckCircleIcon = FaCheckCircle as any;
const FaArrowUpIcon = FaArrowUp as any;
const FaChalkboardTeacherIcon = FaChalkboardTeacher as any;
const FaUsersIcon = FaUsers as any;
const FaBookIcon = FaBook as any;

const MESES_ES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const ESTADOS_COLORES: Record<string, string> = {
    'REALIZADA': '#10b981',
    'PROGRAMADA': '#3b82f6',
    'CANCELADA': '#ef4444',
    'SOLICITADA': '#f59e0b',
    'DEFAULT': '#94a3b8'
};

const ESTADOS_TRADUCCION: Record<string, string> = {
    'REALIZADA': 'Realizadas',
    'PROGRAMADA': 'Programadas',
    'CANCELADA': 'Canceladas',
    'SOLICITADA': 'Solicitadas'
};

const BienestarDashboard: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<DashboardDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    
    // Estados de interactividad de gráficos
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState<{ label: string, value: number, percent: number } | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, value: string, label: string, visible: boolean }>({
        x: 0, y: 0, value: '', label: '', visible: false
    });
    
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const loadData = async (showRefreshIndicator = false) => {
        if (!token) return;
        if (showRefreshIndicator) setRefreshing(true);
        else setLoading(true);
        
        setError(null);
        try {
            const result = await dashboardService.obtenerDashboard(token);
            // Ordenar tutoriasPorMes cronológicamente
            if (result.tutoriasPorMes) {
                result.tutoriasPorMes = [...result.tutoriasPorMes].sort((a, b) => {
                    if (a.anio !== b.anio) return a.anio - b.anio;
                    return a.mes - b.mes;
                });
            }
            setData(result);
        } catch (err: any) {
            console.error('Error al cargar datos del dashboard:', err);
            setError('No se pudieron cargar las métricas. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handlePrint = () => {
        window.print();
    };

    // Helper para obtener iniciales
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    // Renderizar indicador de carga
    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Cargando panel de métricas de Bienestar...</p>
            </div>
        );
    }

    // Renderizar error
    if (error || !data) {
        return (
            <div className="dashboard-error">
                <FaTimesCircleIcon size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                <p>{error || 'Ocurrió un error inesperado.'}</p>
                <button className="btn-secondary" onClick={() => loadData()} style={{ marginTop: '16px' }}>
                    <FaSyncAltIcon /> Reintentar
                </button>
            </div>
        );
    }

    // Procesar datos para gráfico de evolución (Líneas)
    const tutoriasPorMes = data.tutoriasPorMes || [];
    const maxMesValue = Math.max(...tutoriasPorMes.map(d => d.cantidad), 10);
    const chartHeight = 160;
    const chartWidth = 520;
    const paddingX = 50;
    const paddingY = 20;

    const points = tutoriasPorMes.map((d, index) => {
        const x = paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(tutoriasPorMes.length - 1, 1);
        const y = paddingY + (chartHeight - paddingY * 2) * (1 - d.cantidad / maxMesValue);
        return { x, y, data: d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
        : '';

    // Procesar datos para Donut Chart de Estados
    const estadosKeys = Object.keys(data.distribucionEstados || {});
    const totalEstadosCount = Object.values(data.distribucionEstados || {}).reduce((acc, curr) => acc + curr, 0);
    
    // Generar segmentos de la dona
    let cumulativePercent = 0;
    const donutRadius = 50;
    const donutCircumference = 2 * Math.PI * donutRadius; // ~314.159
    
    const donutSegments = estadosKeys.map(key => {
        const val = data.distribucionEstados[key];
        const percent = totalEstadosCount > 0 ? val / totalEstadosCount : 0;
        const strokeLength = percent * donutCircumference;
        const strokeOffset = donutCircumference - (cumulativePercent * donutCircumference);
        cumulativePercent += percent;
        
        return {
            key,
            value: val,
            percent: percent * 100,
            color: ESTADOS_COLORES[key] || ESTADOS_COLORES['DEFAULT'],
            strokeDash: `${strokeLength} ${donutCircumference}`,
            strokeOffset
        };
    });

    // Segmento activo para mostrar texto central
    const donutCenterText = hoveredDonutSegment 
        ? hoveredDonutSegment 
        : { 
            label: 'Total Tutorías', 
            value: data.totalTutorias,
            percent: 100 
          };

    // Procesar datos de Modalidad
    const modalidadDistribucion = data.modalidadDistribucion || {};
    const totalModalidad = Object.values(modalidadDistribucion).reduce((acc, curr) => acc + curr, 0);
    const presencialCount = modalidadDistribucion['PRESENCIAL'] || 0;
    const virtualCount = modalidadDistribucion['VIRTUAL'] || 0;
    const presencialPercent = totalModalidad > 0 ? (presencialCount / totalModalidad) * 100 : 0;
    const virtualPercent = totalModalidad > 0 ? (virtualCount / totalModalidad) * 100 : 0;

    // Manejar eventos de Tooltip en el gráfico lineal
    const handleDotMouseEnter = (e: React.MouseEvent, val: number, label: string) => {
        if (!chartContainerRef.current) return;
        const rect = chartContainerRef.current.getBoundingClientRect();
        
        // Obtener coordenadas relativas al contenedor
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setTooltip({
            x,
            y,
            value: `${val} Tutoría${val !== 1 ? 's' : ''}`,
            label,
            visible: true
        });
    };

    const handleDotMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    return (
        <div className="bienestar-dashboard">
            {/* Header del Dashboard */}
            <div className="dashboard-header-section">
                <div>
                    <h1>Panel de Métricas de Bienestar</h1>
                    <p>Monitoreo y estadísticas globales de tutorías académicas</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => loadData(true)} disabled={refreshing}>
                        <FaSyncAltIcon className={refreshing ? 'spin' : ''} /> {refreshing ? 'Actualizando' : 'Actualizar'}
                    </button>
                    <button className="btn-primary" onClick={handlePrint}>
                        <FaPrintIcon /> Imprimir Reporte
                    </button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-total">
                    <div className="kpi-icon-wrapper">
                        <FaGraduationCapIcon />
                    </div>
                    <div className="kpi-title">Tutorías Totales</div>
                    <div className="kpi-value">{data.totalTutorias}</div>
                    <div className="kpi-footer">
                        <span>Histórico acumulado</span>
                    </div>
                </div>

                <div className="kpi-card kpi-success">
                    <div className="kpi-icon-wrapper">
                        <FaCheckCircleIcon />
                    </div>
                    <div className="kpi-title">Tasa Confirmación</div>
                    <div className="kpi-value">{data.tasaConfirmacion.toFixed(1)}%</div>
                    <div className="kpi-footer">
                        <span className="trend-up"><FaArrowUpIcon /> {data.totalRealizadas}</span>
                        <span>tutorías realizadas</span>
                    </div>
                </div>

                <div className="kpi-card kpi-danger">
                    <div className="kpi-icon-wrapper">
                        <FaTimesCircleIcon />
                    </div>
                    <div className="kpi-title">Tasa Cancelación</div>
                    <div className="kpi-value">{data.tasaCancelacion.toFixed(1)}%</div>
                    <div className="kpi-footer">
                        <span>{data.totalCanceladas} canceladas en total</span>
                    </div>
                </div>

                <div className="kpi-card kpi-info">
                    <div className="kpi-icon-wrapper">
                        <FaChalkboardTeacherIcon />
                    </div>
                    <div className="kpi-title">Tutores Activos</div>
                    <div className="kpi-value">{data.totalTutoresActivos}</div>
                    <div className="kpi-footer">
                        <span>Estudiantes que enseñan</span>
                    </div>
                </div>

                <div className="kpi-card kpi-warning">
                    <div className="kpi-icon-wrapper">
                        <FaUsersIcon />
                    </div>
                    <div className="kpi-title">Solicitantes</div>
                    <div className="kpi-value">{data.totalEstudiantesSolicitantes}</div>
                    <div className="kpi-footer">
                        <span>Alumnos que han reservado</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Line Chart: Evolución Temporal */}
                <div className="chart-card" ref={chartContainerRef}>
                    <div className="chart-card-title">
                        <div>
                            Evolución de Tutorías por Mes
                            <div className="chart-card-subtitle">Volumen de solicitudes en los últimos 6 meses</div>
                        </div>
                    </div>
                    
                    <div className="line-chart-wrapper">
                        <svg className="svg-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            <defs>
                                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Líneas de cuadrícula horizontal */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                                const val = Math.round(maxMesValue * (1 - ratio));
                                return (
                                    <g key={index}>
                                        <line 
                                            x1={paddingX} 
                                            y1={y} 
                                            x2={chartWidth - paddingX} 
                                            y2={y} 
                                            className="chart-grid-line" 
                                        />
                                        <text 
                                            x={paddingX - 10} 
                                            y={y + 4} 
                                            textAnchor="end" 
                                            className="chart-axis-text"
                                        >
                                            {val}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Eje X Etiquetas */}
                            {points.map((p, index) => (
                                <text
                                    key={index}
                                    x={p.x}
                                    y={chartHeight - 4}
                                    textAnchor="middle"
                                    className="chart-axis-text"
                                >
                                    {MESES_ES[p.data.mes - 1]}
                                </text>
                            ))}

                            {/* Área bajo la línea */}
                            {areaPath && <path d={areaPath} className="chart-area" />}

                            {/* Línea del gráfico */}
                            {linePath && (
                                <path 
                                    d={linePath} 
                                    className="chart-line" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            )}

                            {/* Puntos interactivos */}
                            {points.map((p, index) => {
                                const label = `${MESES_ES[p.data.mes - 1]} ${p.data.anio}`;
                                return (
                                    <circle
                                        key={index}
                                        cx={p.x}
                                        cy={p.y}
                                        r="5"
                                        className="chart-dot"
                                        onMouseEnter={(e) => handleDotMouseEnter(e, p.data.cantidad, label)}
                                        onMouseLeave={handleDotMouseLeave}
                                    />
                                );
                            })}
                        </svg>

                        {/* Tooltip dinámico */}
                        <div 
                            className={`chart-tooltip ${tooltip.visible ? 'visible' : ''}`}
                            style={{ left: tooltip.x, top: tooltip.y }}
                        >
                            <div style={{ fontWeight: 600, color: '#10b981' }}>{tooltip.value}</div>
                            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{tooltip.label}</div>
                        </div>
                    </div>
                </div>

                {/* Donut Chart: Distribución y Modalidades */}
                <div className="chart-card">
                    <div className="chart-card-title">
                        Distribución de Tutorías
                    </div>
                    
                    <div className="donut-chart-container">
                        <svg className="donut-svg" viewBox="0 0 120 120">
                            <circle className="donut-hole" cx="60" cy="60" r={donutRadius} />
                            
                            {/* Círculo base para el fondo */}
                            <circle 
                                className="donut-underlay" 
                                cx="60" 
                                cy="60" 
                                r={donutRadius} 
                                fill="none" 
                                stroke="#f1f5f9" 
                                strokeWidth="14" 
                            />

                            {/* Segmentos coloreados */}
                            {totalEstadosCount > 0 && donutSegments.map((segment) => (
                                <circle
                                    key={segment.key}
                                    className="donut-segment"
                                    cx="60"
                                    cy="60"
                                    r={donutRadius}
                                    stroke={segment.color}
                                    strokeDasharray={segment.strokeDash}
                                    strokeDashoffset={segment.strokeOffset}
                                    onMouseEnter={() => setHoveredDonutSegment({
                                        label: ESTADOS_TRADUCCION[segment.key] || segment.key,
                                        value: segment.value,
                                        percent: segment.percent
                                    })}
                                    onMouseLeave={() => setHoveredDonutSegment(null)}
                                />
                            ))}
                        </svg>

                        {/* Texto dinámico central */}
                        <div className="donut-text-center">
                            <span className="donut-number">{donutCenterText.value}</span>
                            <span className="donut-label">{donutCenterText.label}</span>
                            {donutCenterText.percent < 100 && (
                                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                    {donutCenterText.percent.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Leyendas del Estado */}
                    <div className="chart-legend">
                        {donutSegments.map(seg => (
                            <div key={seg.key} className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
                                <span>{ESTADOS_TRADUCCION[seg.key] || seg.key}</span>
                                <span className="legend-value">{seg.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '25px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                            Modalidad de Tutorías
                        </div>
                        <div className="modality-container">
                            <div className="modality-row">
                                <div className="modality-info">
                                    <span>Presenciales</span>
                                    <span>{presencialCount} ({presencialPercent.toFixed(1)}%)</span>
                                </div>
                                <div className="modality-bar-bg">
                                    <div className="modality-bar-fill presencial" style={{ width: `${presencialPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="modality-row">
                                <div className="modality-info">
                                    <span>Virtuales</span>
                                    <span>{virtualCount} ({virtualPercent.toFixed(1)}%)</span>
                                </div>
                                <div className="modality-bar-bg">
                                    <div className="modality-bar-fill virtual" style={{ width: `${virtualPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rankings Grid Section */}
            <div className="rankings-grid">
                {/* Ranking: Top Tutores */}
                <div className="ranking-card">
                    <div className="chart-card-title">
                        Top 5 Tutores
                        <div className="chart-card-subtitle">Tutores con mayor número de tutorías completadas</div>
                    </div>
                    
                    {data.topTutores && data.topTutores.length > 0 ? (
                        <div className="ranking-list">
                            {data.topTutores.map((tutor, idx) => (
                                <div className="ranking-item" key={idx}>
                                    <div className={`ranking-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="ranking-avatar">
                                        {getInitials(tutor.nombre)}
                                    </div>
                                    <div className="ranking-details">
                                        <h4 className="ranking-name" title={tutor.nombre}>{tutor.nombre}</h4>
                                    </div>
                                    <div className="ranking-count-wrapper">
                                        <span className="ranking-count">{tutor.cantidad}</span>
                                        <span className="ranking-unit">Tutorías</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-ranking">No hay datos disponibles en este período</div>
                    )}
                </div>

                {/* Ranking: Top Materias */}
                <div className="ranking-card">
                    <div className="chart-card-title">
                        Top 5 Materias
                        <div className="chart-card-subtitle">Asignaturas con mayor demanda académica</div>
                    </div>
                    
                    {data.topMaterias && data.topMaterias.length > 0 ? (
                        <div className="ranking-list">
                            {data.topMaterias.map((materia, idx) => (
                                <div className="ranking-item" key={idx}>
                                    <div className={`ranking-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="ranking-avatar" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                                        <FaBookIcon size={14} />
                                    </div>
                                    <div className="ranking-details">
                                        <h4 className="ranking-name" title={materia.nombre}>{materia.nombre}</h4>
                                    </div>
                                    <div className="ranking-count-wrapper">
                                        <span className="ranking-count">{materia.cantidad}</span>
                                        <span className="ranking-unit">Reservas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-ranking">No hay datos disponibles en este período</div>
                    )}
                </div>

                {/* Ranking: Top Estudiantes */}
                <div className="ranking-card">
                    <div className="chart-card-title">
                        Top 5 Estudiantes
                        <div className="chart-card-subtitle">Alumnos con mayor asistencia y participación</div>
                    </div>
                    
                    {data.topEstudiantes && data.topEstudiantes.length > 0 ? (
                        <div className="ranking-list">
                            {data.topEstudiantes.map((estudiante, idx) => (
                                <div className="ranking-item" key={idx}>
                                    <div className={`ranking-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="ranking-avatar" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                                        {getInitials(estudiante.nombre)}
                                    </div>
                                    <div className="ranking-details">
                                        <h4 className="ranking-name" title={estudiante.nombre}>{estudiante.nombre}</h4>
                                    </div>
                                    <div className="ranking-count-wrapper">
                                        <span className="ranking-count">{estudiante.cantidad}</span>
                                        <span className="ranking-unit">Sesiones</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-ranking">No hay datos disponibles en este período</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BienestarDashboard;
