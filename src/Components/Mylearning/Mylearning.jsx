// Mylearning.jsx - CORRECTED FOR LOCAL STORAGE ONLY
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Calendar,
  PlayCircle,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Search,
  Filter,
  Award,
  Bookmark,
  GraduationCap,
  User,
  File,
  HardDrive
} from 'lucide-react';

const API_BASE_URL = 'https://edulearnbackend-ffiv.onrender.com/api';

const MyLearning = () => {
  const [learningData, setLearningData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [progressData, setProgressData] = useState({});
  const [downloadLoading, setDownloadLoading] = useState({});

  useEffect(() => {
    fetchMyLearningCourses();
    fetchLearningProgress();
  }, []);

  const fetchMyLearningCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/my-learning/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      // Add this after fetching data in fetchMyLearningCourses
if (response.ok) {
  const data = await response.json();
  console.log('Learning data received:', data);
  
  // ✅ Remove duplicate categories based on course_category
  const uniqueData = data.data.reduce((acc, current) => {
    const exists = acc.find(item => item.course_category === current.course_category);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  console.log('Unique categories:', uniqueData.map(c => c.course_category));
  setLearningData(uniqueData);
  
  if (uniqueData.length > 0) {
    setSelectedCategory(uniqueData[0]);
  }
} else {
        console.error('Failed to fetch learning courses');
        setLearningData([]);
      }
    } catch (error) {
      console.error('Error fetching learning courses:', error);
      setLearningData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/my-learning/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const progressObj = {};
        data.data?.forEach(item => {
          progressObj[item.course_category] = item;
        });
        setProgressData(progressObj);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

 const handleDocumentView = async (document) => {
  try {
    const token = localStorage.getItem('token');
    const courseId = document.course_id;
    
    if (!courseId) {
      console.error('❌ No course_id found:', document);
      alert('Cannot view document: missing course information');
      return;
    }

    const viewUrl = `${API_BASE_URL}/documents/courses/${courseId}/documents/${document._id}/view`;
    
    console.log('👁️ Viewing document via:', viewUrl);
    
    // ✅ Add token check
    if (!token) {
      console.error('❌ No token found');
      alert('Please login again');
      return;
    }
    
    const isPdf = document.file_type === 'pdf' || document.file_type?.toLowerCase() === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(document.file_type?.toLowerCase());
    
    if (isPdf || isImage) {
      // Fetch with authentication
      const response = await fetch(viewUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ View failed:', response.status, errorText);
        throw new Error(`View failed with status: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(blobUrl, '_blank');
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } else {
      // For other file types, trigger download
      await handleDocumentDownload(document);
    }
    
    // ✅ Fix: Check if selectedCategory exists before marking as completed
    if (selectedCategory?.course_category) {
      await markAsCompleted(selectedCategory.course_category, 'documents', document._id);
    } else {
      console.warn('⚠️ Cannot mark as completed - no selected category');
    }
    
  } catch (error) {
    console.error('❌ View error:', error);
    alert(`Unable to view document: ${error.message}. Please try downloading instead.`);
    // Only try download if view fails and it's not a PDF/image
    const isPdfOrImage = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(document.file_type?.toLowerCase());
    if (!isPdfOrImage) {
      await handleDocumentDownload(document);
    }
  }
};

// ✅ COMPLETELY FIXED: Document Download - Works with local storage
const handleDocumentDownload = async (document) => {
  const docId = document._id;
  setDownloadLoading(prev => ({ ...prev, [docId]: true }));

  try {
    const token = localStorage.getItem('token');
    const courseId = document.course_id;
    
    if (!courseId) {
      console.error('❌ No course_id found in document:', document);
      throw new Error('Course ID not found');
    }

    // Use the document download endpoint
    const downloadUrl = `${API_BASE_URL}/documents/courses/${courseId}/documents/${docId}/download`;
    
    console.log('📥 Downloading via:', downloadUrl);
    
    // Fetch with authentication
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Download failed:', response.status, errorText);
      throw new Error(`Download failed with status: ${response.status}`);
    }

    // Get filename from Content-Disposition header or use document title
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = '';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Fallback filename
    if (!filename) {
      filename = document.original_filename || 
                `${document.title || 'document'}.${document.file_type || 'pdf'}`;
    }

    console.log('📄 Filename for download:', filename);

    // Get the blob from response
    const blob = await response.blob();
    
    // Create download link
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
    // Mark as completed
    if (selectedCategory) {
      markAsCompleted(selectedCategory.course_category, 'documents', docId);
    }
    
  } catch (error) {
    console.error('❌ Download error:', error);
    
    // Show user-friendly error
    alert(`Download failed: ${error.message || 'Please try again or contact support'}`);
    
  } finally {
    setDownloadLoading(prev => ({ ...prev, [docId]: false }));
  }
};

  // ✅ VIDEO VIEW FUNCTION (Unchanged - works with Cloudinary)
  const handleVideoView = (video) => {
    if (!video.video_url) {
      alert('Video is not available for viewing.');
      return;
    }
    
    window.open(video.video_url, '_blank');
    markAsCompleted(selectedCategory.course_category, 'videos', video._id);
  };

  // ✅ VIDEO DOWNLOAD FUNCTION (Unchanged - works with Cloudinary)
  const handleVideoDownload = async (video) => {
    setDownloadLoading(prev => ({ ...prev, [video._id]: true }));
    
    try {
      if (video.video_url && video.video_url.includes('cloudinary.com')) {
        // Add download flag to Cloudinary URL
        const downloadUrl = video.video_url.includes('fl_attachment')
          ? video.video_url
          : video.video_url.replace('/upload/', '/upload/fl_attachment/');
        
        window.open(downloadUrl, '_blank');
      } else if (video.video_url) {
        window.open(video.video_url, '_blank');
      } else {
        alert('Video download not available.');
      }
      
      markAsCompleted(selectedCategory.course_category, 'videos', video._id);
    } catch (error) {
      console.error('Video download error:', error);
      alert('Failed to download video. Please try again.');
    } finally {
      setDownloadLoading(prev => ({ ...prev, [video._id]: false }));
    }
  };

  const markAsCompleted = async (category, materialType, materialId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/my-learning/progress/${category}/${materialType}/${materialId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        fetchMyLearningCourses();
        fetchLearningProgress();
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isMaterialCompleted = (category, materialType, materialId) => {
    const progress = progressData[category]?.progress;
    if (!progress) return false;

    switch (materialType) {
      case 'videos':
        return progress.completed_videos?.some(v => v.video_id === materialId);
      case 'documents':
        return progress.completed_documents?.some(d => d.document_id === materialId);
      case 'meetings':
        return progress.completed_meetings?.some(m => m.meeting_id === materialId);
      default:
        return false;
    }
  };

  const getTotalMaterials = (category) => {
    if (!category) return { videos: 0, documents: 0, meetings: 0, all: 0 };
    
    return {
      videos: category.materials?.videos?.length || 0,
      documents: category.materials?.documents?.length || 0,
      meetings: category.materials?.meetings?.length || 0,
      all: (category.materials?.videos?.length || 0) + 
           (category.materials?.documents?.length || 0) + 
           (category.materials?.meetings?.length || 0)
    };
  };
  // Add this helper function inside the component (before the return statement)

const getDocumentIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (type === 'pdf') return '📄';
  if (type === 'doc' || type === 'docx') return '📝';
  if (type === 'xls' || type === 'xlsx') return '📊';
  if (type === 'ppt' || type === 'pptx') return '📽️';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return '🖼️';
  if (type === 'txt') return '📃';
  if (type === 'zip' || type === 'rar') return '🗜️';
  return '📁';
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning materials...</p>
        </div>
      </div>
    );
  }

  if (learningData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Enrolled</h2>
          <p className="text-gray-600 mb-6">
            You haven't enrolled in any courses yet. Explore our courses and start your learning journey!
          </p>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                <p className="text-gray-600">Access all your course materials in one place</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Enrolled in</p>
              <p className="text-2xl font-bold text-blue-600">{learningData.length} Course Categories</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningData.map((category, index) => {
              const materials = getTotalMaterials(category);
              const progress = progressData[category.course_category]?.progress || category.progress;
              
              return (
                <div
                  key={category.course_category}
                  className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory?.course_category === category.course_category ? 'ring-4 ring-blue-300' : ''
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <h3 className="font-semibold text-lg mb-2">{category.category_name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">
                      {progress?.overall_progress || 0}% Complete
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {materials.all} materials
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${progress?.overall_progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2 opacity-80">
                    <span>{materials.videos} videos</span>
                    <span>{materials.documents} docs</span>
                    <span>{materials.meetings} live</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {selectedCategory && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar - Category Details */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedCategory.category_name}</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Enrollment Date:</span>
                    <span className="font-semibold text-sm">{formatDate(selectedCategory.enrollment_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold text-green-600 text-sm">
                      {progressData[selectedCategory.course_category]?.progress?.overall_progress || selectedCategory.progress?.overall_progress || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Courses:</span>
                    <span className="font-semibold text-sm">{selectedCategory.total_courses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Teachers:</span>
                    <span className="font-semibold text-sm">{selectedCategory.teachers?.length || 0}</span>
                  </div>
                </div>

                {/* Teachers List */}
                {selectedCategory.teachers && selectedCategory.teachers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Teachers
                    </h3>
                    <div className="space-y-2">
                      {selectedCategory.teachers.map((teacher, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-3 h-3" />
                          <span className="truncate">{teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Materials Available
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Video className="w-4 h-4 text-blue-500" />
                      Videos
                    </span>
                    <span className="font-semibold">{selectedCategory.materials?.videos?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4 text-green-500" />
                      Documents
                    </span>
                    <span className="font-semibold">{selectedCategory.materials?.documents?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      Live Sessions
                    </span>
                    <span className="font-semibold">{selectedCategory.materials?.meetings?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content - Materials */}
            <div className="lg:col-span-3">
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {/* Tabs and Search */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'videos', 'documents', 'meetings'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab === 'all' ? 'All Materials' : 
                         tab === 'videos' ? 'Videos' :
                         tab === 'documents' ? 'Documents' : 'Live Sessions'}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full lg:max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search materials..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Materials Grid */}
                <div className="space-y-6">
                  
                  {/* Videos Section */}
                  {(activeTab === 'all' || activeTab === 'videos') && selectedCategory.materials?.videos?.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Video className="w-6 h-6 text-blue-500" />
                        Video Lectures ({selectedCategory.materials.videos.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCategory.materials.videos
                          .filter(video => 
                            video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            video.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((video, index) => (
                          <motion.div
                            key={video._id || index}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 line-clamp-2">{video.title || 'Untitled Video'}</h4>
                                <p className="text-sm text-gray-600 mt-1">by {video.teacher_name || 'Unknown Teacher'}</p>
                                <p className="text-xs text-gray-500">Course: {video.course_title || 'Unknown Course'}</p>
                              </div>
                              {isMaterialCompleted(selectedCategory.course_category, 'videos', video._id) ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <button
                                  onClick={() => markAsCompleted(selectedCategory.course_category, 'videos', video._id)}
                                  className="text-gray-400 hover:text-green-500 transition-colors"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description || 'No description available'}</p>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {video.duration || 'N/A'}
                              </span>
                              <span>{formatFileSize(video.file_size)}</span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVideoView(video)}
                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Watch Video
                              </button>
                              <button
                                onClick={() => handleVideoDownload(video)}
                                disabled={downloadLoading[video._id]}
                                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {downloadLoading[video._id] ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    Download
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Section - FIXED for Local Storage */}
                  {/* Documents Section - Updated Card Design */}
{(activeTab === 'all' || activeTab === 'documents') && selectedCategory.materials?.documents?.length > 0 && (
  <div>
    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <FileText className="w-6 h-6 text-green-500" />
      Documents & Resources ({selectedCategory.materials.documents.length})
    </h3>
    <div className="grid grid-cols-1 gap-4">
      {selectedCategory.materials.documents
        .filter(doc => 
          doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((document, index) => (
           
        <motion.div
          key={document._id || index}
          className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl mr-2">{getDocumentIcon(document.file_type)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{document.title || 'Untitled Document'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Local Storage Indicator */}
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      Local Storage
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      document.document_type === 'notes' ? 'bg-blue-100 text-blue-800' :
                      document.document_type === 'assignment' ? 'bg-purple-100 text-purple-800' :
                      document.document_type === 'slides' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {document.document_type || 'document'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">by {document.teacher_name || 'Unknown Teacher'}</p>
              <p className="text-xs text-gray-500">Course: {document.course_title || 'Unknown Course'}</p>
            </div>
            {isMaterialCompleted(selectedCategory.course_category, 'documents', document._id) ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <button
                onClick={() => markAsCompleted(selectedCategory.course_category, 'documents', document._id)}
                className="text-gray-400 hover:text-green-500 transition-colors"
                title="Mark as completed"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {document.description && (
            <p className="text-sm text-gray-600 mb-3">{document.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">
                {document.file_type || 'FILE'}
              </span>
            </div>
            <span>{formatFileSize(document.file_size)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDocumentView(document)}
              disabled={downloadLoading[document._id]}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => handleDocumentDownload(document)}
              disabled={downloadLoading[document._id]}
              className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloadLoading[document._id] ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
          
          {/* Debug info - remove in production */}
          {/* <div className="text-xs text-gray-400 mt-2">
            ID: {document._id} | Course: {document.course_id}
          </div> */}
        </motion.div>
      ))}
    </div>
  </div>
)}

                  {/* Meetings Section (unchanged) */}
                  {(activeTab === 'all' || activeTab === 'meetings') && selectedCategory.materials?.meetings?.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-purple-500" />
                        Live Sessions ({selectedCategory.materials.meetings.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedCategory.materials.meetings
                          .filter(meeting => 
                            meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            meeting.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((meeting, index) => (
                          <motion.div
                            key={meeting._id || index}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {/* Meeting content - same as before */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{meeting.title || 'Untitled Meeting'}</h4>
                                <p className="text-sm text-gray-600 mt-1">by {meeting.teacher_name || 'Unknown Teacher'}</p>
                                <p className="text-xs text-gray-500">Course: {meeting.course_title || 'Unknown Course'}</p>
                              </div>
                              {isMaterialCompleted(selectedCategory.course_category, 'meetings', meeting._id) ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <button
                                  onClick={() => markAsCompleted(selectedCategory.course_category, 'meetings', meeting._id)}
                                  className="text-gray-400 hover:text-green-500 transition-colors"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{meeting.description || 'No description available'}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>{formatDate(meeting.scheduled_date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{meeting.duration || 60} minutes</span>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                {meeting.meeting_id && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>ID: {meeting.meeting_id}</span>
                                  </div>
                                )}
                                {meeting.passcode && (
                                  <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-gray-500" />
                                    <span>Passcode: {meeting.passcode}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(meeting.meeting_url, '_blank')}
                                className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Join Meeting
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(meeting.meeting_url);
                                  alert('Meeting link copied to clipboard!');
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Bookmark className="w-4 h-4" />
                                Copy Link
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {((activeTab === 'videos' && (!selectedCategory.materials?.videos || selectedCategory.materials.videos.length === 0)) ||
                    (activeTab === 'documents' && (!selectedCategory.materials?.documents || selectedCategory.materials.documents.length === 0)) ||
                    (activeTab === 'meetings' && (!selectedCategory.materials?.meetings || selectedCategory.materials.meetings.length === 0))) && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No materials found</h3>
                      <p className="text-gray-500">No {activeTab} available for this course category.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;