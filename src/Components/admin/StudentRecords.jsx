// components/teacher/StudentRecords.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  User,
  Mail,
  BookOpen,
  Calendar,
  DollarSign,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard
} from 'lucide-react';
import axios from 'axios';
import AdminQueries from './adminquerries/adminQuerries';
import TeachersList from './TeacherList';

const StudentRecords = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalRevenue: 0
  });

  const itemsPerPage = 8;

  useEffect(() => {
    fetchStudentRecords();
  }, []);

  useEffect(() => {
    let filtered = [...payments];
    
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course_track?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, payments]);

  const fetchStudentRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://edulearnbackend-ffiv.onrender.com/api/teacher/student-records');
      
      if (response.data.success) {
        const paymentsWithDetails = await Promise.all(
          response.data.payments.map(async (payment) => {
            try {
              const courseResponse = await axios.get(
                `https://edulearnbackend-ffiv.onrender.com/api/courses?title=${encodeURIComponent(payment.course_track)}`
              );
              return {
                ...payment,
                course_details: courseResponse.data.success ? courseResponse.data.course : null,
                actual_amount: courseResponse.data.success ? courseResponse.data.course.price : payment.amount
              };
            } catch (error) {
              return payment;
            }
          })
        );
        
        setPayments(paymentsWithDetails);
        
        // Calculate stats
        const pending = paymentsWithDetails.filter(p => p.status === 'pending').length;
        const verified = paymentsWithDetails.filter(p => p.status === 'verified').length;
        const rejected = paymentsWithDetails.filter(p => p.status === 'rejected').length;
        const totalRevenue = paymentsWithDetails
          .filter(p => p.status === 'verified')
          .reduce((sum, p) => sum + (p.actual_amount || p.amount), 0);
        
        setStats({
          total: paymentsWithDetails.length,
          pending,
          verified,
          rejected,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching student records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const response = await axios.put(`https://edulearnbackend-ffiv.onrender.com/api/teacher/payment/${paymentId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setPayments(prev => prev.map(p => 
          p._id === paymentId ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading student records...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Teachers List Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <TeachersList showHeader={true} headerTitle="Teaching Staff" itemsPerPage={4} />
        </motion.div>

        {/* Admin Queries Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <AdminQueries />
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Payment Verification
              </h1>
              <p className="text-gray-600 mt-2">
                Review and manage student payment submissions
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-2xl shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'from-gray-500 to-gray-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'from-green-500 to-green-600' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600' },
            { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-blue-500 to-blue-600' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02, y: -3 }}
              className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs">{stat.label}</p>
                  <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-white/30" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by email or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchStudentRecords}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Payments Table */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No records found</h3>
              <p className="text-gray-500">
                {payments.length === 0 ? "No student payments yet" : "No payments match your search criteria"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Student & Course</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Payment Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {currentItems.map((payment, index) => (
                        <motion.tr
                          key={payment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-800">
                                    {payment.student_email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <BookOpen className="h-3 w-3 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    {payment.course_track}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-emerald-600">
                              ₹{(payment.actual_amount || payment.amount).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {formatDate(payment.payment_date)}
                              </p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.status)}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (payment.screenshot_path) {
                                    window.open(payment.screenshot_path, '_blank');
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </motion.button>
                              
                              {payment.screenshot_path && (
                                <a
                                  href={payment.screenshot_path}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </a>
                              )}
                              
                              {payment.status === 'pending' && (
                                <div className="flex gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusUpdate(payment._id, 'verified')}
                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                  >
                                    Verify
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusUpdate(payment._id, 'rejected')}
                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                  >
                                    Reject
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentRecords;