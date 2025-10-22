import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './BulkImageUpload.css';

const BulkImageUpload = ({ 
  onBulkUploadComplete,
  batchId = null 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [batchName, setBatchName] = useState('');

  const generateBatchId = () => {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  const uploadSingleImage = async (file, index, currentBatchId) => {
    try {
      const resizedFile = await resizeImage(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `bulk-${currentBatchId}-${index}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('member-images')
        .upload(fileName, resizedFile);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('member-images')
        .getPublicUrl(fileName);
        
      return {
        success: true,
        fileName: file.name,
        url: publicUrl,
        storagePath: fileName,
        batchId: currentBatchId
      };
    } catch (error) {
      return {
        success: false,
        fileName: file.name,
        error: error.message,
        batchId: currentBatchId
      };
    }
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setError(null);
      setResults([]);
      handleBulkUpload(files);
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
    if (files.length > 0) {
      setError(null);
      setResults([]);
      handleBulkUpload(files);
    }
  };

  const handleBulkUpload = async (files) => {
    const currentBatchId = batchId || generateBatchId();
    const batchNameValue = batchName || `Bulk Upload ${new Date().toLocaleDateString()}`;
    
    setUploading(true);
    setProgress(0);
    setResults([]);
    setError(null);
    
    const uploadResults = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          uploadResults.push({
            success: false,
            fileName: file.name,
            error: 'Not a valid image file',
            batchId: currentBatchId
          });
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for bulk
          uploadResults.push({
            success: false,
            fileName: file.name,
            error: 'File size must be less than 10MB',
            batchId: currentBatchId
          });
          continue;
        }
        
        const result = await uploadSingleImage(file, i, currentBatchId);
        uploadResults.push(result);
        
        setProgress(((i + 1) / files.length) * 100);
        setResults([...uploadResults]);
      }
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save upload records to database
      const bulkUploadRecords = uploadResults.map(result => ({
        upload_batch_id: currentBatchId,
        file_name: result.fileName,
        image_url: result.url || null,
        status: result.success ? 'success' : 'error',
        error_message: result.error || null,
        uploaded_by: user?.id
      }));
      
      const { error: dbError } = await supabase
        .from('bulk_uploads')
        .insert(bulkUploadRecords);
        
      if (dbError) {
        console.error('Database error:', dbError);
        setError(`Upload completed but failed to save records: ${dbError.message}`);
      }
      
      setUploading(false);
      onBulkUploadComplete(uploadResults, currentBatchId);
      
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setError(null);
    setProgress(0);
    const fileInput = document.getElementById('bulk-image-upload');
    fileInput.value = '';
  };

  const downloadResults = () => {
    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);
    
    const report = {
      batchId: results[0]?.batchId,
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      successful: successfulUploads.length,
      failed: failedUploads.length,
      successfulUploads: successfulUploads.map(r => ({
        fileName: r.fileName,
        url: r.url,
        storagePath: r.storagePath
      })),
      failedUploads: failedUploads.map(r => ({
        fileName: r.fileName,
        error: r.error
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-upload-report-${results[0]?.batchId || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successfulUploads = results.filter(r => r.success);
  const failedUploads = results.filter(r => !r.success);

  return (
    <div className="bulk-image-upload-container">
      <div className="bulk-upload-header">
        <h3>Bulk Image Upload</h3>
        <p>Upload multiple images at once for processing and distribution</p>
      </div>

      <div className="batch-info">
        <label htmlFor="batch-name">Batch Name (Optional):</label>
        <input
          id="batch-name"
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Enter batch name for organization"
          className="batch-name-input"
        />
      </div>

      <div 
        className={`bulk-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="bulk-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="file-input"
        />
        
        <div className="upload-placeholder">
          <div className="upload-icon">📁</div>
          <p>Drag & drop multiple images here, or click to select</p>
          <p className="upload-hint">
            No limit on files • 10MB each • JPEG, PNG, WebP
          </p>
        </div>
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      {uploading && (
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

      {results.length > 0 && (
        <div className="upload-results">
          <div className="results-header">
            <h4>Upload Results</h4>
            <div className="results-actions">
              <button onClick={downloadResults} className="download-button">
                📥 Download Report
              </button>
              <button onClick={handleClearResults} className="clear-button">
                Clear Results
              </button>
            </div>
          </div>
          
          <div className="results-summary">
            <div className="summary-item success">
              <span className="summary-number">{successfulUploads.length}</span>
              <span className="summary-label">Successful</span>
            </div>
            <div className="summary-item error">
              <span className="summary-number">{failedUploads.length}</span>
              <span className="summary-label">Failed</span>
            </div>
            <div className="summary-item total">
              <span className="summary-number">{results.length}</span>
              <span className="summary-label">Total</span>
            </div>
          </div>

          <div className="results-details">
            {successfulUploads.length > 0 && (
              <div className="success-section">
                <h5>✅ Successful Uploads ({successfulUploads.length})</h5>
                <div className="success-list">
                  {successfulUploads.map((result, index) => (
                    <div key={index} className="result-item success">
                      <span className="file-name">{result.fileName}</span>
                      <span className="file-status">✅</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {failedUploads.length > 0 && (
              <div className="error-section">
                <h5>❌ Failed Uploads ({failedUploads.length})</h5>
                <div className="error-list">
                  {failedUploads.map((result, index) => (
                    <div key={index} className="result-item error">
                      <span className="file-name">{result.fileName}</span>
                      <span className="error-message">{result.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImageUpload;
