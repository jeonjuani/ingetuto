import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

class BienestarErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error('[BienestarErrorBoundary] Error capturado:', error);
        return {
            hasError: true,
            errorMessage: error.message || 'Error inesperado al renderizar el panel.',
        };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[BienestarErrorBoundary] Detalles:', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, errorMessage: '' });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        padding: '40px',
                        textAlign: 'center',
                        color: '#ef4444',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>
                        Ocurrió un error al cargar las métricas
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', maxWidth: '400px' }}>
                        El panel no pudo procesarse correctamente. Por favor intenta de nuevo.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}
                    >
                        🔄 Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default BienestarErrorBoundary;
