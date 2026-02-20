import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  X,
  MessageSquare,
  Mail,
  Phone,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  
  const itemsPerPage = 10;

  // Fetch queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  // Filter queries based on search and filter
  useEffect(() => {
    let filtered = [...queries];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(query => 
        query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    const now = new Date();
    if (filterStatus === 'today') {
      filtered = filtered.filter(query => {
        const queryDate = new Date(query.submittedAt);
        return queryDate.toDateString() === now.toDateString();
      });
    } else if (filterStatus === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(query => new Date(query.submittedAt) >= weekAgo);
    } else if (filterStatus === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(query => new Date(query.submittedAt) >= monthAgo);
    }

    setFilteredQueries(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, queries]);

  const fetchQueries = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/queries/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setQueries(data.data);
      setFilteredQueries(data.data);
      
      // Calculate stats
      const now = new Date();
      const today = now.toDateString();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

      setStats({
        total: data.data.length,
        today: data.data.filter(q => new Date(q.submittedAt).toDateString() === today).length,
        thisWeek: data.data.filter(q => new Date(q.submittedAt) >= weekAgo).length,
        thisMonth: data.data.filter(q => new Date(q.submittedAt) >= monthAgo).length
      });
    } else {
      console.error('Failed to fetch queries:', data.error);
      // Handle unauthorized access
      if (response.status === 401 || response.status === 403) {
        alert('Unauthorized. Please login as admin.');
        window.location.href = '/admin/login';
      }
    }
  } catch (error) {
    console.error('Error fetching queries:', error);
  } finally {
    setLoading(false);
  }
};

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQueries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 relative overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Student Queries Dashboard
          </h1>
          <p className="text-gray-600">
            View and manage all student submissions
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Queries', value: stats.total, color: 'blue', icon: MessageSquare },
            { label: 'Today', value: stats.today, color: 'green', icon: Calendar },
            { label: 'This Week', value: stats.thisWeek, color: 'purple', icon: Calendar },
            { label: 'This Month', value: stats.thisMonth, color: 'orange', icon: Calendar }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-${stat.color}-100`}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.2)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <stat.icon size={32} className={`text-${stat.color}-400 opacity-50`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Refresh Button */}
            <motion.button
              onClick={fetchQueries}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Queries Table */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading queries...</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-blue-600 text-white font-medium">
                <div className="col-span-3">Student</div>
                <div className="col-span-3">Issue</div>
                <div className="col-span-3">Suggestion</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* Table Body */}
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((query, index) => (
                    <motion.div
                      key={query.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <div className="col-span-3">
                        <div className="font-medium text-gray-800">{query.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {query.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} /> {query.phone}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <p className="text-gray-700 line-clamp-2">{query.issue}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-gray-700 line-clamp-2">{query.suggestion}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">{formatDate(query.submittedAt)}</div>
                      </div>
                      <div className="col-span-1 text-center">
                        <motion.button
                          onClick={() => setSelectedQuery(query)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No queries found</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {filteredQueries.length > 0 && (
                <div className="p-4 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredQueries.length)} of {filteredQueries.length} entries
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft size={20} />
                    </motion.button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {currentPage}
                    </span>
                    <motion.button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Query Detail Modal */}
      <AnimatePresence>
        {selectedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedQuery(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 sticky top-0">
                <div className="flex items-center justify-between text-white">
                  <h2 className="text-2xl font-bold">Query Details</h2>
                  <motion.button
                    onClick={() => setSelectedQuery(null)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedQuery.name}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedQuery.email}</span></p>
                    <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedQuery.phone}</span></p>
                    <p><span className="text-gray-500">Submitted:</span> <span className="font-medium">{formatDate(selectedQuery.submittedAt)}</span></p>
                  </div>
                </div>

                {/* Issue */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-600" />
                    Issue / Query
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedQuery.issue}</p>
                  </div>
                </div>

                {/* Suggestion */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare size={18} className="text-green-600" />
                    Suggestion
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedQuery.suggestion}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminQueries;