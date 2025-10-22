import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ImageUpload from './ImageUpload';
import MultipleImageUpload from './MultipleImageUpload';
import BulkImageUpload from './BulkImageUpload';
import './AdminImageManagement.css';

const AdminImageManagement = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);

  useEffect(() => {
    fetchAlumniList();
    fetchUploadHistory();
  }, []);

  const fetchAlumniList = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni')
        .select('id, full_name, school:schools(name)')
        .order('full_name');
        
      if (error) throw error;
      setAlumniList(data || []);
    } catch (error) {
      console.error('Error fetching alumni list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setUploadHistory(data || []);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    }
  };

  const handleSingleImageUpload = async (imageUrl) => {
    if (!selectedAlumni) {
      alert('Please select an alumni first');
      return;
    }

    try {
      const { error } = await supabase
        .from('alumni')
        .update({ profile_picture: imageUrl })
        .eq('id', selectedAlumni.id);
        
      if (error) throw error;
      
      alert(`Profile picture updated for ${selectedAlumni.full_name}`);
      fetchAlumniList(); // Refresh the list
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    }
  };

  const handleMultipleImageUpload = async (imageUrls) => {
    if (!selectedAlumni) {
      alert('Please select an alumni first');
      return;
    }

    try {
      const galleryData = imageUrls.map(url => ({
        alumni_id: selectedAlumni.id,
        image_url: url,
        image_type: 'gallery'
      }));
      
      const { error } = await supabase
        .from('alumni_gallery')
        .insert(galleryData);
        
      if (error) throw error;
      
      alert(`${imageUrls.length} images added to ${selectedAlumni.full_name}'s gallery`);
    } catch (error) {
      console.error('Error adding gallery images:', error);
      alert('Failed to add gallery images');
    }
  };

  const handleBulkUploadComplete = async (results, batchId) => {
    console.log('Bulk upload completed:', results);
    fetchUploadHistory(); // Refresh upload history
    alert(`Bulk upload completed! ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed.`);
  };

  const filteredAlumni = alumniList.filter(alumni =>
    alumni.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumni.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumni.school?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'single', label: 'Single Upload', icon: '📷' },
    { id: 'multiple', label: 'Multiple Upload', icon: '🖼️' },
    { id: 'bulk', label: 'Bulk Upload', icon: '📁' },
    { id: 'history', label: 'Upload History', icon: '📊' }
  ];

  return (
    <div className="admin-image-management">
      <div className="admin-header">
        <h2>Image Management</h2>
        <p>Upload and manage images for alumni profiles</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'single' && (
          <div className="single-upload-section">
            <div className="alumni-selector">
              <h3>Select Alumni for Profile Picture</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search alumni by name, ID, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              {loading ? (
                <div className="loading">Loading alumni list...</div>
              ) : (
                <div className="alumni-list">
                  {filteredAlumni.map(alumni => (
                    <div
                      key={alumni.id}
                      className={`alumni-item ${selectedAlumni?.id === alumni.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      <div className="alumni-info">
                        <div className="alumni-name">{alumni.full_name}</div>
                        <div className="alumni-details">
                          <span className="alumni-id">{alumni.id}</span>
                          {alumni.school?.name && (
                            <span className="alumni-school">{alumni.school.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedAlumni && (
              <div className="upload-section">
                <h3>Upload Profile Picture for {selectedAlumni.full_name}</h3>
                <ImageUpload
                  alumniId={selectedAlumni.id}
                  onImageUploaded={handleSingleImageUpload}
                  type="profile"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'multiple' && (
          <div className="multiple-upload-section">
            <div className="alumni-selector">
              <h3>Select Alumni for Gallery Images</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search alumni by name, ID, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              {loading ? (
                <div className="loading">Loading alumni list...</div>
              ) : (
                <div className="alumni-list">
                  {filteredAlumni.map(alumni => (
                    <div
                      key={alumni.id}
                      className={`alumni-item ${selectedAlumni?.id === alumni.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      <div className="alumni-info">
                        <div className="alumni-name">{alumni.full_name}</div>
                        <div className="alumni-details">
                          <span className="alumni-id">{alumni.id}</span>
                          {alumni.school?.name && (
                            <span className="alumni-school">{alumni.school.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedAlumni && (
              <div className="upload-section">
                <h3>Upload Gallery Images for {selectedAlumni.full_name}</h3>
                <MultipleImageUpload
                  alumniId={selectedAlumni.id}
                  onImagesUploaded={handleMultipleImageUpload}
                  maxFiles={20}
                  type="gallery"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="bulk-upload-section">
            <h3>Bulk Image Upload</h3>
            <p>Upload multiple images for processing and distribution to alumni profiles</p>
            <BulkImageUpload onBulkUploadComplete={handleBulkUploadComplete} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="upload-history-section">
            <h3>Upload History</h3>
            <div className="history-table">
              <div className="table-header">
                <div className="header-cell">Batch ID</div>
                <div className="header-cell">File Name</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Uploaded By</div>
                <div className="header-cell">Date</div>
              </div>
              {uploadHistory.map((record, index) => (
                <div key={index} className="table-row">
                  <div className="table-cell">{record.upload_batch_id}</div>
                  <div className="table-cell">{record.file_name}</div>
                  <div className={`table-cell status ${record.status}`}>
                    {record.status === 'success' ? '✅' : '❌'}
                  </div>
                  <div className="table-cell">{record.uploaded_by}</div>
                  <div className="table-cell">
                    {new Date(record.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImageManagement;
