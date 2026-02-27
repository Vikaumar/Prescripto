import { useState } from 'react';
import { submitRefillRequest } from '../services/api';
import './RefillRequestModal.css';

function RefillRequestModal({ isOpen, onClose, pharmacyName = '' }) {
    const [formData, setFormData] = useState({
        medicineName: '',
        quantity: 1,
        pharmacyName: pharmacyName,
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medicineName.trim()) return;

        try {
            setLoading(true);
            setError(null);
            const result = await submitRefillRequest(formData);
            setSuccess(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ medicineName: '', quantity: 1, pharmacyName: '', notes: '' });
        setSuccess(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="refill-modal-overlay" onClick={handleClose}>
            <div className="refill-modal" onClick={(e) => e.stopPropagation()}>
                <div className="refill-modal-header">
                    <h2>📋 Refill Request</h2>
                    <button className="refill-close-btn" onClick={handleClose}>✕</button>
                </div>

                {success ? (
                    <div className="refill-success">
                        <div className="success-icon">✅</div>
                        <h3>Request Submitted!</h3>
                        <p>Your refill request has been submitted successfully.</p>
                        <div className="success-details">
                            <div className="success-detail-row">
                                <span>Request ID</span>
                                <strong>{success.requestId}</strong>
                            </div>
                            <div className="success-detail-row">
                                <span>Medicine</span>
                                <strong>{success.details?.medicineName}</strong>
                            </div>
                            <div className="success-detail-row">
                                <span>Estimated Ready</span>
                                <strong>{success.estimatedReadyTime}</strong>
                            </div>
                        </div>
                        <button className="refill-done-btn" onClick={handleClose}>Done</button>
                    </div>
                ) : (
                    <form className="refill-form" onSubmit={handleSubmit}>
                        <div className="refill-form-group">
                            <label htmlFor="medicineName">Medicine Name *</label>
                            <input
                                id="medicineName"
                                type="text"
                                name="medicineName"
                                placeholder="Enter medicine name"
                                value={formData.medicineName}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="refill-form-row">
                            <div className="refill-form-group">
                                <label htmlFor="quantity">Quantity</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    max="99"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="refill-form-group">
                                <label htmlFor="pharmacyName">Preferred Pharmacy</label>
                                <input
                                    id="pharmacyName"
                                    type="text"
                                    name="pharmacyName"
                                    placeholder="Any pharmacy"
                                    value={formData.pharmacyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="refill-form-group">
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                placeholder="Any special instructions or notes..."
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        {error && (
                            <div className="refill-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="refill-form-actions">
                            <button type="button" className="refill-cancel-btn" onClick={handleClose}>
                                Cancel
                            </button>
                            <button type="submit" className="refill-submit-btn" disabled={loading || !formData.medicineName.trim()}>
                                {loading ? (
                                    <>
                                        <span className="refill-spinner" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RefillRequestModal;
