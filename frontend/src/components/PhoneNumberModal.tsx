import React, { useState } from 'react';
import './PhoneNumberModal.css';

interface PhoneNumberModalProps {
    onPhoneSubmit: (phone: string) => Promise<void>;
}

const PhoneNumberModal: React.FC<PhoneNumberModalProps> = ({ onPhoneSubmit }) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePhone = (value: string): boolean => {
        // Solo números, exactamente 10 dígitos
        const cleanPhone = value.replace(/[^0-9]/g, '');
        return cleanPhone.length === 10;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePhone(phone)) {
            setError('El número de teléfono debe tener exactamente 10 dígitos');
            return;
        }

        setLoading(true);
        try {
            await onPhoneSubmit(phone);
        } catch (err: any) {
            setError(err.message || 'Error al guardar el número de teléfono');
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 10) {
            setPhone(value);
        }
    };

    return (
        <div className="phone-modal-overlay">
            <div className="phone-modal-card">
                <div className="phone-modal-icon">📱</div>
                <h2>Número de Teléfono Requerido</h2>
                <p className="phone-modal-description">
                    Para poder usar el sistema de tutorías, necesitamos tu número de teléfono.
                    Esto permitirá que tutores y estudiantes puedan contactarse fácilmente.
                </p>

                <form onSubmit={handleSubmit} className="phone-modal-form">
                    <div className="form-group">
                        <label htmlFor="phone">Número de Teléfono (10 dígitos)</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="3001234567"
                            className="phone-input"
                            disabled={loading}
                            autoFocus
                        />
                        {phone && (
                            <div className={`phone-validation ${validatePhone(phone) ? 'valid' : 'invalid'}`}>
                                {validatePhone(phone) ? '✓ Válido' : `${phone.length}/10 dígitos`}
                            </div>
                        )}
                    </div>

                    {error && <div className="phone-error">{error}</div>}

                    <button
                        type="submit"
                        className="phone-submit-btn"
                        disabled={loading || !validatePhone(phone)}
                    >
                        {loading ? 'Guardando...' : 'Continuar'}
                    </button>
                </form>

                <p className="phone-modal-note">
                    Este número será visible para tutores y estudiantes al agendar tutorías.
                </p>
            </div>
        </div>
    );
};

export default PhoneNumberModal;
