import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function CameraCapture({ token, onScanSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // default to back camera

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      const constraints = {
        video: { facingMode: facingMode }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access denied! Please click the Lock/Info icon next to the browser address bar, set Camera permission to 'Allow', then refresh the page.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera device was detected on your system. Please connect a webcam or upload a photo instead.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError("Your camera is currently blocked or in use by another program (e.g. Zoom, Teams, or another tab). Close the other app and try again.");
      } else {
        setError(`Unable to access camera (${err.message}). Make sure you are using localhost or HTTPS, or upload a photo.`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Restart camera if facingMode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    setLoading(true);
    setError('');
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to process captured image.");
          setLoading(false);
          return;
        }
        await uploadImageFile(blob, "captured_food.jpg");
      }, 'image/jpeg', 0.85);
      
    } catch (err) {
      setError("Failed to capture image: " + err.message);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError('');
    await uploadImageFile(file, file.name);
  };

  const uploadImageFile = async (fileBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    try {
      const response = await fetch('/api/meals/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Scan failed');
      }

      setScanResult(data);
      onScanSuccess(data);
      stopCamera();
    } catch (err) {
      setError("AI Vision analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Laser line effect during scan */}
      {loading && <div className="laser-line z-20"></div>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Camera size={20} className="text-neon-lime" />
          AI Food Scanner
        </h2>
        
        {cameraActive && (
          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-neon-lime hover:bg-slate-700/80 transition-colors"
            title="Switch camera side"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
        {loading ? (
          <div className="text-center z-10 space-y-4">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-full border-4 border-neon-lime border-t-transparent animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-xl">🥗</span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-neon-lime animate-pulse">
              ANALYZING NUTRITION WITH GEMINI AI...
            </p>
          </div>
        ) : cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-8 border border-dashed border-white/20 pointer-events-none rounded-lg flex items-center justify-center">
              <div className="text-xs text-white/40 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Center food items inside viewfinder
              </div>
            </div>
          </>
        ) : scanResult ? (
          <div className="text-center p-6 space-y-3 z-10 max-w-sm">
            <div className="inline-flex p-3 rounded-full bg-neon-lime/10 text-neon-lime mb-2">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Scan Complete!</h3>
            <p className="text-2xl font-black text-neon-lime">{scanResult.food_name}</p>
            <div className="flex gap-4 justify-center text-sm text-slate-300">
              <span>{Math.round(scanResult.calories)} kcal</span>
              <span>•</span>
              <span>{Math.round(scanResult.protein)}g Protein</span>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold tracking-wide transition-colors"
            >
              Scan Another Item
            </button>
          </div>
        ) : (
          <div className="text-center p-6 space-y-4 z-10">
            <div className="inline-flex p-4 rounded-full bg-slate-800/80 text-slate-500">
              <ImageIcon size={32} />
            </div>
            <p className="text-sm text-slate-400">Stream from device webcam or drag food photo here</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-gradient-to-r from-neon-lime to-neon-lime-hover text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-neon-lime transition-all transform active:scale-95 text-sm"
              >
                <Camera size={16} /> Open Web Camera
              </button>
              
              <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm font-semibold active:scale-95">
                <Upload size={16} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Camera Action Buttons */}
      {cameraActive && !loading && (
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={capturePhoto}
            className="flex-1 max-w-xs bg-gradient-to-r from-neon-orange to-neon-orange-hover text-white font-bold py-3 px-6 rounded-xl hover:shadow-neon-orange transition-all duration-300 transform active:scale-95 text-sm"
          >
            Capture and Log Meal
          </button>
          <button
            onClick={stopCamera}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
