import { useState } from 'react';
import './App.css';
import UploadBox from './components/UploadBox';
import MedicineCard from './components/MedicineCard';
import LanguageSelector from './components/LanguageSelector';
import ChatBot from './components/ChatBot';
import Loader from './components/Loader';
import {
  uploadPrescription,
  analyzePrescription,
  translatePrescription,
  getMedicineInfo
} from './services/api';

function App() {
  const [step, setStep] = useState('upload'); // upload, analyzing, result
  const [prescription, setPrescription] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedData, setTranslatedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [medicineInfo, setMedicineInfo] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload prescription image
      const uploadResult = await uploadPrescription(file);
      setPrescription(uploadResult.data);
      setStep('analyzing');

      // Step 2: Analyze with AI
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
  };

  const displayData = translatedData || analysis;
  const displayMedicines = translatedData?.medicines || analysis?.medicines || prescription?.medicines || [];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">💊</span>
              <h1>Prescripto</h1>
            </div>
            <p className="tagline">Understand your prescription in simple words</p>
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
                <p>Take a photo or upload an image of your prescription. We'll help you understand it.</p>
              </div>
              <UploadBox onUpload={handleUpload} isLoading={isLoading} />

              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🔍</span>
                  <h4>Smart OCR</h4>
                  <p>Reads even handwritten prescriptions</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <h4>AI Explained</h4>
                  <p>Simple explanations for medical terms</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🌐</span>
                  <h4>13+ Languages</h4>
                  <p>Translate to Hindi, Tamil, Telugu & more</p>
                </div>
              </div>
            </section>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <section className="section analyzing-section animate-fadeIn">
              <Loader size="lg" text="Analyzing your prescription with AI..." />
              <p className="analyzing-hint">This may take a few seconds</p>
            </section>
          )}

          {/* Result Step */}
          {step === 'result' && prescription && (
            <section className="section result-section animate-fadeIn">
              <div className="result-header">
                <div>
                  <h2>Your Prescription Analysis</h2>
                  <p className="text-muted">
                    Analyzed on {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="result-actions">
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    disabled={isLoading}
                  />
                  <button className="btn btn-secondary" onClick={handleStartOver}>
                    ↩ Upload Another
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="result-loading">
                  <Loader size="sm" text="Translating..." />
                </div>
              )}

              {/* Simplified Explanation */}
              {displayData?.simplifiedExplanation && (
                <div className="explanation-card">
                  <div className="explanation-header">
                    <span className="explanation-icon">💡</span>
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
                  <h4>📋 Diagnosis</h4>
                  <p>{displayData.diagnosis}</p>
                </div>
              )}

              {/* Medicine Cards */}
              <div className="medicines-section">
                <h3>Your Medicines ({displayMedicines.length})</h3>
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
                        <p className="text-muted mb-4">
                          Generic: {medicineInfo.genericName}
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
                          <h4>⚠️ Side Effects</h4>
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

              {/* Extracted Text (collapsible) */}
              <details className="extracted-text-section">
                <summary>View Original Extracted Text</summary>
                <pre className="extracted-text">{prescription.extractedText}</pre>
              </details>
            </section>
          )}
        </div>
      </main>

      {/* ChatBot - only show after upload */}
      {prescription && <ChatBot prescriptionId={prescription._id} />}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            <span className="footer-icon">🏥</span>
            Made with care for patients everywhere
          </p>
          <p className="footer-disclaimer">
            ⚠️ This app provides information for educational purposes only.
            Always consult your doctor for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
