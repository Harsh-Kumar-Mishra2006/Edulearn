// components/teacher/StudentList.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Mail,
  Phone,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  
  const itemsPerPage = 9;

  useEffect(() => {
    fetchAllStudents();
  }, []);

  useEffect(() => {
    let filtered = [...students];
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm)
      );
    }
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);

  const fetchAllStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔵 Fetching students with token:', token.substring(0, 50) + '...');
      
      // Try multiple endpoints
      let response;
      let success = false;
      
      // Try endpoint 1: /api/auth/all-students
      try {
        console.log('🔵 Trying endpoint: /api/auth/all-students');
        response = await axios.get('https://edulearnbackend-ffiv.onrender.com/api/auth/all-students', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          success = true;
          console.log('✅ Success from /api/auth/all-students');
        }
      } catch (err) {
        console.log('❌ /api/auth/all-students failed:', err.response?.status);
      }
      
      // Try endpoint 2: /api/admin/students
      if (!success) {
        try {
          console.log('🔵 Trying endpoint: /api/admin/students');
          response = await axios.get('https://edulearnbackend-ffiv.onrender.com/api/admin/students', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data.success) {
            success = true;
            console.log('✅ Success from /api/admin/students');
          }
        } catch (err) {
          console.log('❌ /api/admin/students failed:', err.response?.status);
        }
      }
      
      if (!success) {
        throw new Error('Unable to fetch students from any endpoint');
      }
      
      console.log('🔵 Response data:', response.data);
      
      // Extract student data from response
      let studentData = [];
      if (response.data.students) {
        studentData = response.data.students;
      } else if (response.data.data) {
        studentData = response.data.data;
      } else if (Array.isArray(response.data)) {
        studentData = response.data;
      }
      
      console.log(`🔵 Found ${studentData.length} students`);
      
      setStudents(studentData);
      setFilteredStudents(studentData);
      
      // Calculate stats
      const now = new Date();
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      
      setStats({
        total: studentData.length,
        active: studentData.filter(s => s.isActive !== false).length,
        newThisMonth: studentData.filter(s => {
          if (!s.createdAt) return false;
          return new Date(s.createdAt) >= monthAgo;
        }).length
      });
      
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-2">Error Loading Students</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllStudents}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl overflow-hidden relative"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div variants={itemVariants} className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Student Directory
            </h2>
            <p className="text-gray-500 mt-1">View and manage all enrolled students</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAllStudents}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Active Students', value: stats.active, icon: GraduationCap, color: 'from-green-500 to-green-600' },
          { label: 'New This Month', value: stats.newThisMonth, icon: Calendar, color: 'from-purple-500 to-purple-600' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`bg-gradient-to-r ${stat.color} rounded-xl p-5 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-white text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className="w-10 h-10 text-white/30" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative z-10 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <motion.div variants={itemVariants} className="relative z-10 text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No students found</p>
          <p className="text-gray-400">Try adjusting your search</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((student, index) => (
              <motion.div
                key={student._id || index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => setSelectedStudent(student)}
              >
                {/* Gradient Header */}
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                  <div className="absolute -bottom-10 left-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="pt-12 p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{student.name || 'N/A'}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Phone className="w-3 h-3" />
                    <span>{student.phone || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>Joined: {formatDate(student.createdAt)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.isActive !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants} className="relative z-10 flex justify-center items-center gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sticky top-0">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Student Details</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.name || 'N/A'}</h3>
                    <p className="text-gray-500">{selectedStudent.email}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      selectedStudent.isActive !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${selectedStudent.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                      {selectedStudent.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm mb-1">Phone Number</p>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-indigo-500" />
                      {selectedStudent.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm mb-1">Role</p>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      {selectedStudent.role || 'Student'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm mb-1">Joined Date</p>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {formatDate(selectedStudent.createdAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm mb-1">Student ID</p>
                    <p className="text-gray-800 font-medium text-sm font-mono">
                      {selectedStudent._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Profile Details if available */}
                {selectedStudent.profile && Object.keys(selectedStudent.profile).length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      Profile Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedStudent.profile.age && (
                        <div><span className="text-gray-500">Age:</span> {selectedStudent.profile.age}</div>
                      )}
                      {selectedStudent.profile.gender && (
                        <div><span className="text-gray-500">Gender:</span> {selectedStudent.profile.gender}</div>
                      )}
                      {selectedStudent.profile.dob && (
                        <div><span className="text-gray-500">Date of Birth:</span> {selectedStudent.profile.dob}</div>
                      )}
                      {selectedStudent.profile.address && (
                        <div className="col-span-2"><span className="text-gray-500">Address:</span> {selectedStudent.profile.address}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentList;