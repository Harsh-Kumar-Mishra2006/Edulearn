// components/teacher/adminquerries/AdminQueries.jsx
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
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Clock as ClockIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
  
  const itemsPerPage = 8;

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    let filtered = [...queries];

    if (searchTerm) {
      filtered = filtered.filter(query => 
        query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.suggestion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredQueries.map(q => ({
      'Name': q.name,
      'Email': q.email,
      'Phone': q.phone,
      'Issue': q.issue,
      'Suggestion': q.suggestion,
      'Submitted Date': new Date(q.submittedAt).toLocaleString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Queries');
    XLSX.writeFile(wb, `queries_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQueries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 shadow-xl overflow-hidden relative"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div variants={itemVariants} className="relative z-10 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Student Support Queries
            </h2>
            <p className="text-gray-500 text-sm mt-1">Review and manage student inquiries</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <Download size={18} />
              Export
            </motion.button>
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchQueries}
              className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Queries', value: stats.total, icon: HelpCircle, color: 'from-orange-500 to-orange-600' },
          { label: 'Today', value: stats.today, icon: TrendingUp, color: 'from-green-500 to-green-600' },
          { label: 'This Week', value: stats.thisWeek, icon: Calendar, color: 'from-blue-500 to-blue-600' },
          { label: 'This Month', value: stats.thisMonth, icon: ClockIcon, color: 'from-purple-500 to-purple-600' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`bg-gradient-to-r ${stat.color} rounded-xl p-3 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">{stat.label}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-white/30" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="relative z-10 flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </motion.div>

      {/* Queries Grid */}
      {loading ? (
        <div className="relative z-10 text-center py-12">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <motion.div variants={itemVariants} className="relative z-10 text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No queries found</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((query, index) => (
              <motion.div
                key={query.id || index}
                variants={itemVariants}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100"
                onClick={() => setSelectedQuery(query)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{query.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{query.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{query.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(query.submittedAt)}</span>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-orange-500 flex-shrink-0" />
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    <span className="font-medium">Issue:</span> {query.issue}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants} className="relative z-10 flex justify-center items-center gap-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>
              <span className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm">
                {currentPage} / {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
              >
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Query Detail Modal */}
      <AnimatePresence>
        {selectedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedQuery(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 sticky top-0">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Query Details</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedQuery(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="bg-orange-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={16} className="text-orange-600" />
                    Student Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedQuery.name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedQuery.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedQuery.phone}</p>
                    <p><span className="text-gray-500">Submitted:</span> {formatDate(selectedQuery.submittedAt)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-orange-600" />
                    Issue / Query
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedQuery.issue}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-green-600" />
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