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
                    <div className="section-header-light">
                        <span className="section-tag">Why Choose Us</span>
                        <h2>Powerful Features for Better Understanding</h2>
                        <p>Our AI-powered platform makes it easy to decode complex medical prescriptions</p>
                    </div>
                    <div className="features-light-grid">
                        <div className="feature-light-card">
                            <div className="feature-light-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>Smart OCR Technology</h3>
                            <p>Advanced optical character recognition that accurately reads even the most challenging handwritten prescriptions from doctors.</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>AI-Powered Explanations</h3>
                            <p>Get detailed, easy-to-understand explanations of medicines, dosages, side effects, and drug interactions in plain language.</p>
                        </div>
                        <div className="feature-light-card">
                            <div className="feature-light-icon orange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <h3>13+ Regional Languages</h3>
                            <p>Understand your prescription in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and many more languages.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Dark Background */}
            <section className="how-it-works" id="how-it-works">
                <div className="landing-container">
                    <div className="section-header">
                        <span className="section-tag-dark">Simple Process</span>
                        <h2 className="gradient-title">How It Works</h2>
                        <p>Get your prescription analyzed in three simple steps — it takes less than a minute!</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <div className="step-icon green">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17,8 12,3 7,8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3>Upload Your Prescription</h3>
                            <p>Take a clear photo or upload an existing image of your prescription. Supports JPG, PNG, and PDF formats.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <div className="step-icon teal">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3>AI Analyzes Content</h3>
                            <p>Our advanced AI scans and extracts medicine names, dosages, frequency, and special instructions automatically.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <div className="step-icon purple">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3>Understand Everything</h3>
                            <p>Get clear explanations for each medicine — what it does, when to take it, potential side effects, and precautions.</p>
                        </div>
                    </div>
                    <div className="steps-cta">
                        <Link to={isAuthenticated ? "/app" : "/signup"} className="cta-btn primary">
                            Try It Now — It's Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="landing-container">
                    <div className="landing-footer-main">
                        <div className="landing-footer-brand">
                            <div className="landing-footer-logo">
                                <div className="landing-footer-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <span className="landing-footer-brand-text">Prescripto</span>
                            </div>
                            <p className="landing-footer-tagline">Making prescriptions easier to understand for everyone.</p>
                        </div>
                        <div className="landing-footer-links">
                            <div className="landing-footer-col">
                                <h4>FEATURES</h4>
                                <a href="#features">Smart OCR</a>
                                <a href="#features">AI Analysis</a>
                                <a href="#features">Multi-language</a>
                                <a href="#features">24/7 Chat Support</a>
                            </div>
                            <div className="landing-footer-col">
                                <h4>RESOURCES</h4>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">Contact Us</a>
                            </div>
                        </div>
                    </div>
                    <div className="landing-footer-bottom">
                        <p>© 2026 Prescripto. All rights reserved. Made with ❤️ in India.</p>
                        <p className="landing-footer-disclaimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            This tool is for educational purposes only. Always consult your doctor for medical advice.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
