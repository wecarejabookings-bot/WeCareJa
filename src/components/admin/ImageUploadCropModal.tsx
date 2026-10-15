import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Crop, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  AlertCircle,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { cropAndResizeImage, uploadImageToSupabaseStorage } from '../../utils/imageCropResize';

interface ImageUploadCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSaved: (url: string) => void;
  currentImageUrl?: string;
  title?: string;
  defaultAspectRatio?: '16:9' | '4:3' | '1:1' | 'free';
}

export const ImageUploadCropModal: React.FC<ImageUploadCropModalProps> = ({
  isOpen,
  onClose,
  onImageSaved,
  currentImageUrl,
  title = 'Upload & Crop Image',
  defaultAspectRatio = '16:9'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(currentImageUrl || '');
  const [customUrl, setCustomUrl] = useState<string>(currentImageUrl || '');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | 'free'>(defaultAspectRatio);
  const [maxWidth, setMaxWidth] = useState<number>(800);
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessInfo(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please choose a valid image file (PNG, JPG, WebP, etc.)');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  };

  const handleApplyCropAndUpload = async () => {
    setErrorMessage(null);
    setSuccessInfo(null);
    setIsProcessing(true);

    try {
      if (activeMode === 'url') {
        if (!customUrl.trim()) {
          setErrorMessage('Please enter an image URL');
          setIsProcessing(false);
          return;
        }
        onImageSaved(customUrl.trim());
        onClose();
        return;
      }

      // Upload mode: process through canvas crop and resize
      const source = selectedFile || imagePreviewUrl;
      if (!source) {
        setErrorMessage('Please select an image file first');
        setIsProcessing(false);
        return;
      }

      // Determine height constraint based on aspect ratio
      let maxHeight = 800;
      if (aspectRatio === '16:9') maxHeight = Math.round(maxWidth * (9 / 16));
      else if (aspectRatio === '4:3') maxHeight = Math.round(maxWidth * (3 / 4));
      else if (aspectRatio === '1:1') maxHeight = maxWidth;

      const processed = await cropAndResizeImage(source, {
        maxWidth,
        maxHeight,
        mimeType: 'image/webp',
        quality: quality / 100
      });

      // Upload to Supabase Storage
      const uploaded = await uploadImageToSupabaseStorage(processed.blob, 'topic_card');

      setSuccessInfo(`Image processed (${Math.round(processed.sizeBytes / 1024)} KB) and ready!`);
      onImageSaved(uploaded.url);
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Image crop/upload error:', err);
      setErrorMessage(err.message || 'Failed to crop and upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl text-white space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{title}</h3>
              <p className="text-xs text-slate-400">Crop, optimize resolution &amp; save to cloud storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: File Upload vs Direct URL */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload &amp; Crop File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'url'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Link External Image URL</span>
          </button>
        </div>

        {/* Upload Mode Area */}
        {activeMode === 'upload' ? (
          <div className="space-y-4">
            {/* Drop / Select zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-2xl p-6 text-center cursor-pointer transition bg-white/[0.02] hover:bg-white/[0.05] space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-300 flex items-center justify-center mx-auto border border-blue-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {selectedFile ? selectedFile.name : 'Click to select picture from device'}
                </p>
                <p className="text-xs text-slate-400">
                  Supports WebP, PNG, JPG (Auto-optimized to fast-loading WebP)
                </p>
              </div>
            </div>

            {/* Live Visual Preview & Aspect Ratio Controls */}
            {imagePreviewUrl && (
              <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Image Preview &amp; Crop Frame
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">Aspect: {aspectRatio}</span>
                </div>

                {/* Aspect ratio frame preview */}
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-white/15 flex items-center justify-center">
                  <div
                    className={`relative w-full overflow-hidden transition-all duration-300 ${
                      aspectRatio === '16:9' ? 'aspect-[16/9]' :
                      aspectRatio === '4:3' ? 'aspect-[4/3]' :
                      aspectRatio === '1:1' ? 'aspect-square' :
                      'max-h-64'
                    }`}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Crop Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400/70 pointer-events-none rounded-lg" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      Target Max {maxWidth}px
                    </span>
                  </div>
                </div>

                {/* Aspect Ratio Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Ratio:</span>
                  {(['16:9', '4:3', '1:1', 'free'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        aspectRatio === r
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Resize Slider */}
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-blue-400" /> Max Width Output
                    </span>
                    <span className="font-mono text-white font-bold">{maxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="1400"
                    step="50"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Direct URL Input Mode */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Direct Image URL (e.g. Unsplash or Cloud Storage)
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setImagePreviewUrl(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {customUrl && (
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-bold block">URL Image Preview:</span>
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setErrorMessage('Could not load image from this URL. Check the link.')}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCropAndUpload}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing &amp; Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Save &amp; Apply Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
