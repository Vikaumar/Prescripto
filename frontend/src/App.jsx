import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';
import UploadBox from './components/UploadBox';
import MedicineCard from './components/MedicineCard';
import LanguageSelector from './components/LanguageSelector';
import ChatBot from './components/ChatBot';
import Loader from './components/Loader';
import { useAuth } from './context/AuthContext';
import { API_URL } from './config/api';
import {
  uploadPrescription,
  analyzePrescription,
  translatePrescription,
  getMedicineInfo,
  getPrescription
} from './services/api';
import { exportPrescriptionPDF, sharePrescription } from './utils/pdfExport';
import { savePrescription as cacheLocally } from './services/offlineStorage';

const SESSION_KEY = 'prescripto_session';

// Helpers to persist/restore state via sessionStorage
function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* quota exceeded or private mode */ }
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { }
}

function App() {
  // Restore persisted state on mount
  const saved = loadSession();

  const [step, setStep] = useState(saved?.step || 'upload');
  const [prescription, setPrescription] = useState(saved?.prescription || null);
  const [analysis, setAnalysis] = useState(saved?.analysis || null);
  const [selectedLanguage, setSelectedLanguage] = useState(saved?.selectedLanguage || 'en');
  const [translatedData, setTranslatedData] = useState(saved?.translatedData || null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Persist state to sessionStorage whenever key data changes
  useEffect(() => {
    if (step === 'upload' && !prescription) {
      clearSession();
    } else {
      saveSession({ step, prescription, analysis, selectedLanguage, translatedData });
    }
  }, [step, prescription, analysis, selectedLanguage, translatedData]);

  // If we refreshed during 'analyzing', re-trigger analysis from backend
  useEffect(() => {
    if (saved?.step === 'analyzing' && saved?.prescription?._id) {
      resumeAnalysis(saved.prescription._id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resumeAnalysis = async (prescriptionId) => {
    setIsLoading(true);
    setError(null);
    try {
      // First check if it was already analyzed on the backend
      const result = await getPrescription(prescriptionId);
      if (result.data.isAnalyzed) {
        setPrescription(result.data);
        setAnalysis({
          simplifiedExplanation: result.data.simplifiedExplanation,
          diagnosis: result.data.diagnosis,
          doctorNotes: result.data.doctorNotes
        });
        setStep('result');
      } else {
        // Re-trigger analysis
        const analysisResult = await analyzePrescription(prescriptionId);
        setAnalysis(analysisResult.data.analysis);
        setPrescription(analysisResult.data.prescription);
        setStep('result');
      }
    } catch (err) {
      setError('Analysis was interrupted. Please upload again.');
      setStep('upload');
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile picture when user is available
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile?.profilePicture) {
            setProfilePicture(data.profile.profilePicture);
          }
        })
        .catch(() => { }); // Silently fail
    }
  }, [user]);

  // Load prescription from URL if coming from dashboard
  useEffect(() => {
    const prescriptionId = searchParams.get('prescription');
    if (prescriptionId) {
      loadPrescriptionFromHistory(prescriptionId);
    }
  }, [searchParams]);

  const loadPrescriptionFromHistory = async (prescriptionId) => {
    setIsLoading(true);
    setError(null);
    setStep('analyzing');

    try {
      const result = await getPrescription(prescriptionId);
      setPrescription(result.data);

      // If already analyzed, show results
      if (result.data.isAnalyzed) {
        setAnalysis({
          simplifiedExplanation: result.data.simplifiedExplanation,
          diagnosis: result.data.diagnosis,
          doctorNotes: result.data.doctorNotes
        });
        setStep('result');
      } else {
        // Analyze if not already done
        const analysisResult = await analyzePrescription(prescriptionId);
        setAnalysis(analysisResult.data.analysis);
        setPrescription(analysisResult.data.prescription);
        setStep('result');
      }
    } catch (err) {
      setError(err.message || 'Failed to load prescription');
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const uploadResult = await uploadPrescription(file);
      setPrescription(uploadResult.data);
      setStep('analyzing');

      const analysisResult = await analyzePrescription(uploadResult.data._id);
      setAnalysis(analysisResult.data.analysis);
      setPrescription(analysisResult.data.prescription);
      setStep('result');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language) => {
    setSelectedLanguage(language);

    if (language === 'en' || !prescription) {
      setTranslatedData(null);
      return;
    }

    setIsLoading(true);
    try {
      const result = await translatePrescription(prescription._id, language);
      setTranslatedData(result.data);
    } catch (err) {
      setError('Translation failed. Showing original text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicineInfo = async (medicineName) => {
    setIsLoading(true);
    try {
      const result = await getMedicineInfo(medicineName);
      setMedicineInfo(result.data);
    } catch (err) {
      console.error('Failed to get medicine info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep('upload');
    setPrescription(null);
    setAnalysis(null);
    setTranslatedData(null);
    setSelectedLanguage('en');
    setError(null);
    setMedicineInfo(null);
    clearSession();
  };

  // Handle PDF export
  const handleExportPDF = () => {
    if (!prescription) return;
    try {
      const fullPrescription = {
        ...prescription,
        ...analysis,
        medicines: displayMedicines
      };
      exportPrescriptionPDF(fullPrescription);
    } catch (err) {
      setError('Failed to export PDF. Please try again.');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!prescription) return;
    try {
      const shared = await sharePrescription({
        ...prescription,
        medicines: displayMedicines
      });
      if (!shared) {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch {
        setError('Unable to share. Please copy the URL manually.');
      }
    }
  };

  // Cache prescription for offline access when results are loaded
  useEffect(() => {
    if (prescription && step === 'result') {
      cacheLocally({
        ...prescription,
        ...analysis,
        medicines: displayMedicines,
        _cachedAt: new Date().toISOString()
      }).catch(() => { }); // Silently fail
    }
  }, [prescription, step, analysis]);

  const displayData = translatedData || analysis;
  const displayMedicines = translatedData?.medicines || analysis?.medicines || prescription?.medicines || [];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="pill-logo">
              <div className="pill-top"></div>
              <div className="pill-bottom"></div>
            </div>
            <h1>Prescripto</h1>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {user && (
          <div className="sidebar-content">
            <div className="sidebar-user">
              <div className="user-avatar large">
                {profilePicture ? (
                  <img src={profilePicture} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="sidebar-user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <nav className="sidebar-nav">
              <button onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </button>
              <button onClick={() => { handleLogout(); setSidebarOpen(false); }} className="logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="pill-logo">
                <div className="pill-top"></div>
                <div className="pill-bottom"></div>
              </div>
              <h1>Prescripto</h1>
            </div>
            <p className="tagline">Understand your prescription in simple words</p>

            {/* Desktop User Menu */}
            {user && (
              <div className="user-menu desktop-only">
                <div className="user-avatar">
                  {profilePicture ? (
                    <img src={profilePicture} alt={user.name} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="user-name">{user.name}</span>
                <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            {user && (
              <button className="hamburger-btn mobile-only" onClick={() => setSidebarOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <section className="section upload-section animate-fadeIn">
              <div className="section-header">
                <h2>Upload Your Prescription</h2>
                <p>Take a photo or upload an image of your prescription and we'll help you understand it in simple language.</p>
              </div>
              <UploadBox onUpload={handleUpload} isLoading={isLoading} />

              <div className="features">
                <div className="feature">
                  <div className="feature-icon ocr">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h4>Smart OCR</h4>
                  <p>Reads handwritten prescriptions accurately</p>
                </div>
                <div className="feature">
                  <div className="feature-icon ai">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
                      <path d="M8 6a4 4 0 0 1 8 0" />
                      <path d="M12 2v4" />
                      <rect x="3" y="14" width="18" height="8" rx="2" />
                      <path d="M7 14v4" />
                      <path d="M12 14v4" />
                      <path d="M17 14v4" />
                    </svg>
                  </div>
                  <h4>AI Explained</h4>
                  <p>Medical terms simplified for everyone</p>
                </div>
                <div className="feature">
                  <div className="feature-icon lang">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <h4>13+ Languages</h4>
                  <p>Hindi, Tamil, Telugu, Bengali & more</p>
                </div>
              </div>
            </section>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <section className="section analyzing-section animate-fadeIn">
              <Loader size="lg" text="Analyzing your prescription..." />
              <p className="analyzing-hint">This may take a few seconds</p>
            </section>
          )}

          {/* Result Step */}
          {step === 'result' && prescription && (
            <section className="section result-section animate-fadeInUp">
              <div className="result-header">
                <div>
                  <h2>Your Prescription</h2>
                  <p className="text-muted text-sm">
                    Analyzed on {new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="result-actions">
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    disabled={isLoading}
                  />
                  <button className="btn btn-icon" onClick={handleExportPDF} title="Download PDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button className="btn btn-icon" onClick={handleShare} title="Share">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                  <button className="btn btn-secondary" onClick={handleStartOver}>
                    ← New Upload
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="result-loading">
                  <Loader size="sm" text="Translating..." />
                </div>
              )}

              {/* Prescription Info Card - Patient, Doctor, Hospital, Date */}
              {(displayData?.patientInfo || displayData?.doctorInfo || displayData?.prescriptionDate) && (
                <div className="prescription-info-card">
                  <div className="info-card-header">
                    <span className="info-card-icon">📋</span>
                    <h3>Prescription Details</h3>
                  </div>
                  <div className="info-card-grid">
                    {/* Doctor Info */}
                    {displayData?.doctorInfo?.name && (
                      <div className="info-item doctor">
                        <span className="info-icon">👨‍⚕️</span>
                        <div className="info-content">
                          <span className="info-label">Doctor</span>
                          <span className="info-value">{displayData.doctorInfo.name}</span>
                          {displayData.doctorInfo.qualification && (
                            <span className="info-sub">{displayData.doctorInfo.qualification}</span>
                          )}
                          {displayData.doctorInfo.specialization && (
                            <span className="info-sub">{displayData.doctorInfo.specialization}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hospital/Clinic */}
                    {displayData?.doctorInfo?.hospital && (
                      <div className="info-item hospital">
                        <span className="info-icon">🏥</span>
                        <div className="info-content">
                          <span className="info-label">Hospital/Clinic</span>
                          <span className="info-value">{displayData.doctorInfo.hospital}</span>
                        </div>
                      </div>
                    )}

                    {/* Patient Info */}
                    {displayData?.patientInfo?.name && (
                      <div className="info-item patient">
                        <span className="info-icon">👤</span>
                        <div className="info-content">
                          <span className="info-label">Patient</span>
                          <span className="info-value">{displayData.patientInfo.name}</span>
                          {(displayData.patientInfo.age || displayData.patientInfo.gender) && (
                            <span className="info-sub">
                              {displayData.patientInfo.age && `${displayData.patientInfo.age}`}
                              {displayData.patientInfo.age && displayData.patientInfo.gender && ' • '}
                              {displayData.patientInfo.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    {displayData?.prescriptionDate && (
                      <div className="info-item date">
                        <span className="info-icon">📅</span>
                        <div className="info-content">
                          <span className="info-label">Date</span>
                          <span className="info-value">{displayData.prescriptionDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Simplified Explanation */}
              {displayData?.simplifiedExplanation && (
                <div className="explanation-card">
                  <div className="explanation-header">
                    <div className="explanation-icon">💡</div>
                    <h3>In Simple Words</h3>
                  </div>
                  <p className="explanation-text">
                    {displayData.simplifiedExplanation}
                  </p>
                </div>
              )}

              {/* Diagnosis if present */}
              {displayData?.diagnosis && (
                <div className="diagnosis-card">
                  <h4>Diagnosis</h4>
                  <p>{displayData.diagnosis}</p>
                </div>
              )}

              {/* Overall Advice from AI */}
              {displayData?.overallAdvice && (
                <div className="advice-card">
                  <div className="advice-header">
                    <span className="advice-icon">📝</span>
                    <h4>Medication Guidance</h4>
                  </div>
                  <p>{displayData.overallAdvice}</p>
                </div>
              )}

              {/* Medicine Cards - Only show if medicines found */}
              {displayMedicines.length > 0 && (
                <div className="medicines-section">
                  <h3>💊 Medicines ({displayMedicines.length})</h3>
                  <div className="medicines-grid">
                    {displayMedicines.map((medicine, index) => (
                      <MedicineCard
                        key={index}
                        medicine={medicine}
                        onInfoClick={handleMedicineInfo}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Advice Section */}
              {displayData?.lifestyleAdvice?.length > 0 && (
                <div className="lifestyle-section">
                  <h3>🌿 Doctor's Advice & Recommendations</h3>
                  <div className="lifestyle-grid">
                    {displayData.lifestyleAdvice.map((item, index) => (
                      <div key={index} className="lifestyle-card">
                        <div className="lifestyle-number">{index + 1}</div>
                        <div className="lifestyle-content">
                          <p className="lifestyle-advice">{item.advice}</p>
                          <div className="lifestyle-meta">
                            {item.category && (
                              <span className="lifestyle-category">{item.category}</span>
                            )}
                            {item.frequency && (
                              <span className="lifestyle-frequency">📅 {item.frequency}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Do's and Don'ts Section */}
              {(displayData?.dosAndDonts?.dos?.length > 0 || displayData?.dosAndDonts?.donts?.length > 0) && (
                <div className="dos-donts-section">
                  <h3>✅ Do's & ❌ Don'ts</h3>
                  <div className="dos-donts-grid">
                    {displayData.dosAndDonts?.dos?.length > 0 && (
                      <div className="dos-card">
                        <h4>✅ DO</h4>
                        <ul>
                          {displayData.dosAndDonts.dos.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {displayData.dosAndDonts?.donts?.length > 0 && (
                      <div className="donts-card">
                        <h4>❌ DON'T</h4>
                        <ul>
                          {displayData.dosAndDonts.donts.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up Instructions */}
              {displayData?.followUp && (
                <div className="followup-card">
                  <div className="followup-header">
                    <span className="followup-icon">📆</span>
                    <h4>Follow-up Instructions</h4>
                  </div>
                  <p>{displayData.followUp}</p>
                </div>
              )}

              {/* No Content Message - only if no medicines AND no lifestyle advice */}
              {(!displayMedicines || displayMedicines.length === 0) &&
                (!displayData?.lifestyleAdvice || displayData.lifestyleAdvice.length === 0) && (
                  <div className="no-medicines-message">
                    <div className="no-medicines-icon">📋</div>
                    <h3>Limited Information Extracted</h3>
                    <p>We couldn't extract detailed information from your prescription. This could be because:</p>
                    <ul>
                      <li>The image quality is low or blurry</li>
                      <li>The text is handwritten and hard to read</li>
                      <li>The prescription format isn't recognized</li>
                    </ul>
                    <p>Please check the extracted text below or try uploading a clearer image.</p>
                  </div>
                )}

              {/* Medicine Info Modal */}
              {medicineInfo && (
                <div className="modal-overlay" onClick={() => setMedicineInfo(null)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>{medicineInfo.name}</h3>
                      <button className="modal-close" onClick={() => setMedicineInfo(null)}>✕</button>
                    </div>
                    <div className="modal-body">
                      {medicineInfo.genericName && (
                        <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                          Generic name: {medicineInfo.genericName}
                        </p>
                      )}
                      {medicineInfo.simpleExplanation && (
                        <div className="modal-section">
                          <h4>💡 What it does</h4>
                          <p>{medicineInfo.simpleExplanation}</p>
                        </div>
                      )}
                      {medicineInfo.uses?.length > 0 && (
                        <div className="modal-section">
                          <h4>✅ Common Uses</h4>
                          <ul>
                            {medicineInfo.uses.map((use, i) => (
                              <li key={i}>{use}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medicineInfo.sideEffects?.length > 0 && (
                        <div className="modal-section">
                          <h4>⚠️ Possible Side Effects</h4>
                          <ul>
                            {medicineInfo.sideEffects.map((effect, i) => (
                              <li key={i}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medicineInfo.precautions?.length > 0 && (
                        <div className="modal-section">
                          <h4>📌 Precautions</h4>
                          <ul>
                            {medicineInfo.precautions.map((precaution, i) => (
                              <li key={i}>{precaution}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              <details className="extracted-text-section">
                <summary>View Original Extracted Text</summary>
                <pre className="extracted-text">{prescription.extractedText}</pre>
              </details>
            </section>
          )}
        </div>
      </main>

      {/* ChatBot */}
      {prescription && <ChatBot prescriptionId={prescription._id} />}

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="app-footer-grid">
            {/* Brand Column */}
            <div className="app-footer-brand">
              <div className="app-footer-logo">
                <div className="app-footer-logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span>Prescripto</span>
              </div>
              <p className="app-footer-tagline">Making prescriptions easier to understand for everyone.</p>
            </div>

            {/* Quick Links */}
            <div className="app-footer-links">
              <h4>Features</h4>
              <ul>
                <li>Smart OCR</li>
                <li>AI Analysis</li>
                <li>Multi-language</li>
                <li>24/7 Chat Support</li>
              </ul>
            </div>

            {/* Resources */}
            <div className="app-footer-links">
              <h4>Resources</h4>
              <ul>
                <li>How It Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="app-footer-bottom">
            <p>© {new Date().getFullYear()} Prescripto. All rights reserved.</p>
            <p className="app-footer-disclaimer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              For educational purposes only. Always consult your doctor for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
