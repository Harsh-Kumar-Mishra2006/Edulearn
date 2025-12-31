// components/assignment/AssignmentView.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays,
  FileCheck,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Download,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  CalendarCheck,
  Timer,
  TrendingUp,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  FileText,
  PlusCircle,
  BookOpen,
  Award,
  Percent,
  UserCheck,
  Clock3,
  CalendarClock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssignmentView = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    upcoming: 0,
    completed: 0,
    active: 0
  });
  const [filter, setFilter] = useState('all'); // all, published, draft, upcoming, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('due_date'); // due_date, created_at, title, points
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();

  // Fetch user data and assignments
  useEffect(() => {
    fetchUserData();
    fetchAssignments();
  }, [refreshTrigger]);

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch all assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/assignments/teacher/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data || []);
        updateStats(data.data || []);
      } else if (response.status === 404) {
        console.log('Assignment endpoint not found');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (assignments) => {
    const now = new Date();
    const stats = {
      total: assignments.length,
      published: assignments.filter(a => a.status === 'published').length,
      draft: assignments.filter(a => a.status === 'draft').length,
      upcoming: assignments.filter(a => new Date(a.due_date) > now && a.status === 'published').length,
      completed: assignments.filter(a => new Date(a.due_date) <= now).length,
      active: assignments.filter(a => a.status === 'published').length
    };
    setStats(stats);
  };

  // Fetch detailed assignment information
  const fetchAssignmentDetails = async (assignmentId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/assignments/teacher/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAssignmentDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Toggle assignment expansion
  const toggleAssignmentExpansion = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
      setSelectedAssignmentDetails(null);
    } else {
      setExpandedAssignment(assignmentId);
      setSelectedAssignmentDetails(null);
      await fetchAssignmentDetails(assignmentId);
    }
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      // Apply filter
      const now = new Date();
      const dueDate = new Date(assignment.due_date);
      
      switch (filter) {
        case 'published':
          return assignment.status === 'published';
        case 'draft':
          return assignment.status === 'draft';
        case 'upcoming':
          return dueDate > now && assignment.status === 'published';
        case 'completed':
          return dueDate <= now;
        case 'active':
          return assignment.status === 'published';
        default:
          return true;
      }
    })
    .filter(assignment => {
      // Apply search
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        assignment.assignment_title.toLowerCase().includes(searchLower) ||
        assignment.assignment_description.toLowerCase().includes(searchLower) ||
        assignment.assignment_topic.toLowerCase().includes(searchLower) ||
        assignment.course_title.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Apply sorting
      let aValue, bValue;
      
      switch (sortBy) {
        case 'due_date':
          aValue = new Date(a.due_date);
          bValue = new Date(b.due_date);
          break;
        case 'created_at':
          aValue = new Date(a.created_at || a.assignment_date);
          bValue = new Date(b.created_at || b.assignment_date);
          break;
        case 'title':
          aValue = a.assignment_title.toLowerCase();
          bValue = b.assignment_title.toLowerCase();
          break;
        case 'points':
          aValue = a.total_points;
          bValue = b.total_points;
          break;
        default:
          aValue = new Date(a.due_date);
          bValue = new Date(b.due_date);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/assignments/teacher/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Assignment deleted successfully!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment');
    }
  };

  // Export assignments
  const exportAssignments = () => {
    const dataToExport = filteredAndSortedAssignments.map(assignment => ({
      Title: assignment.assignment_title,
      Topic: assignment.assignment_topic,
      Course: assignment.course_title,
      Status: assignment.status,
      'Total Questions': assignment.total_questions,
      'Total Points': assignment.total_points,
      'Due Date': new Date(assignment.due_date).toLocaleDateString(),
      'Created Date': new Date(assignment.created_at || assignment.assignment_date).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading assignments...</div>
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
              <CalendarCheck className="w-8 h-8" />
              <span className="text-2xl font-bold">Assignments Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                title="Refresh Assignments"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={exportAssignments}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-white"
                disabled={assignments.length === 0}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <div className="text-white/80">
                Welcome, {user?.name}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Dashboard Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light mb-2">Assignments Management</h1>
            <p className="text-white/70 text-lg">Manage and track all your course assignments</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {/* Total Assignments */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <FileCheck className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Total</h3>
              <p className="text-xs text-white/60">All assignments</p>
            </div>

            {/* Published */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Eye className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold">{stats.published}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Published</h3>
              <p className="text-xs text-white/60">Live assignments</p>
            </div>

            {/* Active */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-bold">{stats.active}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Active</h3>
              <p className="text-xs text-white/60">Currently active</p>
            </div>

            {/* Upcoming */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Clock3 className="w-6 h-6 text-purple-400" />
                <span className="text-2xl font-bold">{stats.upcoming}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Upcoming</h3>
              <p className="text-xs text-white/60">Future due dates</p>
            </div>

            {/* Completed */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-6 h-6 text-teal-400" />
                <span className="text-2xl font-bold">{stats.completed}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Completed</h3>
              <p className="text-xs text-white/60">Past due date</p>
            </div>

            {/* Draft */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <FileText className="w-6 h-6 text-gray-400" />
                <span className="text-2xl font-bold">{stats.draft}</span>
              </div>
              <h3 className="text-sm font-medium mt-2">Draft</h3>
              <p className="text-xs text-white/60">Not published</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Assignments List
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  {filteredAndSortedAssignments.length} assignments found
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdown */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Assignments</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="active">Active</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="due_date">Sort by Due Date</option>
                  <option value="created_at">Sort by Created Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="points">Sort by Points</option>
                </select>

                {/* Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>

            {/* Assignments List */}
            {filteredAndSortedAssignments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">No assignments found</p>
                <p className="text-white/50">Try adjusting your filters or create a new assignment</p>
                <button
                  onClick={() => navigate('/teacher/quiz')}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedAssignments.map((assignment, index) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    index={index}
                    isExpanded={expandedAssignment === assignment._id}
                    onToggle={() => toggleAssignmentExpansion(assignment._id)}
                    loadingDetails={loadingDetails}
                    details={selectedAssignmentDetails}
                    onDelete={handleDeleteAssignment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Assignment Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CalendarClock className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">
                      {assignments.filter(a => {
                        const dueDate = new Date(a.due_date);
                        const now = new Date();
                        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return dueDate > now && dueDate <= nextWeek;
                      }).length}
                    </div>
                    <div className="text-sm text-white/70">Due in next 7 days</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Percent className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-sm text-white/70">Published Rate</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserCheck className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold">
                      {assignments.length > 0 ? Math.round(assignments.reduce((sum, a) => sum + (a.total_points || 0), 0) / assignments.length) : 0}
                    </div>
                    <div className="text-sm text-white/70">Avg Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">
                      {assignments.length > 0 ? Math.round(assignments.reduce((sum, a) => sum + (a.total_questions || 0), 0) / assignments.length) : 0}
                    </div>
                    <div className="text-sm text-white/70">Avg Questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index, isExpanded, onToggle, loadingDetails, details, onDelete }) => {
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const createdDate = new Date(assignment.created_at || assignment.assignment_date);
  const isOverdue = dueDate < now;
  const isUpcoming = dueDate > now && dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
  const isActive = assignment.status === 'published' && !isOverdue;

  // Calculate time remaining
  const timeRemaining = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  let timeText = '';
  if (isOverdue) {
    timeText = `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''}`;
  } else if (daysRemaining === 0) {
    timeText = 'Due today';
  } else if (daysRemaining === 1) {
    timeText = 'Due tomorrow';
  } else if (daysRemaining <= 7) {
    timeText = `Due in ${daysRemaining} days`;
  } else {
    timeText = `Due in ${daysRemaining} days`;
  }

  return (
    <motion.div
      className={`bg-white/10 border rounded-xl overflow-hidden ${
        isOverdue 
          ? 'border-red-400/50' 
          : isUpcoming
          ? 'border-yellow-400/50'
          : 'border-white/20'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Assignment Header */}
      <div 
        className="p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-2 rounded-lg ${
              isExpanded ? 'bg-green-500/20' : 'bg-white/10'
            }`}>
              {isExpanded ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-lg">{assignment.assignment_title}</h4>
                <div className="flex items-center gap-2">
                  {isOverdue && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-semibold">
                      Overdue
                    </span>
                  )}
                  {isUpcoming && !isOverdue && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                      Upcoming
                    </span>
                  )}
                  {isActive && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                      Active
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-white/60 text-sm mb-2">{assignment.assignment_description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Created: {createdDate.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeText}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {assignment.total_questions || 0} questions • {assignment.total_points || 0} points
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {assignment.course_title}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              assignment.status === 'published' 
                ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                : assignment.status === 'draft'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
            }`}>
              {assignment.status}
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit functionality
                }}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                title="Edit Assignment"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(assignment._id);
                }}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Assignment Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-white/20 p-6">
              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : details ? (
                <AssignmentQuestionsDisplay assignment={details} isOverdue={isOverdue} />
              ) : (
                <div className="text-center py-4 text-white/60">
                  Loading assignment details...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Assignment Questions Display Component
const AssignmentQuestionsDisplay = ({ assignment, isOverdue }) => {
  const dueDate = new Date(assignment.due_date);
  const createdDate = new Date(assignment.created_at || assignment.assignment_date);

  return (
    <div className="space-y-6">
      {/* Assignment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{assignment.total_questions}</div>
          <div className="text-sm text-white/60">Total Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{assignment.total_points}</div>
          <div className="text-sm text-white/60">Total Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {assignment.settings?.max_attempts || 1}
          </div>
          <div className="text-sm text-white/60">Max Attempts</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            isOverdue ? 'text-red-400' : 'text-purple-400'
          }`}>
            {isOverdue ? 'Overdue' : 'Active'}
          </div>
          <div className="text-sm text-white/60">Status</div>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Assignment Details
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Course:</span>
            <span className="ml-2 text-white/90">{assignment.course_title}</span>
          </div>
          <div>
            <span className="text-white/60">Topic:</span>
            <span className="ml-2 text-white/90">{assignment.assignment_topic}</span>
          </div>
          <div>
            <span className="text-white/60">Created:</span>
            <span className="ml-2 text-white/90">
              {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-white/60">Due:</span>
            <span className={`ml-2 ${isOverdue ? 'text-red-400' : 'text-white/90'}`}>
              {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold border-b border-white/20 pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Questions ({assignment.questions?.length || 0})
        </h4>
        
        {assignment.questions && assignment.questions.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {assignment.questions.map((question, index) => (
              <motion.div
                key={question._id || index}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-semibold">
                      Q{question.question_number}
                    </span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                      {question.points} point{question.points > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                    Correct: {question.correct_option}
                  </span>
                </div>

                <h5 className="font-semibold mb-3 text-white/90">{question.question_text}</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div
                      key={option}
                      className={`p-2 rounded border ${
                        question.correct_option === option
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      <span className="font-semibold">{option}.</span> {question.options[option]}
                      {question.correct_option === option && (
                        <CheckCircle className="w-4 h-4 inline ml-2" />
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mt-2">
                    <div className="text-sm font-semibold text-blue-400 mb-1">Explanation:</div>
                    <div className="text-sm text-white/70">{question.explanation}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No questions found in this assignment</p>
          </div>
        )}
      </div>

      {/* Assignment Settings */}
      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="font-semibold mb-3">Assignment Settings</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Max Attempts:</span>
            <span className="ml-2 text-white/90">{assignment.settings?.max_attempts || 1}</span>
          </div>
          <div>
            <span className="text-white/60">Late Submission:</span>
            <span className="ml-2 text-white/90">
              {assignment.settings?.allow_late_submission ? 'Allowed' : 'Not Allowed'}
            </span>
          </div>
          <div>
            <span className="text-white/60">Late Penalty:</span>
            <span className="ml-2 text-white/90">
              {assignment.settings?.late_submission_penalty || 0}%
            </span>
          </div>
          <div>
            <span className="text-white/60">Show Answers:</span>
            <span className="ml-2 text-white/90">
              {assignment.settings?.show_answers_after_due ? 'After Due Date' : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentView;