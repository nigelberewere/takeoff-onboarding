import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Trash2, CheckCircle2, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { CameraModal } from './CameraModal';
import type { DocumentUploadItem } from '../types';

interface FileUploaderProps {
  item: DocumentUploadItem;
  title: string;
  subtitle?: string;
  accept?: string;
  isSelfie?: boolean;
  onFileSelect: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  required?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  item,
  title,
  subtitle,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  isSelfie = false,
  onFileSelect,
  onRemove,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const hasFile = Boolean(item.file || item.uploadedUrl || item.previewUrl);
  const displayPreview = item.previewUrl || item.uploadedUrl;
  const isPdf = item.fileName?.toLowerCase().endsWith('.pdf');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please upload a file smaller than 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect(file, previewUrl);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-2">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-200">
            {title} {required && <span className="text-brand-500 font-bold">*</span>}
          </span>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {hasFile && !item.isUploading && (
          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        )}
      </div>

      {/* Upload Zone or Uploaded Preview */}
      {!hasFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
            isDragOver
              ? 'border-brand-500 bg-brand-500/10 shadow-glow'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <UploadCloud className="w-6 h-6 text-brand-400" />
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-200 font-medium">
                Drag and drop file here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-brand-400 hover:text-brand-300 underline font-semibold focus:outline-none"
                >
                  browse device
                </button>
              </p>
              <p className="text-xs text-slate-400">
                Supports JPG, PNG, WEBP, or PDF up to 10MB
              </p>
            </div>

            {/* Quick Camera Trigger */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-brand-400" />
              <span>{isSelfie ? 'Open Selfie Camera' : 'Snap with Camera'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Uploaded Item State */
        <div className="relative logistics-card p-3.5 border border-slate-800 bg-slate-900/90 rounded-2xl flex items-center justify-between group">
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* Thumbnail Preview */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center">
              {displayPreview && !isPdf ? (
                <img
                  src={displayPreview}
                  alt={item.fileName || title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-7 h-7 text-brand-400" />
              )}
              {item.isUploading && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-brand-400 animate-spin" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">
                {item.fileName || title}
              </p>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
                {item.fileSize && <span>•</span>}
                <span className="text-emerald-400">Verified format</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace document"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </button>
            <button
              type="button"
              onClick={onRemove}
              title="Delete document"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      )}

      {item.error && (
        <p className="text-xs text-rose-400 flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{item.error}</span>
        </p>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file, previewUrl) => {
          onFileSelect(file, previewUrl);
        }}
        title={isSelfie ? 'Driver Identity Selfie' : `Capture ${title}`}
        isSelfie={isSelfie}
      />
    </div>
  );
};
