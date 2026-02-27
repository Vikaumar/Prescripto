import { useState } from 'react';
import { compareMedicinePrices } from '../services/api';
import './PriceComparisonModal.css';

function PriceComparisonModal({ isOpen, onClose, initialMedicine = '' }) {
    const [medicineName, setMedicineName] = useState(initialMedicine);
    const [priceData, setPriceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!medicineName.trim()) return;

        try {
            setLoading(true);
            setError(null);
            const result = await compareMedicinePrices(medicineName.trim());
            setPriceData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getLowestPrice = () => {
        if (!priceData?.prices?.length) return null;
        return priceData.prices[0];
    };

    if (!isOpen) return null;

    const lowestPrice = getLowestPrice();

    return (
        <div className="price-modal-overlay" onClick={onClose}>
            <div className="price-modal" onClick={(e) => e.stopPropagation()}>
                <div className="price-modal-header">
                    <div>
                        <h2>💊 Price Comparison</h2>
                        <p className="price-subtitle">Compare medicine prices across pharmacies</p>
                    </div>
                    <button className="price-close-btn" onClick={onClose}>✕</button>
                </div>

                <form className="price-search-form" onSubmit={handleSearch}>
                    <div className="price-search-input-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter medicine name (e.g. Paracetamol)"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="price-search-btn" disabled={loading || !medicineName.trim()}>
                        {loading ? 'Searching...' : 'Compare'}
                    </button>
                </form>

                {/* Quick suggestions */}
                <div className="price-suggestions">
                    {['Paracetamol', 'Amoxicillin', 'Cetirizine', 'Ibuprofen', 'Omeprazole'].map((med) => (
                        <button
                            key={med}
                            className="suggestion-chip"
                            onClick={() => {
                                setMedicineName(med);
                                handleSearch({ preventDefault: () => { } });
                            }}
                        >
                            {med}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="price-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {loading && (
                    <div className="price-loading">
                        <div className="price-skeleton" />
                        <div className="price-skeleton" />
                        <div className="price-skeleton" />
                    </div>
                )}

                {priceData && !loading && (
                    <div className="price-results">
                        <div className="price-results-header">
                            <div>
                                <h3>{priceData.genericName}</h3>
                                <span className="price-category">{priceData.category}</span>
                            </div>
                            <span className="ai-badge">AI-Estimated</span>
                        </div>

                        {lowestPrice && (
                            <div className="best-price-banner">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span>Best Price: <strong>₹{lowestPrice.finalPrice}</strong> at {lowestPrice.pharmacy}</span>
                            </div>
                        )}

                        <div className="price-list">
                            {priceData.prices.map((item, index) => (
                                <div key={index} className={`price-item ${index === 0 ? 'best' : ''}`}>
                                    <div className="price-item-info">
                                        <div className="price-item-brand">{item.brand}</div>
                                        <div className="price-item-details">
                                            {item.pack} • {item.pharmacy}
                                        </div>
                                    </div>
                                    <div className="price-item-pricing">
                                        {item.discount > 0 && (
                                            <span className="price-mrp">₹{item.mrp}</span>
                                        )}
                                        <span className="price-final">₹{item.finalPrice}</span>
                                        {item.discount > 0 && (
                                            <span className="price-discount">{item.discount}% off</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PriceComparisonModal;
