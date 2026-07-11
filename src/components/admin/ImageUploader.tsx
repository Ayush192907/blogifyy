import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Link, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucketName?: string;
  pathPrefix?: string;
  previewMode?: 'cover' | 'contain';
  description?: string;
  acceptTypes?: string[]; // e.g. ['ico'] to restrict to ICO only
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  bucketName = 'blog-images',
  pathPrefix = 'posts',
  previewMode = 'cover',
  description,
  acceptTypes,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // 1. Validation
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = acceptTypes ?? ['jpg', 'jpeg', 'png', 'webp', 'gif', 'ico', 'svg'];
    if (!allowedExts.includes(fileExt || '')) {
      setError(`Only ${allowedExts.map(e => e.toUpperCase()).join(', ')} files are allowed.`);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    setUploading(true);

    try {
      // 2. Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

      // 3. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        let errMsg = uploadError.message;
        if (errMsg.toLowerCase().includes('bucket not found') || errMsg.toLowerCase().includes('not_found') || errMsg.toLowerCase().includes('not found')) {
          errMsg = 'Bucket "blog-images" not found. Please ensure you created a PUBLIC bucket named "blog-images" in your Supabase Dashboard -> Storage, and ran the storage_setup.sql script to enable upload permissions.';
        }
        throw new Error(errMsg);
      }

      // 4. Get Public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error('Failed to retrieve the public URL.');
      }

      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
        >
          <Link size={12} />
          {showUrlFallback ? 'Upload Image' : 'Use Image URL'}
        </button>
      </div>

      {showUrlFallback ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          {value && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2 bg-gray-50/50 dark:bg-gray-900/10">
              <img src={value} alt="Preview" className={previewMode === 'contain' ? 'max-w-full max-h-full object-contain mx-auto' : 'w-full h-full object-cover'} />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Main Drop Zone */}
          {value ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group shadow-sm flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900/10">
              <img src={value} alt="Uploaded preview" className={previewMode === 'contain' ? 'max-w-full max-h-full object-contain mx-auto' : 'w-full h-full object-cover'} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors shadow flex items-center gap-1"
                >
                  <Upload size={12} /> Change Image
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-40
                ${dragActive
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/30 dark:bg-gray-800/20'
                }
              `}
              onClick={onButtonClick}
            >
              {uploading ? (
                <div className="space-y-2 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                    Uploading image to Supabase...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Drag & drop your image here, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supports {(acceptTypes ?? ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF']).map(e => e.toUpperCase()).join(', ')} (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={buildAcceptString(acceptTypes ?? ['jpg', 'jpeg', 'png', 'webp', 'gif', 'ico', 'svg'])}
            className="hidden"
          />

          {error && (
            <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
              ⚠️ {error}
            </p>
          )}

          {description && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
