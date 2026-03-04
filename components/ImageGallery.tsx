'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Trash2, GripVertical } from 'lucide-react';

interface Image {
  id: string;
  filename: string;
  url: string;
  size: number;
}

interface ImageGalleryProps {
  images: Image[];
  onUpload: (file: File) => Promise<string>;
  onDelete: (imageId: string) => Promise<void>;
  onReorder: (images: Image[]) => void;
  maxImages?: number;
}

export default function ImageGallery({
  images,
  onUpload,
  onDelete,
  onReorder,
  maxImages = 5,
}: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Formato inválido. Use JPG, PNG ou WebP.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Arquivo muito grande. Máximo 5MB.';
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} imagens permitidas`);
      return;
    }

    await uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

    if (files.length === 0) {
      setError('Nenhuma imagem detectada');
      return;
    }

    for (const file of files) {
      if (images.length >= maxImages) break;
      const validationError = validateFile(file);
      if (!validationError) {
        await uploadFile(file);
      }
    }
  }, [images.length, maxImages]);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      setUploadProgress(30);
      const filename = await onUpload(file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await onDelete(imageId);
    } catch (err) {
      setError('Erro ao deletar imagem');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropReorder = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onReorder(newImages);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#9400FF] flex items-center gap-2">
          📸 IMAGENS {images.length > 0 && <span className="text-gray-400">({images.length}/{maxImages})</span>}
        </h3>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border-l-4 border-red-500 bg-red-500/10 text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Existing Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDropReorder(index)}
              className={`relative group cursor-grab active:cursor-grabbing ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <img
                src={image.url}
                alt={`Post image ${index + 1}`}
                className="w-full h-24 object-cover rounded border border-[#9400FF] hover:border-[#00FF00] transition-colors"
              />
              
              {/* Drag handle */}
              <div className="absolute top-1 left-1 bg-black/50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} className="text-[#9400FF]" />
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Deletar imagem"
              >
                <Trash2 size={14} className="text-white" />
              </button>

              {/* File size */}
              <span className="absolute bottom-1 right-1 bg-black/70 text-[#00FF00] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {(image.size / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Otimizando imagem...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-[#1A0B2E] rounded border border-[#9400FF] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9400FF] to-[#00FF00] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop Zone or File Picker */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#9400FF] rounded-lg p-8 text-center hover:border-[#00FF00] hover:bg-[#0A0015]/30 transition-colors cursor-pointer group"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="gallery-input"
            disabled={isUploading}
          />
          <label htmlFor="gallery-input" className="cursor-pointer block">
            <Upload className="mx-auto text-[#9400FF] group-hover:text-[#00FF00] transition-colors mb-2" size={32} />
            <p className="text-[#9400FF] font-semibold mb-1">Solte arquivos aqui</p>
            <p className="text-gray-500 text-sm">ou clique para selecionar</p>
            <p className="text-gray-600 text-xs mt-2">JPG, PNG, WebP - máx 5MB</p>
          </label>
        </div>
      )}

      {images.length >= maxImages && (
        <div className="p-3 rounded border border-[#9400FF]/50 bg-[#9400FF]/5 text-gray-400 text-sm text-center">
          Limite de {maxImages} imagens atingido
        </div>
      )}
    </div>
  );
}
