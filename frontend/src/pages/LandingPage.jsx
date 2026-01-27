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
                            <div className="pill-icon">
                                <div className="pill-top"></div>
                                <div className="pill-bottom"></div>
                            </div>
                        </div>
                        <span className="brand-text">Prescripto</span>
                    </div>
                    <div className="nav-center">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <a href="#about" className="nav-link">About</a>
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
                <div className="hero-bg-effects">
                    <div className="hero-glow glow-1"></div>
                    <div className="hero-glow glow-2"></div>
                </div>
                <div className="landing-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            <span>AI-Powered Prescription Analysis</span>
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
                                Start Analyzing →
                            </Link>
                            <a href="#how-it-works" className="cta-btn secondary">
                                See How It Works
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-value">95%</span>
                                <span className="stat-label">OCR Accuracy</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">13+</span>
                                <span className="stat-label">Languages</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-value">Free</span>
                                <span className="stat-label">To Use</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Light Background */}
            <section className="features-light" id="features">
                <div className="landing-container">
                    <div className="features-light-grid">
                        <div className="feature-light-card">
                            <div className="feature-light-icon blue">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Smart OCR</h3>
                            <p>Reads handwritten prescriptions accurately</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon green">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>AI Explained</h3>
                            <p>Medical terms simplified for everyone</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon yellow">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <h3>13+ Languages</h3>
                            <p>Hindi, Tamil, Telugu, Bengali & more</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Dark Background */}
            <section className="how-it-works" id="how-it-works">
                <div className="landing-container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Three simple steps to understand your prescription</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17,8 12,3 7,8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3>Upload</h3>
                            <p>Take a photo or upload an image of your prescription</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Analyze</h3>
                            <p>Our AI reads and extracts all information from your prescription</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon purple">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3>Understand</h3>
                            <p>Get simple explanations of medicines, dosages, and warnings</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="landing-container">
                    <div className="footer-main">
                        <div className="footer-brand-section">
                            <div className="footer-logo">
                                <div className="pill-icon large">
                                    <div className="pill-top"></div>
                                    <div className="pill-bottom"></div>
                                </div>
                                <span className="footer-brand-text">Prescripto</span>
                            </div>
                            <p className="footer-tagline">Making prescriptions understandable for everyone. Powered by AI.</p>
                            <div className="footer-social">
                                <a href="#" className="social-link">𝕏</a>
                                <a href="#" className="social-link">in</a>
                                <a href="#" className="social-link">📧</a>
                            </div>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#how-it-works">How it Works</a>
                                <a href="#">Pricing</a>
                            </div>
                            <div className="footer-col">
                                <h4>Support</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Contact Us</a>
                                <a href="#">FAQ</a>
                            </div>
                            <div className="footer-col">
                                <h4>Legal</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">Disclaimer</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Prescripto. Made with <span className="heart">❤️</span> in India.</p>
                        <p className="footer-note">Not a substitute for professional medical advice.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
