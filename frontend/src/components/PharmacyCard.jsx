import './PharmacyCard.css';

function PharmacyCard({ pharmacy, onCompare }) {
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) stars.push('★');
        if (hasHalf) stars.push('½');
        while (stars.length < 5) stars.push('☆');

        return stars.join('');
    };

    const getDirectionsUrl = (pharmacy) => {
        if (pharmacy.location?.lat && pharmacy.location?.lng) {
            return `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`;
        }
        return `https://www.google.com/maps/search/${encodeURIComponent(pharmacy.name + ' ' + pharmacy.address)}`;
    };

    return (
        <div className="pharmacy-card" id={`pharmacy-${pharmacy.placeId}`}>
            <div className="pharmacy-card-header">
                <div className="pharmacy-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                </div>
                <div className="pharmacy-info">
                    <h3 className="pharmacy-name">{pharmacy.name}</h3>
                    <span className={`pharmacy-status ${pharmacy.isOpen ? 'open' : 'closed'}`}>
                        {pharmacy.isOpen ? '● Open' : '● Closed'}
                    </span>
                </div>
            </div>

            <p className="pharmacy-address">{pharmacy.address}</p>

            <div className="pharmacy-meta">
                <div className="pharmacy-rating">
                    <span className="stars">{renderStars(pharmacy.rating)}</span>
                    <span className="rating-value">{pharmacy.rating}</span>
                    {pharmacy.totalRatings && (
                        <span className="rating-count">({pharmacy.totalRatings})</span>
                    )}
                </div>
                <div className="pharmacy-distance">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    {pharmacy.distance} km
                </div>
            </div>

            {pharmacy.type && (
                <span className="pharmacy-type-badge">{pharmacy.type}</span>
            )}

            {pharmacy.openHours && (
                <p className="pharmacy-hours">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {pharmacy.openHours}
                </p>
            )}

            <div className="pharmacy-card-actions">
                {pharmacy.phone && (
                    <a href={`tel:${pharmacy.phone}`} className="pharmacy-btn call-btn" title="Call Pharmacy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Call
                    </a>
                )}
                <a href={getDirectionsUrl(pharmacy)} target="_blank" rel="noopener noreferrer" className="pharmacy-btn directions-btn" title="Get Directions">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    Directions
                </a>
                <button className="pharmacy-btn compare-btn" onClick={() => onCompare && onCompare(pharmacy)} title="Compare Prices">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Prices
                </button>
            </div>
        </div>
    );
}

export default PharmacyCard;
