import { useState, useRef } from 'react';
import './UploadBox.css';
import WebcamCapture from './WebcamCapture';

function UploadBox({ onUpload, isLoading = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const [showWebcam, setShowWebcam] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Check if running on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file) => {
        setFileName(file.name);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Call parent handler
        if (onUpload) {
            onUpload(file);
        }
    };

    const handleBrowseClick = (e) => {
        e.stopPropagation();
        if (!isLoading) {
            fileInputRef.current?.click();
        }
    };

    const handleCameraClick = (e) => {
        e.stopPropagation();
        if (!isLoading) {
            if (isMobile) {
                // On mobile, use native camera input
                cameraInputRef.current?.click();
            } else {
                // On desktop, open webcam modal
                setShowWebcam(true);
            }
        }
    };

    const handleWebcamCapture = (file) => {
        handleFile(file);
        setShowWebcam(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setPreview(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    return (
        <>
            <div
                className={`upload-box ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''} ${isLoading ? 'loading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* File Upload Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileInput}
                    className="upload-input"
                    disabled={isLoading}
                />

                {/* Camera Capture Input - Uses back camera on mobile */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="upload-input"
                    disabled={isLoading}
                />

                {preview ? (
                    <div className="upload-preview">
                        <img src={preview} alt="Prescription preview" className="preview-image" />
                        <div className="preview-overlay">
                            <span className="preview-filename">{fileName}</span>
                            {!isLoading && (
                                <button className="preview-clear" onClick={handleClear}>
                                    ✕ Remove
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <h3 className="upload-title">Upload Prescription</h3>
                        <p className="upload-subtitle">
                            Drag & drop your prescription image here
                        </p>

                        {/* Action Buttons */}
                        <div className="upload-actions">
                            <button className="upload-btn browse" onClick={handleBrowseClick} disabled={isLoading}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                                Browse Files
                            </button>
                            <button className="upload-btn camera" onClick={handleCameraClick} disabled={isLoading}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                Take Photo
                            </button>
                        </div>

                        <p className="upload-hint">
                            Supports JPG, JPEG, PNG (max 5MB)
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className="upload-loading-overlay">
                        <div className="upload-loading-spinner" />
                        <p>Processing your prescription...</p>
                    </div>
                )}
            </div>

            {/* Webcam Modal (Desktop only) */}
            <WebcamCapture
                isOpen={showWebcam}
                onClose={() => setShowWebcam(false)}
                onCapture={handleWebcamCapture}
            />
        </>
    );
}

export default UploadBox;
