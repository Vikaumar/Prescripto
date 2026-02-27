import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPharmacies } from '../services/api';
import PharmacyCard from '../components/PharmacyCard';
import PriceComparisonModal from '../components/PriceComparisonModal';
import RefillRequestModal from '../components/RefillRequestModal';
import './PharmacyPage.css';

function PharmacyPage() {
    const navigate = useNavigate();

    const [pharmacies, setPharmacies] = useState([]);
    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationStatus, setLocationStatus] = useState('requesting'); // requesting, granted, denied

    // Modal states
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showRefillModal, setShowRefillModal] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [initialMedicine, setInitialMedicine] = useState('');

    useEffect(() => {
        fetchPharmacies();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPharmacies(pharmacies);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredPharmacies(
                pharmacies.filter(
                    (ph) =>
                        ph.name.toLowerCase().includes(query) ||
                        ph.address.toLowerCase().includes(query) ||
                        ph.type?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, pharmacies]);

    const fetchPharmacies = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get user location
            let lat = 28.6139; // Default: Delhi
            let lng = 77.2090;

            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: false,
                        });
                    });
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    setLocationStatus('granted');
                } catch {
                    setLocationStatus('denied');
                }
            } else {
                setLocationStatus('denied');
            }

            const result = await searchPharmacies(lat, lng);
            setPharmacies(result.data || []);
            setFilteredPharmacies(result.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setInitialMedicine('');
        setShowPriceModal(true);
    };

    const handleRefill = () => {
        setShowRefillModal(true);
    };

    const openPharmacies = filteredPharmacies.filter((ph) => ph.isOpen);
    const closedPharmacies = filteredPharmacies.filter((ph) => !ph.isOpen);

    return (
        <div className="pharmacy-page">
            <div className="pharmacy-container">
                {/* Header */}
                <header className="pharmacy-header">
                    <div className="pharmacy-header-left">
                        <button className="pharmacy-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div>
                            <h1>Pharmacy</h1>
                            <p className="pharmacy-header-subtitle">
                                {locationStatus === 'granted' ? '📍 Showing nearby pharmacies' : '📍 Showing pharmacies in your area'}
                            </p>
                        </div>
                    </div>
                    <button className="pharmacy-refill-btn" onClick={handleRefill}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        Refill
                    </button>
                </header>

                {/* Search */}
                <div className="pharmacy-search-bar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search pharmacies by name or area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="pharmacy-quick-actions">
                    <button className="quick-action-card" onClick={() => setShowPriceModal(true)}>
                        <div className="quick-action-icon price-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <span>Compare Prices</span>
                    </button>
                    <button className="quick-action-card" onClick={handleRefill}>
                        <div className="quick-action-icon refill-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <span>Request Refill</span>
                    </button>
                    <button className="quick-action-card" onClick={() => fetchPharmacies()}>
                        <div className="quick-action-icon refresh-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                        </div>
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="pharmacy-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="pharmacy-loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="pharmacy-skeleton-card">
                                <div className="skeleton-header" />
                                <div className="skeleton-line short" />
                                <div className="skeleton-line" />
                                <div className="skeleton-actions" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && (
                    <>
                        {filteredPharmacies.length === 0 ? (
                            <div className="pharmacy-empty">
                                <div className="empty-emoji">🏪</div>
                                <h3>No pharmacies found</h3>
                                <p>{searchQuery ? 'Try a different search term' : 'Unable to load pharmacies'}</p>
                                <button className="pharmacy-retry-btn" onClick={fetchPharmacies}>
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Open pharmacies */}
                                {openPharmacies.length > 0 && (
                                    <div className="pharmacy-section">
                                        <h2 className="pharmacy-section-title">
                                            <span className="dot open" />
                                            Open Now ({openPharmacies.length})
                                        </h2>
                                        <div className="pharmacy-grid">
                                            {openPharmacies.map((pharmacy) => (
                                                <PharmacyCard
                                                    key={pharmacy.placeId}
                                                    pharmacy={pharmacy}
                                                    onCompare={handleCompare}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Closed pharmacies */}
                                {closedPharmacies.length > 0 && (
                                    <div className="pharmacy-section">
                                        <h2 className="pharmacy-section-title">
                                            <span className="dot closed" />
                                            Closed ({closedPharmacies.length})
                                        </h2>
                                        <div className="pharmacy-grid">
                                            {closedPharmacies.map((pharmacy) => (
                                                <PharmacyCard
                                                    key={pharmacy.placeId}
                                                    pharmacy={pharmacy}
                                                    onCompare={handleCompare}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <PriceComparisonModal
                isOpen={showPriceModal}
                onClose={() => setShowPriceModal(false)}
                initialMedicine={initialMedicine}
            />
            <RefillRequestModal
                isOpen={showRefillModal}
                onClose={() => setShowRefillModal(false)}
                pharmacyName={selectedPharmacy?.name || ''}
            />
        </div>
    );
}

export default PharmacyPage;
