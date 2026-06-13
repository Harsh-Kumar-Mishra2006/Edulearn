// components/TeachersList.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  Loader2,
  Lock,
  Copy,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  Shield
} from 'lucide-react';

const TeachersList = ({ 
  onDeleteTeacher, 
  showDeleteButton = true,
  itemsPerPage = 6,
  className = "",
  onTeacherClick,
  emptyStateMessage = "No teachers registered yet",
  emptyStateSubmessage = "Teachers will appear here once added",
  showHeader = true,
  headerTitle = "Registered Teachers",
  showPagination = true,
  customFetchUrl = null,
  filterBy = null,
  showPasswordColumn = true
}) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  // Fetch teachers function
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const baseUrl = customFetchUrl || 'https://edulearnbackend-ffiv.onrender.com/api/admin/teachers';
      const url = new URL(baseUrl);
      
      url.searchParams.append('getAll', 'true');
      
      if (filterBy) {
        Object.entries(filterBy).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teachers: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Teachers API Response:', result);
      
      let teachersArray = [];
      if (result.success && Array.isArray(result.data)) {
        teachersArray = result.data;
      } else if (Array.isArray(result.teachers)) {
        teachersArray = result.teachers;
      } else if (Array.isArray(result)) {
        teachersArray = result;
      } else if (result.data && Array.isArray(result.data.teachers)) {
        teachersArray = result.data.teachers;
      }
      
      // Filter out inactive/deleted teachers
      const activeTeachers = teachersArray.filter(teacher => 
        teacher.status !== 'inactive' && 
        teacher.status !== 'deleted' &&
        teacher.isActive !== false
      );
      
      // Fetch auth data for each teacher to get username and actual password
      const teachersWithAuth = await Promise.all(activeTeachers.map(async (teacher) => {
        try {
          const authResponse = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/auth/user-by-email?email=${teacher.email}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (authResponse.ok) {
            const authData = await authResponse.json();
            return {
              ...teacher,
              username: authData.data?.username || teacher.email.split('@')[0],
              authPassword: authData.data?.tempPassword || 'Teacher@123'
            };
          }
        } catch (err) {
          console.error('Error fetching auth for teacher:', teacher.email);
        }
        return {
          ...teacher,
          username: teacher.email?.split('@')[0] || 'teacher',
          authPassword: 'Teacher@123'
        };
      }));
      
      setTeachers(teachersWithAuth);
      setTotalTeachers(teachersWithAuth.length);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError(error.message || 'Failed to fetch teachers');
        console.error('Error fetching teachers:', error);
      }
      setTeachers([]);
      setTotalTeachers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (text, field, teacherId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(`${teacherId}-${field}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [customFetchUrl, JSON.stringify(filterBy)]);

  const handleDeleteTeacher = async (teacherId) => {
    if (onDeleteTeacher) {
      await onDeleteTeacher(teacherId);
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/admin/teachers/${teacherId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Delete failed');
        }

        setTeachers(prev => prev.filter(t => t._id !== teacherId));
        setTotalTeachers(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        fetchTeachers();
      }
    }
    setDeleteConfirmId(null);
  };

  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const indexOfLastTeacher = currentPage * itemsPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - itemsPerPage;
  const currentTeachers = teachers.slice(indexOfFirstTeacher, indexOfLastTeacher);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium animate-pulse">Loading teachers...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching all teacher details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Teachers</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchTeachers}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-6 shadow-xl overflow-hidden relative">
      {/* Animated Background */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      {showHeader && (
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              {headerTitle}
            </h3>
            <p className="text-gray-600 mt-1">Manage and view all teacher accounts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <span className="text-gray-700 font-semibold">{totalTeachers}</span>
              <span className="text-gray-500 ml-1">teachers total</span>
            </div>
            {showPagination && totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="relative z-10 text-center py-16">
          <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-xl font-medium">{emptyStateMessage}</p>
          <p className="text-gray-400 mt-2">{emptyStateSubmessage}</p>
        </div>
      ) : (
        <>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTeachers.map((teacher, index) => (
              <motion.div
                key={teacher._id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/50"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8 }}
                onClick={() => onTeacherClick && onTeacherClick(teacher)}
              >
                {/* Gradient Header */}
                <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                  <div className="absolute -bottom-10 left-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  {showDeleteButton && (
                    <button 
                      className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(teacher._id);
                      }}
                      title="Delete teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Content */}
                <div className="pt-12 p-5">
                  {/* Name and Role */}
                  <h4 className="text-xl font-bold text-gray-800">{teacher.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Teacher
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      teacher.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                      {teacher.status || 'active'}
                    </span>
                  </div>

                  {/* Username & Email */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{teacher.username || teacher.email?.split('@')[0]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyToClipboard(teacher.username || teacher.email?.split('@')[0], 'username', teacher._id);
                        }}
                        className="ml-auto text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedField === `${teacher._id}-username` ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">{teacher.email}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyToClipboard(teacher.email, 'email', teacher._id);
                        }}
                        className="ml-auto text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedField === `${teacher._id}-email` ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Section - Directly visible */}
                  {showPasswordColumn && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700 text-sm font-medium">Password:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-gray-800 text-sm font-mono">
                            {teacher.authPassword || 'Teacher@123'}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(teacher.authPassword || 'Teacher@123', 'password', teacher._id);
                            }}
                            className="text-gray-500 hover:text-purple-600 transition-colors p-1.5"
                            title="Copy password"
                          >
                            {copiedField === `${teacher._id}-password` ? 
                              <CheckCircle className="w-4 h-4 text-green-500" /> : 
                              <Copy className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Course & Phone */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">{teacher.course || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4 text-indigo-500" />
                      <span>{teacher.phone_number || teacher.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Qualification & Experience */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacher.qualification && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        <Award className="w-3 h-3" />
                        {teacher.qualification}
                      </span>
                    )}
                    {teacher.years_of_experience && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs">
                        <Clock className="w-3 h-3" />
                        {teacher.years_of_experience} years
                      </span>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTeacher(expandedTeacher === teacher._id ? null : teacher._id);
                    }}
                    className="mt-3 w-full text-center text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
                  >
                    {expandedTeacher === teacher._id ? 'Show less ▲' : 'Show more details ▼'}
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedTeacher === teacher._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3 border-t border-gray-100 space-y-2 overflow-hidden"
                      >
                        {teacher.specialization && teacher.specialization.length > 0 && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Specialization</p>
                            <div className="flex flex-wrap gap-1">
                              {teacher.specialization.map((spec, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {teacher.bio && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Bio</p>
                            <p className="text-gray-600 text-sm">{teacher.bio}</p>
                          </div>
                        )}
                        {teacher.address && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Address
                            </p>
                            <p className="text-gray-600 text-sm">
                              {typeof teacher.address === 'object' 
                                ? `${teacher.address.street}, ${teacher.address.city}, ${teacher.address.state} - ${teacher.address.pincode}`
                                : teacher.address}
                            </p>
                          </div>
                        )}
                        {teacher.joining_date && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Joined</p>
                            <p className="text-gray-600 text-sm">{new Date(teacher.joining_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
          
          {showPagination && totalPages > 1 && (
            <div className="relative z-10 mt-8 pt-6 border-t border-white/30 text-center">
              <p className="text-gray-600 text-sm">
                Showing teachers {indexOfFirstTeacher + 1} to {Math.min(indexOfLastTeacher, teachers.length)} of {totalTeachers}
              </p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Teacher</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-indigo-600">
                  {teachers.find(t => t._id === deleteConfirmId)?.name}
                </span>
                ?
              </p>
              <p className="text-red-500 text-sm font-medium mb-6">⚠️ This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteTeacher(deleteConfirmId)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeachersList;