import { useState } from 'react';
import './MedicineCard.css';

function MedicineCard({ medicine, onInfoClick }) {
    const [expanded, setExpanded] = useState(false);

    if (!medicine || !medicine.name) {
        return null;
    }

    const hasAIDetails = medicine.whatItDoes || medicine.whyPrescribed ||
        medicine.keyWarnings?.length > 0 || medicine.foodInteractions;

    return (
        <div className="medicine-card">
            <div className="medicine-header">
                <span className="medicine-icon">💊</span>
                <div className="medicine-header-text">
                    <h4 className="medicine-name">{medicine.name}</h4>
                    {medicine.category && (
                        <span className="medicine-category">{medicine.category}</span>
                    )}
                </div>
            </div>

            {/* Basic Prescription Details */}
            <div className="medicine-details">
                {medicine.dosage && (
                    <div className="medicine-detail">
                        <span className="detail-label">Dosage</span>
                        <span className="detail-value">{medicine.dosage}</span>
                    </div>
                )}

                {medicine.frequency && (
                    <div className="medicine-detail">
                        <span className="detail-label">Frequency</span>
                        <span className="detail-value">{medicine.frequency}</span>
                    </div>
                )}

                {medicine.duration && (
                    <div className="medicine-detail">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{medicine.duration}</span>
                    </div>
                )}
            </div>

            {medicine.instructions && (
                <div className="medicine-instructions">
                    <span className="instructions-label">📋 INSTRUCTIONS</span>
                    <p className="instructions-text">{medicine.instructions}</p>
                </div>
            )}

            {/* AI-Researched Details - Inline */}
            {hasAIDetails && (
                <div className="ai-details-section">
                    <button
                        className={`ai-toggle-btn ${expanded ? 'expanded' : ''}`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span className="ai-toggle-icon">🔬</span>
                        <span>AI Research about this Medicine</span>
                        <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {expanded && (
                        <div className="ai-details-content">
                            {/* What it does */}
                            {medicine.whatItDoes && (
                                <div className="ai-detail-box what-it-does">
                                    <div className="ai-box-header">
                                        <span className="ai-box-icon">💡</span>
                                        <span className="ai-box-title">What it does</span>
                                    </div>
                                    <p className="ai-box-text">{medicine.whatItDoes}</p>
                                </div>
                            )}

                            {/* Why prescribed */}
                            {medicine.whyPrescribed && (
                                <div className="ai-detail-box why-prescribed">
                                    <div className="ai-box-header">
                                        <span className="ai-box-icon">🎯</span>
                                        <span className="ai-box-title">Why prescribed</span>
                                    </div>
                                    <p className="ai-box-text">{medicine.whyPrescribed}</p>
                                </div>
                            )}

                            {/* Food Interactions */}
                            {medicine.foodInteractions && (
                                <div className="ai-detail-box food-interactions">
                                    <div className="ai-box-header">
                                        <span className="ai-box-icon">🍽️</span>
                                        <span className="ai-box-title">Food & Timing</span>
                                    </div>
                                    <p className="ai-box-text">{medicine.foodInteractions}</p>
                                </div>
                            )}

                            {/* Key Warnings */}
                            {medicine.keyWarnings?.length > 0 && (
                                <div className="ai-detail-box warnings">
                                    <div className="ai-box-header">
                                        <span className="ai-box-icon">⚠️</span>
                                        <span className="ai-box-title">Important Warnings</span>
                                    </div>
                                    <ul className="ai-box-list">
                                        {medicine.keyWarnings.map((warning, i) => (
                                            <li key={i}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Common Side Effects */}
                            {medicine.commonSideEffects?.length > 0 && (
                                <div className="ai-detail-box side-effects">
                                    <div className="ai-box-header">
                                        <span className="ai-box-icon">📋</span>
                                        <span className="ai-box-title">Possible Side Effects</span>
                                    </div>
                                    <ul className="ai-box-list">
                                        {medicine.commonSideEffects.map((effect, i) => (
                                            <li key={i}>{effect}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="ai-disclaimer">
                                <span>ℹ️</span>
                                <p>This information is AI-generated for educational purposes. Always follow your doctor's instructions.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {onInfoClick && (
                <button
                    className="medicine-info-btn"
                    onClick={() => onInfoClick(medicine.name)}
                >
                    Learn more about this medicine →
                </button>
            )}
        </div>
    );
}

export default MedicineCard;
