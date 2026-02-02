import { useState } from 'react';
import { toggleReminder, updateReminder } from '../services/api';
import './ReminderCard.css';

function ReminderCard({ reminder, onDelete, onRefresh }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (field) => {
        setIsLoading(true);
        try {
            await toggleReminder(reminder._id, field);
            onRefresh?.();
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimes = (times) => {
        if (!times || times.length === 0) return 'Not set';
        return times.map(time => {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const period = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${displayHour}:${minutes} ${period}`;
        }).join(', ');
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            once_daily: 'Once daily',
            twice_daily: 'Twice daily',
            three_times_daily: '3 times daily',
            four_times_daily: '4 times daily',
            weekly: 'Weekly',
            custom: 'Custom'
        };
        return labels[frequency] || frequency;
    };

    return (
        <div
            className={`reminder-card ${reminder.isPaused ? 'paused' : ''} ${!reminder.isActive ? 'inactive' : ''}`}
            style={{ '--reminder-color': reminder.color || '#6366f1' }}
        >
            <div className="reminder-color-bar" />

            <div className="reminder-header">
                <div className="reminder-info">
                    <h3>{reminder.medicineName}</h3>
                    {reminder.dosage && <span className="reminder-dosage">{reminder.dosage}</span>}
                </div>
                <div className="reminder-toggle">
                    <button
                        className={`toggle-btn ${reminder.isPaused ? 'paused' : 'active'}`}
                        onClick={() => handleToggle('isPaused')}
                        disabled={isLoading}
                        title={reminder.isPaused ? 'Resume' : 'Pause'}
                    >
                        {reminder.isPaused ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="reminder-details">
                <div className="detail-row">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">{formatTimes(reminder.times)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-icon">🔄</span>
                    <span className="detail-text">{getFrequencyLabel(reminder.frequency)}</span>
                </div>
                {reminder.instructions && (
                    <div className="detail-row">
                        <span className="detail-icon">📝</span>
                        <span className="detail-text instructions">{reminder.instructions}</span>
                    </div>
                )}
            </div>

            {reminder.isPaused && (
                <div className="reminder-badge paused">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Paused
                </div>
            )}

            <div className="reminder-actions">
                <button
                    className="action-btn edit"
                    onClick={() => setIsEditing(!isEditing)}
                    title="Edit"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button
                    className="action-btn delete"
                    onClick={() => onDelete(reminder._id)}
                    title="Delete"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ReminderCard;
