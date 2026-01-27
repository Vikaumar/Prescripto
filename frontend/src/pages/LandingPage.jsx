import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-container">
                    <div className="nav-brand">
                        <div className="nav-logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </div>
                        <span>Prescripto</span>
                    </div>
                    <div className="nav-links">
                        {isAuthenticated ? (
                            <Link to="/app" className="nav-btn primary">Go to App →</Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-btn secondary">Login</Link>
                                <Link to="/signup" className="nav-btn primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="landing-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span>🚀</span> Powered by AI
                        </div>
                        <h1 className="hero-title">
                            Understand Your
                            <span className="gradient-text"> Prescription</span>
                            <br />in Simple Words
                        </h1>
                        <p className="hero-subtitle">
                            Upload your prescription and get AI-powered explanations of your medicines,
                            dosages, side effects, and more. No more confusion about medical terms.
                        </p>
                        <div className="hero-cta">
                            <Link to={isAuthenticated ? "/app" : "/signup"} className="cta-btn primary">
                                <span>Start Analyzing</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <a href="#features" className="cta-btn secondary">
                                Learn More
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">95%</span>
                                <span className="stat-label">OCR Accuracy</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Medicines</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">Free</span>
                                <span className="stat-label">To Use</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="mock-prescription">
                                <div className="mock-header">
                                    <span className="mock-icon">📋</span>
                                    <span>Prescription</span>
                                </div>
                                <div className="mock-lines">
                                    <div className="mock-line long"></div>
                                    <div className="mock-line medium"></div>
                                    <div className="mock-line short"></div>
                                </div>
                                <div className="mock-arrow">→</div>
                                <div className="mock-result">
                                    <div className="result-item">💊 Paracetamol 500mg</div>
                                    <div className="result-item">⏰ Twice daily</div>
                                    <div className="result-item">📅 5 days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="landing-container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Three simple steps to understand your prescription</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon upload">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17,8 12,3 7,8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3>Upload</h3>
                            <p>Take a photo or upload an image of your prescription</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon analyze">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Analyze</h3>
                            <p>Our AI reads and extracts all information from your prescription</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon understand">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
                                    <path d="M8 6a4 4 0 0 1 8 0" />
                                    <rect x="3" y="14" width="18" height="8" rx="2" />
                                </svg>
                            </div>
                            <h3>Understand</h3>
                            <p>Get simple explanations of medicines, dosages, and warnings</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="landing-container">
                    <div className="cta-card">
                        <h2>Ready to Understand Your Prescription?</h2>
                        <p>Join thousands of users who have made their prescriptions clearer</p>
                        <Link to={isAuthenticated ? "/app" : "/signup"} className="cta-btn primary large">
                            Get Started Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-logo">💊</span>
                            <span>Prescripto</span>
                        </div>
                        <p>© 2026 Prescripto. Made with ❤️ in India.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
