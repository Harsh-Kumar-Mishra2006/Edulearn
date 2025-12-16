import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield,
  UserCheck,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Award,
  Copy,
  CheckCircle,
  X
} from 'lucide-react';
import AddTeacher from '../forms/AddTeacher';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [deleteTeacherId, setDeleteTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const navigate = useNavigate();

  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch teachers from backend
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🟡 Teachers data received:', data);
        setTeachers(data.data || data.teachers || []);
      } else {
        console.error('Failed to fetch teachers');
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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

  const handleAddTeacher = async (teacherData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/admin/add-teacher', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
      });

      if (response.ok) {
        const result = await response.json();
        await fetchTeachers();
        
        // Store credentials to show in info box
        if (result.credentials) {
          setCredentials({
            ...result.credentials,
            teacherName: teacherData.name,
            teacherEmail: teacherData.email
          });
        }
        
        setShowAddTeacherForm(false);
        return { success: true, message: result.message };
      } else {
        const error = await response.json();
        return { success: false, message: error.error || 'Failed to add teacher' };
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  };
const handleDeleteTeacher = async (teacherId) => {
  try {
    const token = localStorage.getItem('token');
    
    // Remove from UI immediately
    setTeachers(prev => prev.filter(teacher => teacher._id !== teacherId));
    setDeleteTeacherId(null);
    
    // Send delete request in background
    const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/admin/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // If delete fails, refresh list to restore teacher
      await fetchTeachers();
      console.error('Delete failed on backend');
    }
    
  } catch (error) {
    console.error('Network error:', error);
    // On error, refresh to get correct state
    await fetchTeachers();
  }
};

  const handleCopyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseCredentials = () => {
    setCredentials(null);
    setCopiedField(null);
  };

  const handleCertificateManagement = () => {
    navigate('/certificate-management');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
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
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-8 h-8" />
              <span className="text-2xl font-bold">Admin Portal</span>
            </div>
            <div className="text-white/80">
              Welcome, Administrator
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
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-light text-center mb-8"
          >
            Admin Dashboard
          </motion.h1>
          
          {/* Action Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12"
          >
            {/* Add Teachers Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTeacherForm(true)}
            >
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-semibold mb-2">Add Teachers</h3>
              <p className="text-white/80 text-lg">Add new teaching staff to the platform</p>
            </motion.div>

            {/* Certificate Management Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCertificateManagement}
            >
              <Award className="w-16 h-16 mx-auto mb-4 text-green-400"/>
              <h3 className="text-2xl font-semibold mb-2">Certificate Management</h3>
              <p className="text-white/80 text-lg">Manage course certificates and awards</p>
            </motion.div>
          </motion.div>

          {/* Teachers List Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mt-12 bg-gradient-to-br from-blue-800 via-purple-800 to-indigo-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold">Registered Teachers</h3>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                {teachers.length} teachers
              </span>
            </div>

            {teachers.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">No teachers registered yet</p>
                <p className="text-white/50">Click "Add Teachers" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher, index) => (
                  <motion.div
                    key={teacher._id}
                    className="bg-white/10 border border-white/20 rounded-xl p-6 flex items-center gap-4 relative hover:bg-white/15 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg truncate">{teacher.name}</h4>
                      <p className="text-white/80 text-sm truncate">{teacher.email}</p>
                      <p className="text-yellow-400 text-sm font-medium truncate">{teacher.course}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          teacher.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                            : 'bg-red-500/20 text-red-400 border border-red-400/50'
                        }`}>
                          {teacher.status || 'active'}
                        </span>
                        {teacher.qualification && (
                          <span className="text-white/60 text-xs">
                            {teacher.qualification}
                          </span>
                        )}
                      </div>
                      {teacher.years_of_experience && (
                        <p className="text-white/60 text-xs mt-1">
                          {teacher.years_of_experience} years experience
                        </p>
                      )}
                    </div>
                    <button 
                      className="bg-red-500/20 border border-red-500 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300"
                      onClick={() => setDeleteTeacherId(teacher._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Add Teacher Form Modal */}
      <AnimatePresence>
        {showAddTeacherForm && (
          <AddTeacher 
            onClose={() => setShowAddTeacherForm(false)}
            onSubmit={handleAddTeacher}
          />
        )}
      </AnimatePresence>

      {/* Credentials Info Box */}
      <AnimatePresence>
        {credentials && (
          <CredentialsInfoBox 
            credentials={credentials}
            onClose={handleCloseCredentials}
            onCopy={handleCopyToClipboard}
            copiedField={copiedField}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTeacherId && (
          <DeleteConfirmation 
            teacher={teachers.find(t => t._id === deleteTeacherId)}
            onConfirm={() => handleDeleteTeacher(deleteTeacherId)}
            onCancel={() => setDeleteTeacherId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Credentials Info Box Component
const CredentialsInfoBox = ({ credentials, onClose, onCopy, copiedField }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 max-w-md w-full relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Success Icon */}
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Teacher Added Successfully!</h3>
        <p className="text-white/90">
          Credentials generated for <span className="font-semibold">{credentials.teacherName}</span>
        </p>
      </div>

      {/* Credentials Box */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
        {/* Username */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={credentials.username}
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white font-mono text-sm"
            />
            <button
              onClick={() => onCopy(credentials.username, 'username')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-2 transition-colors"
            >
              {copiedField === 'username' ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">Temporary Password</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={credentials.tempPassword}
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white font-mono text-sm"
            />
            <button
              onClick={() => onCopy(credentials.tempPassword, 'password')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-2 transition-colors"
            >
              {copiedField === 'password' ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Login URL */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Login URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={credentials.loginUrl}
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
            />
            <button
              onClick={() => onCopy(credentials.loginUrl, 'url')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg p-2 transition-colors"
            >
              {copiedField === 'url' ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
        <p className="text-yellow-200 text-sm text-center">
          <strong>Important:</strong> Share these credentials with the teacher. 
          They must change their password after first login.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onClose}
        className="w-full mt-6 bg-white text-green-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Got it, I'll share these credentials
      </button>
    </motion.div>
  </motion.div>
);

// Delete Confirmation Component (keep your existing one)
const DeleteConfirmation = ({ teacher, onConfirm, onCancel }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onCancel}
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
        Are you sure you want to delete <span className="font-semibold">{teacher?.name}</span>?
      </p>
      <p className="text-red-500 font-semibold mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default AdminDashboard;