import { useState, useRef, useEffect } from 'react';
import './WebcamCapture.css';

function WebcamCapture({ isOpen, onClose, onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            setError(null);
            setIsReady(false);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Prefer back camera on mobile
                },
                audio: false
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsReady(true);
                };
            }
        } catch (err) {
            console.error('Camera access error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please allow camera permissions.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found on this device.');
            } else {
                setError('Failed to access camera. Please try again.');
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsReady(false);
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                // Create a File object from the blob
                const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, {
                    type: 'image/jpeg'
                });
                onCapture(file);
                onClose();
            }
        }, 'image/jpeg', 0.9);
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="webcam-overlay" onClick={handleClose}>
            <div className="webcam-modal" onClick={(e) => e.stopPropagation()}>
                <div className="webcam-header">
                    <h3>Take Photo</h3>
                    <button className="webcam-close" onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="webcam-content">
                    {error ? (
                        <div className="webcam-error">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p>{error}</p>
                            <button className="webcam-retry" onClick={startCamera}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="webcam-video-container">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="webcam-video"
                                />
                                {!isReady && (
                                    <div className="webcam-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Starting camera...</p>
                                    </div>
                                )}
                                <div className="webcam-frame"></div>
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </>
                    )}
                </div>

                <div className="webcam-actions">
                    <button className="webcam-cancel" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className="webcam-capture"
                        onClick={handleCapture}
                        disabled={!isReady || error}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                        Capture
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WebcamCapture;
