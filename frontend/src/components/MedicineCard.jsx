import './MedicineCard.css';

function MedicineCard({ medicine, onInfoClick }) {
    if (!medicine || !medicine.name) {
        return null;
    }

    return (
        <div className="medicine-card">
            <div className="medicine-header">
                <span className="medicine-icon">💊</span>
                <h4 className="medicine-name">{medicine.name}</h4>
            </div>

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

                {medicine.instructions && (
                    <div className="medicine-instructions">
                        <span className="instructions-label">📋 Instructions</span>
                        <p className="instructions-text">{medicine.instructions}</p>
                    </div>
                )}
            </div>

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
