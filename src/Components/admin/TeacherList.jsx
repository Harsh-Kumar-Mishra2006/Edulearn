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
  Eye,
  EyeOff,
  Copy,
  CheckCircle
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
  showPasswordColumn = true // ✅ NEW: Show password column for admin
}) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [showPasswords, setShowPasswords] = useState({}); // ✅ Track which passwords are visible
  const [copiedField, setCopiedField] = useState(null);

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
      
      console.log('Active teachers count:', activeTeachers.length);
      
      // ✅ For demo/UI purposes, we'll add a placeholder password field
      // In production, you would fetch this from a secure endpoint
      const teachersWithPassword = activeTeachers.map(teacher => ({
        ...teacher,
        // This is just for UI display - in real app, you'd have a secure endpoint
        // to fetch teacher passwords or store them securely
        displayPassword: '••••••••' // Placeholder - actual password should not be stored here
      }));
      
      setTeachers(teachersWithPassword);
      setTotalTeachers(teachersWithPassword.length);
      
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

  // Fetch teacher password from a secure endpoint
  const fetchTeacherPassword = async (teacherId, teacherEmail) => {
    try {
      const token = localStorage.getItem('token');
      // You would need to create this endpoint
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/admin/teachers/${teacherId}/password`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.password;
      }
      return 'Unable to fetch password';
    } catch (error) {
      console.error('Error fetching password:', error);
      return 'Error fetching password';
    }
  };

  const togglePasswordVisibility = async (teacherId) => {
    setShowPasswords(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
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
      <div className={`bg-gradient-to-r from-blue-200 to-pink-200 backdrop-blur-md border border-white/10 rounded-2xl p-8 ${className}`}>
        {showHeader && (
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {headerTitle}
            </h3>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="w-16 h-16 text-white/80 animate-spin mb-6" strokeWidth={1.5} />
          <div className="text-center space-y-3">
            <p className="text-xl font-medium text-gray-800 animate-pulse">
              Loading content...
            </p>
            <p className="text-sm text-gray-600/80">
              Please wait while we fetch the latest updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-r from-blue-200 to-pink-200 backdrop-blur-md border border-white/10 rounded-2xl p-8 ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-800" />
          <p className="text-red-800 text-lg mb-2">Error Loading Teachers</p>
          <p className="text-black mb-4">{error}</p>
          <button
            onClick={fetchTeachers}
            className="px-6 py-3 bg-black hover:bg-white/20 rounded-xl text-white transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-200 to-pink-200 backdrop-blur-md border border-white/10 p-4 rounded-2xl ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-black font-sans rounded-xl text-2xl font-bold">{headerTitle}</h3>
          <div className="flex items-center gap-4">
            <span className="bg-white/80 px-3 py-1 rounded-full text-sm">
              {totalTeachers} teachers total
            </span>
            {showPagination && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <p className="text-white/70 text-lg">{emptyStateMessage}</p>
          <p className="text-white/50">{emptyStateSubmessage}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTeachers.map((teacher, index) => (
              <motion.div
                key={teacher._id}
                className={`bg-blue-600 border border-white/20 rounded-xl p-6 hover:bg-blue-500 transition-all duration-300 ${
                  onTeacherClick ? 'cursor-pointer' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => onTeacherClick && onTeacherClick(teacher)}
              >
                <div className="flex items-start gap-4">
                  {/* Teacher Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>

                  {/* Teacher Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-lg truncate">{teacher.name}</h4>
                    
                    {/* Email */}
                    <div className="flex items-center gap-1 text-white/80 text-sm truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    
                    {/* Course */}
                    {teacher.course && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium mt-1">
                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{teacher.course}</span>
                      </div>
                    )}

                    {/* ✅ PASSWORD SECTION FOR ADMIN */}
                    {showPasswordColumn && (
                      <div className="mt-2 p-2 bg-blue-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3 text-yellow-400" />
                            <span className="text-white/70 text-xs font-medium">Password:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type={showPasswords[teacher._id] ? "text" : "password"}
                              readOnly
                              value={teacher.displayPassword || '••••••••'}
                              className="bg-blue-800/50 border border-blue-400/30 rounded px-2 py-1 text-white text-xs w-24 font-mono"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePasswordVisibility(teacher._id);
                              }}
                              className="text-white/70 hover:text-white transition-colors"
                              title={showPasswords[teacher._id] ? "Hide password" : "Show password"}
                            >
                              {showPasswords[teacher._id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const passwordToCopy = teacher.password || teacher.displayPassword || 'Not set';
                                handleCopyToClipboard(passwordToCopy, 'password', teacher._id);
                              }}
                              className="text-white/70 hover:text-white transition-colors"
                              title="Copy password"
                            >
                              {copiedField === `${teacher._id}-password` ? 
                                <CheckCircle className="w-3 h-3 text-green-400" /> : 
                                <Copy className="w-3 h-3" />
                              }
                            </button>
                          </div>
                        </div>
                        <p className="text-blue-300 text-xs mt-1 italic">
                          Note: Teacher can change password after login
                        </p>
                      </div>
                    )}

                    {/* Status & Additional Info */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                          : teacher.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                          : 'bg-red-500/20 text-red-400 border border-red-400/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          teacher.status === 'active' ? 'bg-green-400' : 'bg-current'
                        }`}></span>
                        {teacher.status || 'active'}
                      </span>

                      {teacher.qualification && (
                        <span className="flex items-center gap-1 text-white/60 text-xs">
                          <Award className="w-3 h-3" />
                          {teacher.qualification}
                        </span>
                      )}
                    </div>

                    {teacher.years_of_experience && (
                      <div className="flex items-center gap-1 text-white/60 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{teacher.years_of_experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  {showDeleteButton && (
                    <button 
                      className="bg-red-500/20 border border-red-500 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 flex-shrink-0"
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
              </motion.div>
            ))}
          </div>
          
          {showPagination && totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-blue-800">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Teacher</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {teachers.find(t => t._id === deleteConfirmId)?.name}
                </span>
                ?
              </p>
              <p className="text-red-500 font-semibold mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteTeacher(deleteConfirmId)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transform hover:-translate-y-0.5 transition-all duration-200"
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