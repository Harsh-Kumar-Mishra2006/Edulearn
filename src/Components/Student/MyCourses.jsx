import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  PlayCircle,
  Clock,
  File,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  BarChart3,
  Filter,
  Search,
  Users,
  Eye as ViewIcon,
  FolderOpen,
  Archive
} from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState('all');
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch teacher's courses from the backend
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        status: filterStatus,
        category: filterCategory
      }).toString();

      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/teacher/my-courses?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched courses:', data.data); // Debug log
        setCourses(data.data || []);
      } else {
        console.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course statistics
  const fetchCourseStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/teacher/my-courses/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch detailed course materials when expanded
  const fetchCourseMaterials = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/teacher/my-courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched course materials:', data.data); // Debug log
        
        // Update the course in state with detailed materials
        setCourses(prev => prev.map(course => 
          course._id === courseId 
            ? { ...course, detailedMaterials: data.data.materials }
            : course
        ));
      }
    } catch (error) {
      console.error('Error fetching course materials:', error);
    }
  };

  // Archive course (soft delete)
  const archiveCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to archive this course? Students will no longer be able to access it.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/teacher/my-courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update course status in state
        setCourses(prev => prev.map(course => 
          course._id === courseId 
            ? { ...course, status: 'archived' }
            : course
        ));
        // Refresh statistics
        fetchCourseStatistics();
      }
    } catch (error) {
      console.error('Error archiving course:', error);
      alert('Failed to archive course');
    }
  };

  // Handle course expansion
  const handleCourseExpand = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      // Fetch detailed materials if not already loaded
      const course = courses.find(c => c._id === courseId);
      if (!course.detailedMaterials) {
        await fetchCourseMaterials(courseId);
      }
    }
  };

  useEffect(() => {
    fetchMyCourses();
    fetchCourseStatistics();
  }, [filterStatus, filterCategory]);

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600">Manage and view all your teaching materials</p>
              </div>
            </div>
            
            {/* Statistics */}
            {stats && (
              <div className="hidden md:flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.overview.total_courses}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.overview.total_videos}</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.overview.total_documents}</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.overview.total_students}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="app-development">App Development</option>
                <option value="digital-marketing">Digital Marketing</option>
                <option value="microsoft-office">Microsoft Office</option>
                <option value="ui-ux-design">UI/UX Design</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'No courses found'
                : "No courses created yet"
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : "You haven't created any courses yet. Visit the Teacher Portal to create your first course!"
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
              <button 
                onClick={() => window.location.href = '/teacher/create-course'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <BookOpen className="h-5 w-5" />
                Go to Teacher Portal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isExpanded={expandedCourse === course._id}
                onExpand={() => handleCourseExpand(course._id)}
                onArchive={() => archiveCourse(course._id)}
                selectedMaterialType={selectedMaterialType}
                onMaterialTypeChange={setSelectedMaterialType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ 
  course, 
  isExpanded, 
  onExpand, 
  onArchive,
  selectedMaterialType,
  onMaterialTypeChange 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <Eye className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      initial={false}
      animate={{ height: 'auto' }}
    >
      {/* Course Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onExpand}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{course.course_title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)} flex items-center gap-1`}>
                {getStatusIcon(course.status)}
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{course.course_description}</p>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                <span>{course.material_counts?.total_videos || 0} videos</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{course.material_counts?.total_documents || 0} documents</span>
              </div>
              <div className="flex items-center gap-1">
                <File className="h-4 w-4" />
                <span>{course.material_counts?.total_notes || 0} notes</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>{course.total_views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.total_students || 0} students</span>
              </div>
              <div className="text-gray-400">
                Created {formatDate(course.created_at)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {course.status !== 'archived' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Archive course"
              >
                <Archive className="h-5 w-5" />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Materials */}
      <AnimatePresence>
        {isExpanded && course.detailedMaterials && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <CourseMaterials 
              course={course}
              materials={course.detailedMaterials}
              selectedMaterialType={selectedMaterialType}
              onMaterialTypeChange={onMaterialTypeChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Course Materials Component
const CourseMaterials = ({ course, materials, selectedMaterialType, onMaterialTypeChange }) => {
  const materialTypes = [
    { 
      id: 'all', 
      name: 'All Materials', 
      icon: FolderOpen, 
      count: (materials.videos?.length || 0) + (materials.documents?.all?.length || 0) 
    },
    { 
      id: 'videos', 
      name: 'Videos', 
      icon: Video, 
      count: materials.videos?.length || 0 
    },
    { 
      id: 'notes', 
      name: 'Notes', 
      icon: FileText, 
      count: materials.documents?.notes?.length || 0 
    },
    { 
      id: 'assignments', 
      name: 'Assignments', 
      icon: File, 
      count: materials.documents?.assignments?.length || 0 
    },
    { 
      id: 'slides', 
      name: 'Slides', 
      icon: FileText, 
      count: materials.documents?.slides?.length || 0 
    },
    { 
      id: 'resources', 
      name: 'Resources', 
      icon: Download, 
      count: materials.documents?.resources?.length || 0 
    }
  ];

  const getMaterialsToShow = () => {
    switch (selectedMaterialType) {
      case 'videos':
        return materials.videos || [];
      case 'notes':
        return materials.documents?.notes || [];
      case 'assignments':
        return materials.documents?.assignments || [];
      case 'slides':
        return materials.documents?.slides || [];
      case 'resources':
        return materials.documents?.resources || [];
      case 'all':
      default:
        return [
          ...(materials.videos || []).map(v => ({ ...v, type: 'video' })),
          ...(materials.documents?.all || []).map(d => ({ ...d, type: 'document' }))
        ].sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const materialsToShow = getMaterialsToShow();

  return (
    <div className="p-6">
      {/* Material Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {materialTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onMaterialTypeChange(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedMaterialType === type.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <type.icon className="h-4 w-4" />
            <span>{type.name}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              selectedMaterialType === type.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {type.count}
            </span>
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      {materialsToShow.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No materials found</h4>
          <p className="text-gray-600">
            {selectedMaterialType === 'all' 
              ? "This course doesn't have any materials yet."
              : `No ${selectedMaterialType} found in this course.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialsToShow.map((material, index) => (
            <MaterialCard key={material._id || index} material={material} />
          ))}
        </div>
      )}
    </div>
  );
};

// Material Card Component
const MaterialCard = ({ material }) => {
  const isVideo = material.type === 'video' || material.video_url;
  const isDocument = material.type === 'document' || material.file_url;

  const handleView = () => {
    const url = isVideo ? material.video_url : material.file_url;
    window.open(`https://edulearnbackend-ffiv.onrender.com${url}`, '_blank');
  };

  const handleDownload = () => {
    const url = isVideo ? material.video_url : material.file_url;
    const link = document.createElement('a');
    link.href = `https://edulearnbackend-ffiv.onrender.com${url}`;
    link.download = material.title;
    link.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {isVideo ? (
            <Video className="h-5 w-5 text-blue-600 flex-shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          <h5 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {material.title}
          </h5>
        </div>
      </div>

      {/* Description */}
      {material.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {material.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-xs text-gray-500 mb-4">
        <div className="flex justify-between">
          <span>{formatFileSize(material.file_size)}</span>
          <span>{formatDate(material.upload_date)}</span>
        </div>
        {isVideo && material.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{material.duration}</span>
          </div>
        )}
        {isDocument && material.document_type && (
          <div className="flex items-center gap-1">
            <File className="h-3 w-3" />
            <span className="capitalize">{material.document_type}</span>
          </div>
        )}
        {material.is_public !== undefined && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
            material.is_public 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {material.is_public ? 'Public' : 'Private'}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleView}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <ViewIcon className="h-4 w-4" />
          View
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </motion.div>
  );
};

export default MyCourses;