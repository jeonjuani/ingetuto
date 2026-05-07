import React, { useState } from 'react';
import WeeklyTemplateEditor from './WeeklyTemplateEditor';
import MonthlyCalendarView from './MonthlyCalendarView';
import './AvailabilityManagement.css';

const AvailabilityManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'template' | 'calendar'>('calendar');

    return (
        <div className="availability-container">
            <div className="availability-header">
                <h2>Gestión de Disponibilidad</h2>
                <p>Configura tus horarios semanales y revisa tu agenda mensual de tutorías.</p>
            </div>

            <div className="availability-tabs">
                <button
                    className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    Calendario Mensual
                </button>
                <button
                    className={`tab-btn ${activeTab === 'template' ? 'active' : ''}`}
                    onClick={() => setActiveTab('template')}
                >
                    Plantilla Semanal
                </button>
            </div>

            <div className="tab-content" style={{ marginTop: '20px' }}>
                {activeTab === 'template' ? (
                    <WeeklyTemplateEditor />
                ) : (
                    <MonthlyCalendarView />
                )}
            </div>
        </div>
    );
};

export default AvailabilityManagement;
