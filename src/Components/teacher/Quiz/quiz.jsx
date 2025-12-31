// components/quiz/Quiz.jsx
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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarDays,
  ClipboardList,
  FileCheck,
  TrendingUp,
  Timer,
  Target,
  BarChart3,
  Users as UsersIcon,
  CalendarCheck,
  AlertCircle,
  FolderOpen,
  Grid,
  List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddQuizForm from '../../forms/Addquizform';
import AddAssignmentForm from '../../forms/assignmentForm';
import AssignmentView from '../assignment/assignmentView';

const Quiz = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState(null);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'assignments'
  const [stats, setStats] = useState({
    quizzes: { total: 0, published: 0, draft: 0 },
    assignments: { total: 0, published: 0, upcoming: 0, completed: 0 }
  });

  const navigate = useNavigate();

  // Check if user is authorized teacher
  const checkAuthorization = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/auth/check-teacher', {
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
          fetchTeacherQuizzes();
          fetchTeacherAssignments();
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

  // Fetch teacher's courses
  const fetchTeacherCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/course-materials/courses', {
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
    }
  };

  // Fetch teacher's quizzes
  const fetchTeacherQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/quiz/teacher/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
        updateQuizStats(data.data || []);
      } else if (response.status === 404) {
        console.log('Quiz endpoint not found, using mock data');
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    }
  };

  // Fetch teacher's assignments
  const fetchTeacherAssignments = async () => {
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
        updateAssignmentStats(data.data || []);
      } else if (response.status === 404) {
        console.log('Assignment endpoint not found');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  // Update quiz statistics
  const updateQuizStats = (quizzes) => {
    const stats = {
      total: quizzes.length,
      published: quizzes.filter(q => q.status === 'published').length,
      draft: quizzes.filter(q => q.status === 'draft').length
    };
    setStats(prev => ({ ...prev, quizzes: stats }));
  };

  // Update assignment statistics
  const updateAssignmentStats = (assignments) => {
    const now = new Date();
    const stats = {
      total: assignments.length,
      published: assignments.filter(a => a.status === 'published').length,
      upcoming: assignments.filter(a => new Date(a.due_date) > now).length,
      completed: assignments.filter(a => new Date(a.due_date) <= now).length
    };
    setStats(prev => ({ ...prev, assignments: stats }));
  };

  // Fetch detailed quiz information
  const fetchQuizDetails = async (quizId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/quiz/teacher/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedQuizDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    } finally {
      setLoadingDetails(false);
    }
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

  // Toggle quiz expansion
  const toggleQuizExpansion = async (quizId) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setSelectedQuizDetails(null);
    } else {
      setExpandedQuiz(quizId);
      setExpandedAssignment(null);
      setSelectedAssignmentDetails(null);
      await fetchQuizDetails(quizId);
    }
  };

  // Toggle assignment expansion
  const toggleAssignmentExpansion = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
      setSelectedAssignmentDetails(null);
    } else {
      setExpandedAssignment(assignmentId);
      setExpandedQuiz(null);
      setSelectedQuizDetails(null);
      await fetchAssignmentDetails(assignmentId);
    }
  };

  // Reset page
  const resetPage = () => {
    setExpandedQuiz(null);
    setExpandedAssignment(null);
    setSelectedQuizDetails(null);
    setSelectedAssignmentDetails(null);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    checkAuthorization();
  }, [refreshTrigger]);

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
        <div className="text-white text-xl">Loading...</div>
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
            You are not authorized to access this page. Only teachers can create assessments.
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
              <ClipboardList className="w-8 h-8" />
              <span className="text-2xl font-bold">Assessment Management</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={resetPage}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                title="Refresh Page"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dashboard Title */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-light text-center mb-8">
            Assessment Management Portal
          </motion.h1>

          {/* Statistics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Quiz Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <HelpCircle className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">{stats.quizzes.total}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quizzes</h3>
              <div className="flex justify-between text-sm text-white/70">
                <span>Published: {stats.quizzes.published}</span>
                <span>Draft: {stats.quizzes.draft}</span>
              </div>
            </div>

            {/* Assignment Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <CalendarCheck className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold">{stats.assignments.total}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Assignments</h3>
              <div className="flex justify-between text-sm text-white/70">
                <span>Published: {stats.assignments.published}</span>
                <span>Upcoming: {stats.assignments.upcoming}</span>
              </div>
            </div>

            {/* Submission Stats */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <FileCheck className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold">{stats.assignments.completed}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Completed</h3>
              <div className="text-sm text-white/70">Assignments past due date</div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <div className="text-sm text-white/70">View student performance</div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div variants={itemVariants} className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'quizzes'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              Quizzes
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {stats.quizzes.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'assignments'
                  ? 'bg-white text-green-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
              Assignments
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {stats.assignments.total}
              </span>
            </button>
          </motion.div>

          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Create Quiz Card */}
            <motion.div 
              className={`bg-gradient-to-br ${
                activeTab === 'quizzes'
                  ? 'from-blue-500/20 to-blue-600/20 border-blue-400/50'
                  : 'from-white/10 to-white/5 border-white/20'
              } backdrop-blur-md border rounded-2xl p-6 text-center cursor-pointer transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (courses.length === 0) {
                  alert('Please create a course first before creating quizzes.');
                  return;
                }
                setShowCreateForm(true);
              }}
            >
              <Plus className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Create Quiz</h3>
              <p className="text-white/80 text-sm">Create quizzes and assessments</p>
            </motion.div>

            {/* Create Assignment Card */}
            <motion.div 
              className={`bg-gradient-to-br ${
                activeTab === 'assignments'
                  ? 'from-green-500/20 to-green-600/20 border-green-400/50'
                  : 'from-white/10 to-white/5 border-white/20'
              } backdrop-blur-md border rounded-2xl p-6 text-center cursor-pointer transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (courses.length === 0) {
                  alert('Please create a course first before creating assignments.');
                  return;
                }
                setShowAssignmentForm(true);
              }}
            >
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Daily Assignment</h3>
              <p className="text-white/80 text-sm">Create daily assignments</p>
            </motion.div>

            {/* Analytics Card */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/analytics')}
            >
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-white/80 text-sm">View student performance</p>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <AnimatePresence mode="wait">
            {activeTab === 'quizzes' ? (
              <motion.div
                key="quizzes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <HelpCircle className="w-6 h-6" />
                    Your Quizzes
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                      {quizzes.length} quizzes
                    </span>
                  </div>
                </div>

                {quizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 text-white/50" />
                    <p className="text-white/70 text-lg">No quizzes created yet</p>
                    <p className="text-white/50">Click "Create Quiz" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizzes.map((quiz, index) => (
                      <QuizCard
                        key={quiz._id}
                        quiz={quiz}
                        index={index}
                        isExpanded={expandedQuiz === quiz._id}
                        onToggle={() => toggleQuizExpansion(quiz._id)}
                        loadingDetails={loadingDetails}
                        details={selectedQuizDetails}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <CalendarCheck className="w-6 h-6" />
                    Your Assignments
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">
                      {assignments.length} assignments
                    </span>
                  </div>
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="w-16 h-16 mx-auto mb-4 text-white/50" />
                    <p className="text-white/70 text-lg">No assignments created yet</p>
                    <p className="text-white/50">Click "Daily Assignment" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <AssignmentCard
                        key={assignment._id}
                        assignment={assignment}
                        index={index}
                        isExpanded={expandedAssignment === assignment._id}
                        onToggle={() => toggleAssignmentExpansion(assignment._id)}
                        loadingDetails={loadingDetails}
                        details={selectedAssignmentDetails}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

      {/* Create Quiz Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateQuizForm 
            courses={courses}
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Assignment Form Modal */}
      <AnimatePresence>
        {showAssignmentForm && (
          <CreateAssignmentForm 
  courses={courses}
  onClose={() => setShowAssignmentForm(false)}
  onSuccess={() => {
    setShowAssignmentForm(false);
    setRefreshTrigger(prev => prev + 1);
  }}
/>
        )}
      </AnimatePresence>
      <AssignmentView/>
    </div>
  );
};

// Quiz Card Component
const QuizCard = ({ quiz, index, isExpanded, onToggle, loadingDetails, details }) => {
  return (
    <motion.div
      className="bg-white/10 border border-white/20 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Quiz Header */}
      <div 
        className="p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-2 rounded-lg ${
              isExpanded ? 'bg-blue-500/20' : 'bg-white/10'
            }`}>
              {isExpanded ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{quiz.quiz_title}</h4>
              <p className="text-white/60 text-sm">{quiz.quiz_description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  {quiz.total_questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {quiz.total_points} points
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              quiz.status === 'published' 
                ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                : quiz.status === 'draft'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
            }`}>
              {quiz.status}
            </span>
            <div className="text-right text-sm">
              <div className="text-white/70">{quiz.course_title}</div>
              <div className="text-white/50 text-xs">{quiz.quiz_topic}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Quiz Details */}
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
                <QuizQuestionsDisplay quiz={details} />
              ) : (
                <div className="text-center py-4 text-white/60">
                  Failed to load quiz details
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index, isExpanded, onToggle, loadingDetails, details }) => {
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < now;

  return (
    <motion.div
      className={`bg-white/10 border ${
        isOverdue 
          ? 'border-red-400/50' 
          : 'border-white/20'
      } rounded-xl overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
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
                {isOverdue && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-semibold">
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm mb-2">{assignment.assignment_description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Due: {dueDate.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {assignment.total_questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {assignment.total_points} points
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
            <div className="text-right text-sm">
              <div className="text-white/70">{assignment.course_title}</div>
              <div className="text-white/50 text-xs">{assignment.assignment_topic}</div>
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
                  Failed to load assignment details
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Quiz Questions Display Component
const QuizQuestionsDisplay = ({ quiz }) => {
  return (
    <div className="space-y-6">
      {/* Quiz Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{quiz.total_questions}</div>
          <div className="text-sm text-white/60">Total Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{quiz.total_points}</div>
          <div className="text-sm text-white/60">Total Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{quiz.quiz_settings?.time_limit}</div>
          <div className="text-sm text-white/60">Time Limit (min)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{quiz.quiz_settings?.max_attempts}</div>
          <div className="text-sm text-white/60">Max Attempts</div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold border-b border-white/20 pb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Questions ({quiz.questions?.length || 0})
        </h4>
        
        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {quiz.questions.map((question, index) => (
              <motion.div
                key={question._id || index}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-semibold">
                      Q{question.question_number}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
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
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No questions found in this quiz</p>
          </div>
        )}
      </div>

      {/* Quiz Settings */}
      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="font-semibold mb-3 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Quiz Settings
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Time Limit:</span>
            <span className="ml-2 text-white/90">{quiz.quiz_settings?.time_limit} minutes</span>
          </div>
          <div>
            <span className="text-white/60">Max Attempts:</span>
            <span className="ml-2 text-white/90">{quiz.quiz_settings?.max_attempts}</span>
          </div>
          <div>
            <span className="text-white/60">Show Results:</span>
            <span className="ml-2 text-white/90">
              {quiz.quiz_settings?.show_results ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-white/60">Active:</span>
            <span className="ml-2 text-white/90">
              {quiz.quiz_settings?.is_active ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assignment Questions Display Component
const AssignmentQuestionsDisplay = ({ assignment, isOverdue }) => {
  const dueDate = new Date(assignment.due_date);
  const assignmentDate = new Date(assignment.assignment_date);

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
            <span className="text-white/60">Topic:</span>
            <span className="ml-2 text-white/90">{assignment.assignment_topic}</span>
          </div>
          <div>
            <span className="text-white/60">Course:</span>
            <span className="ml-2 text-white/90">{assignment.course_title}</span>
          </div>
          <div>
            <span className="text-white/60">Date:</span>
            <span className="ml-2 text-white/90">
              {assignmentDate.toLocaleDateString()}
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
          <HelpCircle className="w-5 h-5" />
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
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No questions found in this assignment</p>
          </div>
        )}
      </div>

      {/* Assignment Settings */}
      <div className="bg-white/5 rounded-lg p-4">
        <h5 className="font-semibold mb-3 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Assignment Settings
        </h5>
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

// Create Quiz Form Component
const CreateQuizForm = ({ courses, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (quizData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/quiz/teacher/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Quiz created successfully!' });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create quiz' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
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
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Create New Quiz</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <AddQuizForm 
            courses={courses}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={onClose}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create Assignment Form Component
const CreateAssignmentForm = ({ courses, onClose, onSuccess,onsubmit  }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Update the handleSubmit function in Quiz.jsx (CreateAssignmentForm component)
const handleSubmit = async (assignmentData) => {
  setLoading(true);
  setMessage({ type: '', text: '' });

  console.log('📤 [DEBUG] Assignment data being sent:', assignmentData);

  try {
    const token = localStorage.getItem('token');
    
    // Validate assignment data
    if (!assignmentData.course_id || !assignmentData.assignment_title || !assignmentData.questions) {
      throw new Error('Missing required fields');
    }

    // Ensure questions have proper structure
    const validatedQuestions = assignmentData.questions.map((q, index) => ({
      question_number: index + 1,
      question_text: q.question_text || '',
      question_type: 'mcq',
      options: q.options || { A: '', B: '', C: '', D: '' },
      correct_option: q.correct_option || 'A',
      explanation: q.explanation || '',
      points: q.points || 1
    }));

    // Ensure due_date is proper ISO string
    const dueDateTime = new Date(assignmentData.due_date);
    if (isNaN(dueDateTime.getTime())) {
      throw new Error('Invalid due date');
    }

    const payload = {
      course_id: assignmentData.course_id,
      assignment_title: assignmentData.assignment_title,
      assignment_description: assignmentData.assignment_description || '',
      assignment_topic: assignmentData.assignment_topic || '',
      assignment_date: new Date().toISOString(), // Current date
      due_date: dueDateTime.toISOString(),
      questions: validatedQuestions,
      settings: assignmentData.settings || {
        max_attempts: 1,
        allow_late_submission: false,
        late_submission_penalty: 0,
        show_answers_after_due: false,
        is_active: true
      }
    };

    console.log('📤 [DEBUG] Payload to send:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/assignments/teacher/assignments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 [DEBUG] Response status:', response.status);

    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorText = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error('🔴 [DEBUG] Backend error:', errorText);
      throw new Error(errorText);
    }

    const data = await response.json();
    console.log('✅ [DEBUG] Assignment created:', data);
    
    setMessage({ type: 'success', text: 'Daily assignment created successfully!' });
    
    setTimeout(() => {
      onSuccess();
    }, 1500);

  } catch (error) {
    console.error('🔴 [DEBUG] Form submission error:', error);
    setMessage({ 
      type: 'error', 
      text: `Error: ${error.message || 'Failed to create assignment'}` 
    });
  } finally {
    setLoading(false);
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
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Create Daily Assignment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <AddAssignmentForm 
            courses={courses}
            onSubmit={handleSubmit}
            loading={loading}
            setLoading={setLoading}
            onCancel={onClose}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Settings Icon Component
const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default Quiz;