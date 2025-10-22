import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './MultipleImageUpload.css';

const MultipleImageUpload = ({ 
  alumniId, 
  onImagesUploaded, 
  maxFiles = 10,
  currentImages = [],
  type = 'gallery'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not a valid image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }
      if (validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return [];
    }

    return validFiles;
  };

  const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
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

  const uploadMultipleImages = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const resizedFile = await resizeImage(file);
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${alumniId}-${Date.now()}-${index}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('member-images')
          .upload(fileName, resizedFile);
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('member-images')
          .getPublicUrl(fileName);
          
        return { success: true, url: publicUrl, fileName: file.name };
      } catch (error) {
        return { success: false, error: error.message, fileName: file.name };
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      setError(null);
      const newPreviews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPreviews(newPreviews);
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
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      setError(null);
      const newPreviews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPreviews(newPreviews);
    }
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const files = previews.map(p => p.file);
      const results = await uploadMultipleImages(files);
      
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);
      
      if (successfulUploads.length > 0) {
        const imageUrls = successfulUploads.map(r => r.url);
        onImagesUploaded(imageUrls);
        
        // Save to database
        const galleryData = imageUrls.map(url => ({
          alumni_id: alumniId,
          image_url: url,
          image_type: type
        }));
        
        const { error: dbError } = await supabase
          .from('alumni_gallery')
          .insert(galleryData);
          
        if (dbError) throw dbError;
      }
      
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(r => `${r.fileName}: ${r.error}`);
        setError(`Some uploads failed:\n${errorMessages.join('\n')}`);
      }
      
      if (successfulUploads.length > 0) {
        setPreviews([]);
        setProgress(100);
        setTimeout(() => setProgress(0), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleClearAll = () => {
    setPreviews([]);
    setError(null);
    const fileInput = document.getElementById(`multiple-image-upload-${alumniId}`);
    fileInput.value = '';
  };

  return (
    <div className="multiple-image-upload-container">
      <div 
        className={`multiple-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id={`multiple-image-upload-${alumniId}`}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="file-input"
        />
        
        {previews.length > 0 ? (
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview.preview} alt={`Preview ${index}`} className="preview-image" />
                <button 
                  type="button" 
                  onClick={() => handleRemovePreview(index)}
                  className="remove-preview"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Drag & drop multiple images here, or click to select</p>
            <p className="upload-hint">
              Max {maxFiles} files • 5MB each • JPEG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <pre>{error}</pre>
        </div>
      )}

      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {previews.length > 0 && (
        <div className="upload-actions">
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Images`}
          </button>
          <button 
            onClick={handleClearAll}
            className="clear-button"
          >
            Clear All
          </button>
        </div>
      )}

      {currentImages.length > 0 && (
        <div className="current-images">
          <h4>Current Images:</h4>
          <div className="current-images-grid">
            {currentImages.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Current ${index}`} 
                className="current-image" 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
