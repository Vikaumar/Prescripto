import { useState } from 'react';
import { createReminder } from '../services/api';
import './AddReminderModal.css';

function AddReminderModal({ onClose, onCreated, prescriptionMedicines = [] }) {
    const [formData, setFormData] = useState({
        medicineName: '',
        dosage: '',
        instructions: '',
        frequency: 'once_daily',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        color: '#6366f1',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const frequencyOptions = [
        { value: 'once_daily', label: 'Once daily', times: 1 },
        { value: 'twice_daily', label: 'Twice daily', times: 2 },
        { value: 'three_times_daily', label: '3 times daily', times: 3 },
        { value: 'four_times_daily', label: '4 times daily', times: 4 },
        { value: 'weekly', label: 'Weekly', times: 1 }
    ];

    const colorOptions = [
        '#6366f1', // Indigo
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#06b6d4', // Cyan
        '#3b82f6'  // Blue
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-adjust times array based on frequency
        if (name === 'frequency') {
            const option = frequencyOptions.find(o => o.value === value);
            if (option) {
                const defaultTimes = {
                    1: ['08:00'],
                    2: ['08:00', '20:00'],
                    3: ['08:00', '14:00', '20:00'],
                    4: ['07:00', '12:00', '17:00', '22:00']
                };
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    times: defaultTimes[option.times] || ['08:00']
                }));
            }
        }
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const handleMedicineSelect = (medicine) => {
        setFormData(prev => ({
            ...prev,
            medicineName: medicine.name || '',
            dosage: medicine.dosage || '',
            instructions: medicine.instructions || ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.medicineName.trim()) {
            setError('Medicine name is required');
            return;
        }

        if (formData.times.length === 0 || formData.times.some(t => !t)) {
            setError('Please set all reminder times');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createReminder({
                medicineName: formData.medicineName.trim(),
                dosage: formData.dosage.trim(),
                instructions: formData.instructions.trim(),
                frequency: formData.frequency,
                times: formData.times,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                color: formData.color,
                notes: formData.notes.trim()
            });

            onCreated(result.data);
        } catch (err) {
            setError(err.message || 'Failed to create reminder');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-reminder-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Medicine Reminder</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="modal-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Quick select from prescription */}
                {prescriptionMedicines.length > 0 && (
                    <div className="quick-select">
                        <label>Quick Add from Prescription:</label>
                        <div className="medicine-chips">
                            {prescriptionMedicines.map((med, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="medicine-chip"
                                    onClick={() => handleMedicineSelect(med)}
                                >
                                    {med.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Medicine Name */}
                    <div className="form-group">
                        <label htmlFor="medicineName">Medicine Name *</label>
                        <input
                            type="text"
                            id="medicineName"
                            name="medicineName"
                            value={formData.medicineName}
                            onChange={handleChange}
                            placeholder="e.g., Paracetamol 500mg"
                            required
                        />
                    </div>

                    {/* Dosage */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dosage">Dosage</label>
                            <input
                                type="text"
                                id="dosage"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                                placeholder="e.g., 1 tablet"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="frequency">Frequency</label>
                            <select
                                id="frequency"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                            >
                                {frequencyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Times */}
                    <div className="form-group">
                        <label>Reminder Times</label>
                        <div className="times-grid">
                            {formData.times.map((time, index) => (
                                <div key={index} className="time-input-wrapper">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End Date (optional)</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={formData.startDate}
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="form-group">
                        <label htmlFor="instructions">Instructions</label>
                        <input
                            type="text"
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            placeholder="e.g., Take after meals"
                        />
                    </div>

                    {/* Color */}
                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label htmlFor="notes">Notes (optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional notes..."
                            rows="2"
                        />
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Reminder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddReminderModal;
