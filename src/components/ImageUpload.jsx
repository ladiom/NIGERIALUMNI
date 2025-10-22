import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './ImageUpload.css';

const ImageUpload = ({ 
  alumniId, 
  onImageUploaded, 
  currentImage = null,
  type = 'profile',
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
    }
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
  };

  const resizeImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file) => {
    try {
      validateFile(file);
      
      // Resize image for profile pictures
      const resizedFile = type === 'profile' ? await resizeImage(file) : file;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${alumniId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('member-images')
        .upload(fileName, resizedFile);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('member-images')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setError(null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setError(null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById(`image-upload-${alumniId}`);
    const file = fileInput.files[0];
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const imageUrl = await uploadImage(file);
      onImageUploaded(imageUrl);
      setUploading(false);
      setPreview(null);
      fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    const fileInput = document.getElementById(`image-upload-${alumniId}`);
    fileInput.value = '';
    setError(null);
  };

  return (
    <div className="image-upload-container">
      <div 
        className={`image-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id={`image-upload-${alumniId}`}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="file-input"
        />
        
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <button 
              type="button" 
              onClick={handleRemove}
              className="remove-preview"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Drag & drop an image here, or click to select</p>
            <p className="upload-hint">
              Max size: {maxSize / (1024 * 1024)}MB • 
              Supported: JPEG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      {preview && (
        <div className="upload-actions">
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button 
            onClick={handleRemove}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      )}

      {currentImage && !preview && (
        <div className="current-image">
          <img src={currentImage} alt="Current" className="current-image-preview" />
          <p className="current-image-label">Current image</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
