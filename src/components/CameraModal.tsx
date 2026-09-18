import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
  title?: string;
  isSelfie?: boolean;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Photo',
  isSelfie = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCapturedBlob(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, isSelfie]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isSelfie ? 'user' : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings or upload a file directly.'
          : 'Unable to access camera on this device. You can upload a photo file instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If selfie, mirror image back to natural orientation
      if (isSelfie) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCapturedBlob(blob);
            setCapturedImage(url);
          }
        },
        'image/jpeg',
        0.9
      );
    }
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedBlob(null);
  };

  const handleConfirm = () => {
    if (capturedBlob && capturedImage) {
      const fileName = `${isSelfie ? 'selfie' : 'document'}_${Date.now()}.jpg`;
      const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
      onCapture(file, capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-brand-500" />
            <h3 className="font-display font-semibold text-slate-100 text-base sm:text-lg">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black aspect-video sm:aspect-square max-h-[380px] flex items-center justify-center overflow-hidden">
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150" />
          )}

          {cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm text-slate-300">{cameraError}</p>
              <Button variant="secondary" size="sm" onClick={startCamera}>
                Try Again
              </Button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isSelfie ? 'transform -scale-x-100' : ''}`}
              />

              {/* Guidelines Overlay */}
              {isSelfie ? (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-48 h-60 border-2 border-dashed border-brand-500/70 rounded-[50%] flex items-center justify-center shadow-glow">
                    <span className="text-[11px] text-brand-300 font-medium bg-slate-950/70 px-2.5 py-1 rounded-full">
                      Align Face in Oval
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-4/5 h-3/5 border-2 border-dashed border-brand-500/70 rounded-2xl flex items-center justify-center shadow-glow">
                    <span className="text-[11px] text-brand-300 font-medium bg-slate-950/70 px-2.5 py-1 rounded-full">
                      Align Document Edges
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Controls */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {capturedImage
              ? 'Previewing photo. Does this look clear?'
              : isSelfie
              ? 'Position your face clearly with good lighting.'
              : 'Hold document steady without glare.'}
          </p>

          <div className="flex items-center space-x-2">
            {capturedImage ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRetake} icon={RefreshCw} iconPosition="left">
                  Retake
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirm} icon={Check} iconPosition="left">
                  Use Photo
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                disabled={Boolean(cameraError)}
                onClick={handleSnap}
                icon={Camera}
                iconPosition="left"
              >
                Snap Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
