// CreateCourse.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Video, 
  FileText, 
  Upload, 
  X,
  File,
  Image,
  Trash2,
  Eye,
  Edit3,
  Save,
  Download,
  PlayCircle,
  Clock,
  CheckCircle,
  Calendar,
  Link,
  Users,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddNewCourse from './newCourse/addNewCourse';

const API_BASE_URL = 'https://edulearnbackend-ffiv.onrender.com/api';

const CreateCourse = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(null); // 'video', 'document', or 'meeting'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);

  const navigate = useNavigate();

  // Check if user is authorized teacher
  const checkAuthorization = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get user from localStorage
      const userData = localStorage.getItem('user') || localStorage.getItem('userData');
      
      if (!token || !userData) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const response = await fetch(`${API_BASE_URL}/auth/check-teacher`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(data.isAuthorized);
        if (data.isAuthorized) {
          fetchTeacherCourses();
        }
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // Fetch teacher's courses
  const fetchTeacherCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/course-materials/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Checking Authorization...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You are not authorized to access this page. Only teachers registered by admin can create courses.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Header */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 text-white">
              <BookOpen className="w-8 h-8" />
              <span className="text-2xl font-bold">Teacher Portal</span>
            </div>
            <div className="text-white/80">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dashboard Title */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-light text-center mb-8">
            Teacher Dashboard
          </motion.h1>

          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {/* Create Course Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Create Course</h3>
              <p className="text-white/80 text-sm">Create and manage courses</p>
            </motion.div>

            {/* Add Course to Catalog Card */}
            <motion.div 
              className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 text-center cursor-pointer hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddCourseForm(true)}
            >
              <div className="relative">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Add to Catalog</h3>
              <p className="text-white/80 text-sm">Create new course for all students</p>
              <span className="inline-block mt-2 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                New Feature
              </span>
            </motion.div>

            <AnimatePresence>
              {showAddCourseForm && (
                <AddNewCourse
                  onClose={() => setShowAddCourseForm(false)}
                  onSuccess={() => {
                    setShowAddCourseForm(false);
                    alert('Course added to catalog successfully! It will appear in the courses section.');
                  }}
                />
              )}
            </AnimatePresence>

            {/* Upload Videos Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (courses.length === 0) {
                  alert('Please create a course first before uploading videos.');
                  return;
                }
                setShowUploadModal('video');
              }}
            >
              <Video className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Upload Videos</h3>
              <p className="text-white/80 text-sm">Upload video lectures</p>
            </motion.div>

            {/* Upload Documents Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (courses.length === 0) {
                  alert('Please create a course first before uploading documents.');
                  return;
                }
                setShowUploadModal('document');
              }}
            >
              <FileText className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-white/80 text-sm">Upload PDFs, notes, resources</p>
            </motion.div>

            {/* Schedule Meeting Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (courses.length === 0) {
                  alert('Please create a course first before scheduling meetings.');
                  return;
                }
                setShowUploadModal('meeting');
              }}
            >
              <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Schedule Meeting</h3>
              <p className="text-white/80 text-sm">Add live session links</p>
            </motion.div>
          </motion.div>

          {/* Courses Section */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Your Courses</h3>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                {courses.length} courses
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">No courses created yet</p>
                <p className="text-white/50">Click "Create Course" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg truncate flex-1">{course.course_title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                        course.status === 'published' 
                          ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                          : course.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-3 line-clamp-2">{course.course_description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="text-xs text-white/50">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* All Materials Display - Shows all videos, documents, and meetings from all courses */}
          <AllMaterialsDisplay 
            refreshTrigger={refreshTrigger}
            courses={courses}
          />

        </motion.div>
      </div>

      {/* Create Course Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateCourseForm 
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchTeacherCourses();
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal 
            type={showUploadModal}
            courses={courses}
            onClose={() => setShowUploadModal(null)}
            onSuccess={() => {
              setShowUploadModal(null);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ type, courses, onClose, onSuccess }) => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    is_public: true,
    document_type: 'notes',
    course_id: courses.length > 0 ? courses[0]._id : '',
    meeting_url: '',
    meeting_type: 'other',
    scheduled_date: '',
    duration: 60,
    meeting_id: '',
    passcode: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Auto-fill title if empty
    if (!uploadData.title && selectedFile) {
      setUploadData(prev => ({
        ...prev,
        title: selectedFile.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type !== 'meeting' && !file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    if (type === 'meeting' && !uploadData.meeting_url) {
      setMessage({ type: 'error', text: 'Please enter a meeting URL' });
      return;
    }

    if (!uploadData.course_id) {
      setMessage({ type: 'error', text: 'Please select a course' });
      return;
    }

    if (type === 'meeting' && !uploadData.scheduled_date) {
      setMessage({ type: 'error', text: 'Please select a scheduled date and time' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      let endpoint, method, body;

      if (type === 'meeting') {
        // Meeting API call
        endpoint = `${API_BASE_URL}/course-materials/courses/${uploadData.course_id}/meetings`;
        method = 'POST';
        body = JSON.stringify({
          title: uploadData.title,
          description: uploadData.description,
          meeting_url: uploadData.meeting_url,
          meeting_type: uploadData.meeting_type,
          scheduled_date: uploadData.scheduled_date,
          duration: uploadData.duration,
          meeting_id: uploadData.meeting_id,
          passcode: uploadData.passcode
        });
      } else {
        // File upload to Cloudinary API call
        const formData = new FormData();
        formData.append(type === 'video' ? 'video' : 'document', file);
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('is_public', uploadData.is_public);

        if (type === 'document') {
          formData.append('document_type', uploadData.document_type);
        }

        endpoint = type === 'video' 
          ? `${API_BASE_URL}/course-materials/courses/${uploadData.course_id}/videos`
          : `${API_BASE_URL}/course-materials/courses/${uploadData.course_id}/documents`;
        method = 'POST';
        body = formData;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (type === 'meeting') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body
      });

      if (response.ok) {
        const successMessage = type === 'meeting' 
          ? 'Meeting scheduled successfully!' 
          : `${type === 'video' ? 'Video' : 'Document'} uploaded to Cloudinary successfully!`;
        
        setMessage({ type: 'success', text: successMessage });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || `Failed to ${type === 'meeting' ? 'schedule meeting' : 'upload ' + type}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUploading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'video': return 'Upload Video to Cloudinary';
      case 'document': return 'Upload Document to Cloudinary';
      case 'meeting': return 'Schedule Meeting';
      default: return 'Upload';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'document': return <FileText className="w-6 h-6" />;
      case 'meeting': return <Calendar className="w-6 h-6" />;
      default: return <Upload className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Course *
            </label>
            <select
              value={uploadData.course_id}
              onChange={(e) => setUploadData({ ...uploadData, course_id: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Choose a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.course_title}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload (for videos and documents) */}
          {type !== 'meeting' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {type === 'video' ? 'Video File' : 'Document File'} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors duration-200">
                <input
                  type="file"
                  accept={type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.txt,.ppt,.pptx,.zip'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {file ? file.name : `Click to upload ${type === 'video' ? 'a video file' : 'a document'}`}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {type === 'video' ? 'MP4, MOV, AVI' : 'PDF, DOC, PPT, TXT, ZIP'}
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Meeting URL (for meetings only) */}
          {type === 'meeting' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting URL *
              </label>
              <input
                type="url"
                value={uploadData.meeting_url}
                onChange={(e) => setUploadData({ ...uploadData, meeting_url: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="https://zoom.us/j/..."
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder={`Enter ${type} title`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder={`Describe this ${type}`}
            />
          </div>

          {/* Meeting Specific Fields */}
          {type === 'meeting' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={uploadData.meeting_type}
                    onChange={(e) => setUploadData({ ...uploadData, meeting_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="microsoft-teams">Microsoft Teams</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={uploadData.duration}
                    onChange={(e) => setUploadData({ ...uploadData, duration: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={uploadData.scheduled_date}
                  onChange={(e) => setUploadData({ ...uploadData, scheduled_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={uploadData.meeting_id}
                    onChange={(e) => setUploadData({ ...uploadData, meeting_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passcode
                  </label>
                  <input
                    type="text"
                    value={uploadData.passcode}
                    onChange={(e) => setUploadData({ ...uploadData, passcode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </>
          )}

          {/* Document Type (for documents only) */}
          {type === 'document' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={uploadData.document_type}
                onChange={(e) => setUploadData({ ...uploadData, document_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="notes">Notes</option>
                <option value="assignment">Assignment</option>
                <option value="slides">Slides</option>
                <option value="resource">Resource</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Privacy Setting (for videos and documents) */}
          {type !== 'meeting' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_public"
                checked={uploadData.is_public}
                onChange={(e) => setUploadData({ ...uploadData, is_public: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_public" className="text-sm font-semibold text-gray-700">
                Make this {type} public
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {type === 'meeting' ? 'Scheduling...' : 'Uploading to Cloudinary...'}
                </>
              ) : (
                <>
                  {type === 'meeting' ? <Calendar className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {type === 'meeting' ? 'Schedule Meeting' : `Upload ${type}`}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// All Materials Display Component
const AllMaterialsDisplay = ({ refreshTrigger, courses }) => {
  const [materials, setMaterials] = useState({ videos: [], documents: [], meetings: [] });
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all materials by iterating through courses
  const fetchAllMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const allVideos = [];
      const allDocuments = [];
      const allMeetings = [];

      console.log('📦 Starting materials fetch for', courses.length, 'courses');

      // Fetch materials for each course
      for (const course of courses) {
        try {
          console.log(`📚 Fetching materials for course: ${course.course_title} (${course._id})`);

          // Fetch videos & documents
          const materialsResponse = await fetch(
            `${API_BASE_URL}/course-materials/courses/${course._id}/materials`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (materialsResponse.ok) {
            const materialsData = await materialsResponse.json();
            console.log(`✅ Course ${course.course_title} materials response:`, materialsData);

            // Process videos
            const courseVideos = (materialsData.data?.videos || []).map(video => ({
              ...video,
              course_title: course.course_title,
              course_id: course._id,
              video_url: formatCloudinaryUrl(video.video_url, 'video'),
              isAvailable: !!video.video_url,
              type: 'video'
            }));

            // Process documents
            const courseDocuments = (materialsData.data?.documents || []).map(doc => ({
              ...doc,
              course_title: course.course_title,
              course_id: course._id,
              file_url: formatCloudinaryUrl(doc.file_url, 'raw'),
              isAvailable: !!doc.file_url,
              type: 'document'
            }));

            allVideos.push(...courseVideos);
            allDocuments.push(...courseDocuments);
          } else {
            console.warn(`⚠️ Failed to fetch materials for course ${course.course_title}:`, materialsResponse.status);
          }

          // Fetch meetings
          const meetingsResponse = await fetch(
            `${API_BASE_URL}/course-materials/courses/${course._id}/meetings`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (meetingsResponse.ok) {
            const meetingsData = await meetingsResponse.json();
            const courseMeetings = (meetingsData.meetings || []).map(meeting => ({
              ...meeting,
              course_title: course.course_title,
              course_id: course._id,
              type: 'meeting'
            }));
            allMeetings.push(...courseMeetings);
          } else {
            console.warn(`⚠️ Failed to fetch meetings for course ${course.course_title}:`, meetingsResponse.status);
          }

        } catch (error) {
          console.error(`❌ Error fetching materials for course ${course._id}:`, error);
        }
      }

      console.log('📊 Materials fetch complete:', {
        totalVideos: allVideos.length,
        totalDocuments: allDocuments.length,
        totalMeetings: allMeetings.length
      });

      setMaterials({
        videos: allVideos,
        documents: allDocuments,
        meetings: allMeetings
      });

    } catch (error) {
      console.error('❌ Error fetching materials:', error);
      setMaterials({ videos: [], documents: [], meetings: [] });
      
      // Show error toast
      showToast('Failed to load materials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format Cloudinary URLs
  const formatCloudinaryUrl = (url, resourceType) => {
    if (!url) return null;
    
    // If it's already a proper Cloudinary URL, return as-is
    if (url.includes('res.cloudinary.com')) {
      return url;
    }
    
    // If it's an old upload URL, it won't work
    if (url.startsWith('/uploads/')) {
      console.warn('⚠️ Old upload URL detected:', url);
      return null;
    }
    
    // For relative URLs, make them absolute
    if (url.startsWith('/')) {
      return `${API_BASE_URL}${url}`;
    }
    
    return url;
  };

  // Update video info
  const updateVideo = async (courseId, videoId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/course-materials/courses/${courseId}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchAllMaterials();
        setEditingVideo(null);
        showToast('Video updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      showToast('Failed to update video', 'error');
    }
  };

  // Update document info
  const updateDocument = async (courseId, documentId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/course-materials/courses/${courseId}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchAllMaterials();
        setEditingDocument(null);
        showToast('Document updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      showToast('Failed to update document', 'error');
    }
  };

  // Update meeting info
  const updateMeeting = async (courseId, meetingId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/course-materials/courses/${courseId}/meetings/${meetingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchAllMaterials();
        setEditingMeeting(null);
        showToast('Meeting updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      showToast('Failed to update meeting', 'error');
    }
  };

  // Delete material
  const deleteMaterial = async (courseId, materialType, materialId) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      
      if (materialType === 'meetings') {
        endpoint = `${API_BASE_URL}/course-materials/courses/${courseId}/meetings/${materialId}`;
      } else {
        endpoint = `${API_BASE_URL}/course-materials/courses/${courseId}/materials/${materialType}/${materialId}`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAllMaterials();
        setDeleteConfirm(null);
        showToast(`${materialType === 'videos' ? 'Video' : materialType === 'documents' ? 'Document' : 'Meeting'} deleted successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      showToast('Failed to delete material', 'error');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format datetime for meetings
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get meeting status
  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_date);
    
    if (meeting.status === 'cancelled') return 'cancelled';
    if (meeting.status === 'completed') return 'completed';
    if (meetingDate < now) return 'completed';
    if (meetingDate > now) return 'scheduled';
    return 'live';
  };

  // Play video from Cloudinary
  const playVideo = (video) => {
    const url = video.video_url;
    
    if (!url) {
      showToast('This video is not available. Please re-upload it.', 'error');
      return;
    }
    
    window.open(url, '_blank');
  };

  // View document from Cloudinary
  // View document function
const viewDocument = (document) => {
  const url = document.file_url;
  
  if (!url) {
    showToast('This document is not available. Please re-upload it.', 'error');
    return;
  }
  
  // For PDFs: Open in new tab (will show PDF viewer)
  if (document.file_type === 'pdf') {
    window.open(url, '_blank');
  } 
  // For images: Open in new tab
  else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(document.file_type)) {
    window.open(url, '_blank');
  }
  // For other files: Try to open or show message
  else {
    // Check if browser can display it
    const viewableTypes = ['txt', 'html', 'htm'];
    if (viewableTypes.includes(document.file_type)) {
      window.open(url, '_blank');
    } else {
      showToast(
        `This ${document.file_type.toUpperCase()} file cannot be viewed directly. Please download it.`,
        'info'
      );
    }
  }
};

// Download document function
const downloadDocument = async (document) => {
  try {
    const url = document.file_url;
    
    if (!url) {
      showToast('This file is not available. Please re-upload it.', 'error');
      return;
    }

    // Create download link with forced download
    let downloadUrl = url;
    
    if (url.includes('cloudinary.com')) {
      // For Cloudinary URLs, add download flag with filename
      const filename = encodeURIComponent(document.title || 'document');
      if (url.includes('/upload/')) {
        downloadUrl = url.replace('/upload/', `/upload/fl_attachment:${filename}/`);
      }
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${document.title || 'document'}.${document.file_type}`;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Download started!', 'success');
    
  } catch (error) {
    console.error('Download error:', error);
    showToast('Failed to download document. Please try again.', 'error');
  }
};

  // Toast notification function
  const showToast = (message, type = 'info') => {
    // Using alert for simplicity - you can replace with a proper toast library
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Success: ${message}`);
    } else {
      alert(message);
    }
  };

  useEffect(() => {
    if (courses.length > 0) {
      fetchAllMaterials();
    } else {
      setMaterials({ videos: [], documents: [], meetings: [] });
      setLoading(false);
    }
  }, [refreshTrigger, courses]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading materials from Cloudinary...</div>
        </div>
      </div>
    );
  }

  const totalMaterials = materials.videos.length + materials.documents.length + materials.meetings.length;

  if (totalMaterials === 0) {
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No Materials Yet</h3>
          <p className="text-white/50">Upload videos, documents, or schedule meetings to get started</p>
        </div>
      </motion.div>
    );
  }

  const filteredMaterials = {
    videos: activeTab === 'all' || activeTab === 'videos' ? materials.videos : [],
    documents: activeTab === 'all' || activeTab === 'documents' ? materials.documents : [],
    meetings: activeTab === 'all' || activeTab === 'meetings' ? materials.meetings : []
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold">All Learning Materials (Cloudinary)</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: totalMaterials },
            { key: 'videos', label: 'Videos', count: materials.videos.length },
            { key: 'documents', label: 'Documents', count: materials.documents.length },
            { key: 'meetings', label: 'Meetings', count: materials.meetings.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.label}
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      {filteredMaterials.videos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            Video Lectures ({materials.videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredMaterials.videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {editingVideo === video._id ? (
                    <VideoEditForm
                      video={video}
                      onSave={(data) => updateVideo(video.course_id, video._id, data)}
                      onCancel={() => setEditingVideo(null)}
                    />
                  ) : (
                    <>
                      {/* Video Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Video className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate">{video.title}</h4>
                            <p className="text-xs text-white/60 truncate">Course: {video.course_title}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingVideo(video._id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ 
                              type: 'videos', 
                              id: video._id, 
                              title: video.title,
                              courseId: video.course_id 
                            })}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Video Preview */}
                      <div className="relative bg-black/20 rounded-lg mb-3 aspect-video flex items-center justify-center">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Video className="w-8 h-8 text-white/50" />
                        )}
                        <button
                          onClick={() => playVideo(video)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                          disabled={!video.video_url}
                        >
                          <PlayCircle className="w-12 h-12 text-white" />
                        </button>
                      </div>

                      {/* Video Info */}
                      <div className="space-y-2 text-sm text-white/70">
                        <p className="line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {video.duration || 'N/A'}
                          </span>
                          <span>{formatFileSize(video.file_size)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${
                            video.is_public 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {video.is_public ? 'Public' : 'Private'}
                          </span>
                          <span className="text-xs">{formatDate(video.upload_date)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {filteredMaterials.documents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Documents & Resources ({materials.documents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMaterials.documents.map((document, index) => (
                <motion.div
                  key={document._id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 2 }}
                >
                  {editingDocument === document._id ? (
                    <DocumentEditForm
                      document={document}
                      onSave={(data) => updateDocument(document.course_id, document._id, data)}
                      onCancel={() => setEditingDocument(null)}
                    />
                  ) : (
                    <>
                      {/* Document Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate">{document.title}</h4>
                            <p className="text-xs text-white/60 truncate">Course: {document.course_title}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingDocument(document._id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ 
                              type: 'documents', 
                              id: document._id, 
                              title: document.title,
                              courseId: document.course_id 
                            })}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Document Info */}
                      <div className="space-y-3">
                        <p className="text-sm text-white/70 line-clamp-2">{document.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs capitalize ${
                              document.document_type === 'notes' ? 'bg-blue-500/20 text-blue-400' :
                              document.document_type === 'assignment' ? 'bg-purple-500/20 text-purple-400' :
                              document.document_type === 'slides' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {document.document_type}
                            </span>
                            <span className="text-xs uppercase text-white/50">{document.file_type}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            document.is_public 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {document.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>{formatDate(document.upload_date)}</span>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => viewDocument(document)}
                            className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                            disabled={!document.file_url}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => downloadDocument(document)}
                            className="flex-1 bg-green-500/20 text-green-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                            disabled={!document.file_url}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Meetings Section */}
      {filteredMaterials.meetings.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Scheduled Meetings ({materials.meetings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMaterials.meetings.map((meeting, index) => (
                <motion.div
                  key={meeting._id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {editingMeeting === meeting._id ? (
                    <MeetingEditForm
                      meeting={meeting}
                      onSave={(data) => updateMeeting(meeting.course_id, meeting._id, data)}
                      onCancel={() => setEditingMeeting(null)}
                    />
                  ) : (
                    <>
                      {/* Meeting Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate">{meeting.title}</h4>
                            <p className="text-xs text-white/60 truncate">Course: {meeting.course_title}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMeeting(meeting._id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ 
                              type: 'meetings', 
                              id: meeting._id, 
                              title: meeting.title,
                              courseId: meeting.course_id 
                            })}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Meeting Info */}
                      <div className="space-y-3">
                        <p className="text-sm text-white/70 line-clamp-2">{meeting.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs capitalize ${
                              meeting.meeting_type === 'zoom' ? 'bg-blue-500/20 text-blue-400' :
                              meeting.meeting_type === 'google-meet' ? 'bg-green-500/20 text-green-400' :
                              meeting.meeting_type === 'microsoft-teams' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {meeting.meeting_type}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-white/60">
                              <Clock className="w-3 h-3" />
                              {meeting.duration} min
                            </span>
                          </span>
                          
                          <span className={`px-2 py-1 rounded text-xs ${
                            getMeetingStatus(meeting) === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            getMeetingStatus(meeting) === 'live' ? 'bg-green-500/20 text-green-400' :
                            getMeetingStatus(meeting) === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {getMeetingStatus(meeting).charAt(0).toUpperCase() + getMeetingStatus(meeting).slice(1)}
                          </span>
                        </div>

                        <div className="text-sm text-white/70">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTime(meeting.scheduled_date)}</span>
                          </div>
                          {meeting.meeting_id && (
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4" />
                              <span>ID: {meeting.meeting_id}</span>
                            </div>
                          )}
                          {meeting.passcode && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Passcode: {meeting.passcode}</span>
                            </div>
                          )}
                        </div>

                        {/* Meeting Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => window.open(meeting.meeting_url, '_blank')}
                            className="flex-1 bg-purple-500/20 text-purple-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Link className="w-4 h-4" />
                            Join Meeting
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(meeting.meeting_url);
                              showToast('Meeting link copied to clipboard!', 'success');
                            }}
                            className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteConfirmation
            item={deleteConfirm}
            onConfirm={() => deleteMaterial(deleteConfirm.courseId, deleteConfirm.type, deleteConfirm.id)}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Video Edit Form Component
const VideoEditForm = ({ video, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: video.title,
    description: video.description || '',
    is_public: video.is_public
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        placeholder="Video title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white resize-none"
        placeholder="Video description"
        rows="2"
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            className="rounded"
          />
          Public
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-green-500/20 text-green-400 py-1 px-2 rounded text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500/20 text-gray-400 py-1 px-2 rounded text-sm hover:bg-gray-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </form>
  );
};

// Document Edit Form Component
const DocumentEditForm = ({ document, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    is_public: document.is_public,
    document_type: document.document_type
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        placeholder="Document title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white resize-none"
        placeholder="Document description"
        rows="2"
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            className="rounded"
          />
          Public
        </label>
        <select
          value={formData.document_type}
          onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
          className="px-2 py-1 bg-white/5 border border-white/20 rounded text-sm text-white"
        >
          <option value="notes">Notes</option>
          <option value="assignment">Assignment</option>
          <option value="slides">Slides</option>
          <option value="resource">Resource</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-green-500/20 text-green-400 py-1 px-2 rounded text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500/20 text-gray-400 py-1 px-2 rounded text-sm hover:bg-gray-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </form>
  );
};

// Meeting Edit Form Component
const MeetingEditForm = ({ meeting, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: meeting.title,
    description: meeting.description || '',
    meeting_url: meeting.meeting_url,
    meeting_type: meeting.meeting_type,
    scheduled_date: meeting.scheduled_date.slice(0, 16),
    duration: meeting.duration,
    meeting_id: meeting.meeting_id || '',
    passcode: meeting.passcode || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        placeholder="Meeting title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white resize-none"
        placeholder="Meeting description"
        rows="2"
      />
      <input
        type="url"
        value={formData.meeting_url}
        onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        placeholder="Meeting URL"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={formData.meeting_type}
          onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
          className="px-2 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        >
          <option value="zoom">Zoom</option>
          <option value="google-meet">Google Meet</option>
          <option value="microsoft-teams">Microsoft Teams</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          className="px-2 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
          placeholder="Duration"
          min="1"
        />
      </div>
      <input
        type="datetime-local"
        value={formData.scheduled_date}
        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={formData.meeting_id}
          onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
          className="px-2 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
          placeholder="Meeting ID"
        />
        <input
          type="text"
          value={formData.passcode}
          onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
          className="px-2 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
          placeholder="Passcode"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-green-500/20 text-green-400 py-1 px-2 rounded text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500/20 text-gray-400 py-1 px-2 rounded text-sm hover:bg-gray-500/30 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </form>
  );
};

// Delete Confirmation Component
const DeleteConfirmation = ({ item, onConfirm, onCancel }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onCancel}
  >
    <motion.div
      className="bg-white rounded-2xl p-6 text-center max-w-sm w-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Delete {item.type === 'videos' ? 'Video' : item.type === 'documents' ? 'Document' : 'Meeting'}
      </h3>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete "<span className="font-semibold">{item.title}</span>"?
      </p>
      <p className="text-red-500 text-sm mb-6">This action cannot be undone. File will be deleted from Cloudinary.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// Create Course Form Component
const CreateCourseForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    course_title: '',
    course_description: '',
    course_category: 'other',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/course-materials/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Course created successfully!' });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create course' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Create New Course</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="course_title"
              value={formData.course_title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter course title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Description
            </label>
            <textarea
              name="course_description"
              value={formData.course_description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe your course"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Category *
            </label>
            <select
              name="course_category"
              value={formData.course_category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="web-development">Web Development</option>
              <option value="app-development">App Development</option>
              <option value="digital-marketing">Digital Marketing</option>
              <option value="microsoft-office">Microsoft Office</option>
              <option value="ui-ux-design">UI UX Design</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., javascript, react, nodejs"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateCourse;