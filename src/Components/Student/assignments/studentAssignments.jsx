// components/student/StudentAssignmentView.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays,
  Clock,
  Target,
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
  CalendarClock,
  PlayCircle,
  PauseCircle,
  Send,
  FileQuestion,
  Brain,
  Trophy,
  Star,
  Zap,
  BrainCircuit,
  Calculator,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Shield,
  Lock,
  Unlock,
  Hourglass,
  Calendar,
  CheckSquare,
  XCircle,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Notebook,
  FilePlus,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const StudentAssignmentView = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed, upcoming
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    upcoming: 0,
    dueToday: 0,
    totalPoints: 0
  });
  const [todaySummary, setTodaySummary] = useState({
    pending: 0,
    completed: 0,
    due_today: 0,
    upcoming: 0,
    assignments: []
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isTakingAssignment, setIsTakingAssignment] = useState(false);
  const [currentAssignmentData, setCurrentAssignmentData] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  const navigate = useNavigate();
  const { assignmentId } = useParams();

  // Fetch user data and assignments
  useEffect(() => {
    fetchUserData();
    fetchAssignments();
    fetchTodaySummary();
    fetchStreak();
  }, [refreshTrigger]);

  // Timer effect for assignment
  useEffect(() => {
    let interval;
    if (timer && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, timeRemaining]);

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch all assignments for student
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/assignments/student/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data || []);
        updateStats(data.data || []);
      } else {
        console.error('Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's summary
  const fetchTodaySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/assignments/student/assignments/today-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodaySummary(data.data || {
          pending: 0,
          completed: 0,
          due_today: 0,
          upcoming: 0,
          assignments: []
        });
      }
    } catch (error) {
      console.error('Error fetching today summary:', error);
    }
  };

  // Fetch streak data
  const fetchStreak = async () => {
    // Mock streak data - in production, fetch from backend
    const mockStreak = Math.floor(Math.random() * 15) + 1;
    setStreak(mockStreak);
    
    // Mock achievements
    const mockAchievements = [
      { id: 1, name: 'Quick Learner', icon: '⚡', unlocked: true },
      { id: 2, name: 'Perfect Score', icon: '🎯', unlocked: false },
      { id: 3, name: 'Consistent', icon: '📅', unlocked: true },
      { id: 4, name: 'Mastermind', icon: '🧠', unlocked: false }
    ];
    setAchievements(mockAchievements);
  };

  // Update statistics
  const updateStats = (assignments) => {
    const now = new Date();
    const stats = {
      total: assignments.length,
      pending: assignments.filter(a => a.submission_status === 'pending' || a.submission_status === 'pending_late').length,
      completed: assignments.filter(a => a.submission_status === 'submitted' || a.submission_status === 'late').length,
      upcoming: assignments.filter(a => new Date(a.due_date) > now && a.submission_status !== 'submitted' && a.submission_status !== 'late').length,
      dueToday: assignments.filter(a => {
        const dueDate = new Date(a.due_date);
        const isToday = dueDate.toDateString() === now.toDateString();
        return isToday && (a.submission_status === 'pending' || a.submission_status === 'pending_late');
      }).length,
      totalPoints: assignments.reduce((sum, a) => sum + (a.total_points || 0), 0)
    };
    setStats(stats);
  };

  // Start assignment attempt
  const startAssignment = async (assignmentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/assignments/student/assignments/${assignmentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentAssignmentData(data.data.assignment);
        setSubmissionId(data.data.submission_id);
        setAnswers(data.data.assignment.questions.map(q => ({
          question_number: q.question_number,
          selected_option: null
        })));
        
        // Set timer based on assignment settings
        const timeLimit = data.data.assignment.settings?.time_limit || 60; // Default 60 minutes
        setTimeRemaining(timeLimit * 60); // Convert to seconds
        setTimer(timeLimit * 60);
        
        setIsTakingAssignment(true);
        setShowResults(false);
        setResults(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start assignment');
      }
    } catch (error) {
      console.error('Error starting assignment:', error);
      alert('Error starting assignment');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionNumber, option) => {
    setAnswers(prev => prev.map(answer => 
      answer.question_number === questionNumber 
        ? { ...answer, selected_option: option }
        : answer
    ));
  };

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto submit when time runs out
  const handleAutoSubmit = async () => {
    if (submissionId && answers.length > 0) {
      alert('Time is up! Submitting your assignment...');
      await submitAssignment();
    }
  };

  // Submit assignment
  const submitAssignment = async () => {
    if (!submissionId) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/assignments/student/submissions/${submissionId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
        setShowResults(true);
        
        // Show celebration animation
        triggerCelebration();
        
        // Refresh assignments list
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger celebration animation
  const triggerCelebration = () => {
    // Create confetti effect
    const confetti = document.createElement('div');
    confetti.className = 'confetti-overlay';
    confetti.innerHTML = `
      <style>
        .confetti-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--color);
          top: -10px;
          animation: fall linear forwards;
        }
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      </style>
    `;
    
    document.body.appendChild(confetti);
    
    // Create confetti particles
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    for (let i = 0; i < 150; i++) {
      const confettiParticle = document.createElement('div');
      confettiParticle.className = 'confetti';
      confettiParticle.style.left = `${Math.random() * 100}vw`;
      confettiParticle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confettiParticle.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confettiParticle.style.animationDelay = `${Math.random() * 1}s`;
      confetti.appendChild(confettiParticle);
    }
    
    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 5000);
  };

  // Exit assignment view
  const exitAssignment = () => {
    setIsTakingAssignment(false);
    setCurrentAssignmentData(null);
    setSubmissionId(null);
    setAnswers([]);
    setTimer(null);
    setTimeRemaining(0);
    setShowResults(false);
    setResults(null);
  };

  // Get filtered assignments based on active tab
  const getFilteredAssignments = () => {
    const now = new Date();
    return assignments.filter(assignment => {
      switch (activeTab) {
        case 'pending':
          return assignment.submission_status === 'pending' || assignment.submission_status === 'pending_late';
        case 'completed':
          return assignment.submission_status === 'submitted' || assignment.submission_status === 'late';
        case 'upcoming':
          const dueDate = new Date(assignment.due_date);
          return dueDate > now && assignment.submission_status !== 'submitted' && assignment.submission_status !== 'late';
        default:
          return true;
      }
    });
  };

  // Calculate progress percentage
  const calculateProgress = (assignment) => {
    if (!currentAssignmentData || !answers) return 0;
    const answered = answers.filter(a => a.selected_option !== null).length;
    return Math.round((answered / currentAssignmentData.questions.length) * 100);
  };

  if (loading && !isTakingAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading your assignments...
        </div>
      </div>
    );
  }

  // If taking assignment, show assignment interface
  if (isTakingAssignment && currentAssignmentData) {
    return (
      <AssignmentInterface
        assignment={currentAssignmentData}
        answers={answers}
        onAnswerSelect={handleAnswerSelect}
        timeRemaining={timeRemaining}
        progress={calculateProgress(currentAssignmentData)}
        onExit={exitAssignment}
        onSubmit={submitAssignment}
        submitting={submitting}
        showResults={showResults}
        results={results}
        streak={streak}
      />
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
              <Notebook className="w-8 h-8" />
              <span className="text-2xl font-bold">Daily Assignments</span>
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
              <div className="flex items-center gap-2 text-white/80">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{streak} day streak</span>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-light mb-2">
              Hello, <span className="font-bold">{user?.name || 'Student'}</span>! 👋
            </h1>
            <p className="text-white/70 text-lg">Your daily learning journey continues...</p>
          </div>

          {/* Today's Overview Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Due Today Card */}
            <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <CalendarClock className="w-10 h-10 text-red-300" />
                <span className="text-3xl font-bold">{todaySummary.due_today}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Due Today</h3>
              <p className="text-white/70 text-sm">Assignments with today's deadline</p>
            </div>

            {/* Pending Card */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Hourglass className="w-10 h-10 text-yellow-300" />
                <span className="text-3xl font-bold">{todaySummary.pending}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pending</h3>
              <p className="text-white/70 text-sm">Awaiting your submission</p>
            </div>

            {/* Completed Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckSquare className="w-10 h-10 text-green-300" />
                <span className="text-3xl font-bold">{todaySummary.completed}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Completed</h3>
              <p className="text-white/70 text-sm">Great work today!</p>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-10 h-10 text-purple-300" />
                <div className="text-right">
                  <span className="text-3xl font-bold block">{streak}</span>
                  <span className="text-sm text-white/70">days</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learning Streak</h3>
              <p className="text-white/70 text-sm">Keep it going!</p>
            </div>
          </motion.div>

          {/* Quick Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: <FileCheck className="w-5 h-5" />, value: stats.total, label: 'Total', color: 'text-blue-400' },
              { icon: <Clock className="w-5 h-5" />, value: stats.pending, label: 'Pending', color: 'text-yellow-400' },
              { icon: <CheckCircle className="w-5 h-5" />, value: stats.completed, label: 'Completed', color: 'text-green-400' },
              { icon: <CalendarDays className="w-5 h-5" />, value: stats.upcoming, label: 'Upcoming', color: 'text-purple-400' },
              { icon: <Target className="w-5 h-5" />, value: stats.totalPoints, label: 'Total Points', color: 'text-red-400' },
              { icon: <TrendingUp className="w-5 h-5" />, value: `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%`, label: 'Progress', color: 'text-teal-400' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <div className={`${stat.color} flex justify-center mb-2`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Achievements Section */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Recent Achievements
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex-shrink-0 w-32 bg-gradient-to-br ${achievement.unlocked ? 'from-yellow-500/20 to-amber-600/20 border-yellow-400/30' : 'from-gray-500/20 to-gray-600/20 border-gray-400/30'} backdrop-blur-md border rounded-xl p-4 text-center`}>
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-medium mb-1">{achievement.name}</div>
                  <div className={`text-xs ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                    {achievement.unlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div 
            className="flex gap-2 mb-6 overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { id: 'pending', label: 'Pending Assignments', icon: <Clock className="w-4 h-4" />, count: stats.pending },
              { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, count: stats.completed },
              { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" />, count: stats.upcoming },
              { id: 'all', label: 'All Assignments', icon: <FileText className="w-4 h-4" />, count: stats.total }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white/20'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Assignments Grid */}
          <motion.div 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {getFilteredAssignments().length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-white/50" />
                </motion.div>
                <p className="text-white/70 text-lg mb-2">No assignments found</p>
                <p className="text-white/50 text-sm">
                  {activeTab === 'pending' 
                    ? "Great! You're all caught up with your assignments." 
                    : activeTab === 'completed'
                    ? "Start completing assignments to see them here."
                    : "No upcoming assignments at the moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAssignments().map((assignment, index) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    index={index}
                    onStart={() => startAssignment(assignment._id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index, onStart }) => {
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const isDue = dueDate < now;
  const isUpcoming = dueDate > now;
  const isSubmitted = assignment.submission_status === 'submitted' || assignment.submission_status === 'late';
  const isPending = assignment.submission_status === 'pending' || assignment.submission_status === 'pending_late';

  // Calculate time remaining
  const timeRemaining = dueDate.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

  let statusText = '';
  let statusColor = '';
  let statusIcon = null;

  if (isSubmitted) {
    statusText = 'Completed';
    statusColor = 'bg-green-500/20 text-green-400 border-green-400/50';
    statusIcon = <CheckCircle className="w-4 h-4" />;
  } else if (isDue) {
    statusText = assignment.settings?.allow_late_submission ? 'Late Submission Allowed' : 'Overdue';
    statusColor = 'bg-red-500/20 text-red-400 border-red-400/50';
    statusIcon = <Clock className="w-4 h-4" />;
  } else if (hoursRemaining <= 24) {
    statusText = `Due in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`;
    statusColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50';
    statusIcon = <Clock className="w-4 h-4" />;
  } else {
    statusText = 'Upcoming';
    statusColor = 'bg-blue-500/20 text-blue-400 border-blue-400/50';
    statusIcon = <Calendar className="w-4 h-4" />;
  }

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="p-6">
        {/* Assignment Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusColor}`}>
              {statusIcon}
              {statusText}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{assignment.total_points || 0}</div>
            <div className="text-xs text-white/60">points</div>
          </div>
        </div>

        {/* Assignment Title */}
        <h3 className="text-xl font-bold mb-2 text-white line-clamp-1">{assignment.assignment_title}</h3>
        
        {/* Description */}
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{assignment.assignment_description}</p>

        {/* Course Info */}
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-300" />
          <span className="text-sm text-white/80">{assignment.course_title}</span>
        </div>

        {/* Assignment Details */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="text-center bg-white/5 rounded-lg p-2">
            <FileQuestion className="w-5 h-5 mx-auto mb-1 text-blue-300" />
            <div className="text-lg font-bold">{assignment.total_questions}</div>
            <div className="text-xs text-white/60">Questions</div>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-2">
            <TargetIcon className="w-5 h-5 mx-auto mb-1 text-green-300" />
            <div className="text-lg font-bold">{assignment.total_points}</div>
            <div className="text-xs text-white/60">Points</div>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white/80">
              Due: {dueDate.toLocaleDateString()}
            </span>
          </div>
          {assignment.current_submission && (
            <div className="flex items-center gap-1">
              <TrophyIcon className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold text-yellow-300">
                {assignment.current_submission.score?.percentage || 0}%
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={!isPending}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isPending
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
              : isSubmitted
              ? 'bg-green-600/20 text-green-400 cursor-default'
              : 'bg-gray-600/20 text-gray-400 cursor-default'
          }`}
        >
          {isPending ? (
            <>
              <PlayCircle className="w-5 h-5" />
              Start Assignment
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Completed
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Not Available
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// Assignment Interface Component
const AssignmentInterface = ({ assignment, answers, onAnswerSelect, timeRemaining, progress, onExit, onSubmit, submitting, showResults, results, streak }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const currentQ = assignment.questions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < assignment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  if (showResults && results) {
    return (
      <ResultsView
        results={results}
        assignment={assignment}
        streak={streak}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Assignments</span>
              </button>
            </div>
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <div className="text-lg font-mono font-bold">
                  <span className={`${timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-300">{progress}%</span>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Questions List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                Questions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {assignment.questions.map((q, index) => {
                  const answer = answers.find(a => a.question_number === q.question_number);
                  const isAnswered = answer?.selected_option;
                  const isCurrent = index === currentQuestion;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(index)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-lg'
                          : isAnswered
                          ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-bold">Q{q.question_number}</span>
                        <span className="text-xs opacity-75">{q.points} pt</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {isAnswered && <CheckCircle className="w-4 h-4" />}
                        {isCurrent && <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={onSubmit}
                disabled={submitting || progress < 100}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  progress >= 100
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02]'
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : progress >= 100 ? (
                  <>
                    <Send className="w-6 h-6" />
                    Submit Assignment
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    Complete All Questions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8">
              {/* Question Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {assignment.assignment_title}
                  </h2>
                  <p className="text-gray-300">{assignment.assignment_description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-400">
                    Q{currentQ.question_number}
                  </div>
                  <div className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {assignment.questions.length}
                  </div>
                </div>
              </div>

              {/* Question Points */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/50">
                  <Target className="w-4 h-4" />
                  {currentQ.points} point{currentQ.points > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question Text */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-4 leading-relaxed">
                  {currentQ.question_text}
                </h3>
                {currentQ.image_url && (
                  <div className="mb-6">
                    <img 
                      src={currentQ.image_url} 
                      alt="Question visual" 
                      className="max-w-full rounded-lg border border-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4 mb-10">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const isSelected = answers.find(a => a.question_number === currentQ.question_number)?.selected_option === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => onAnswerSelect(currentQ.question_number, option)}
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.01] ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {option}
                        </div>
                        <div className="flex-1">
                          <p className={`text-lg ${
                            isSelected ? 'text-white font-medium' : 'text-gray-300'
                          }`}>
                            {currentQ.options[option]}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-blue-400 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentQuestion === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setReviewMode(!reviewMode)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
                  >
                    <Lightbulb className="w-5 h-5" />
                    {reviewMode ? 'Exit Review' : 'Mark for Review'}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentQuestion === assignment.questions.length - 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentQuestion === assignment.questions.length - 1
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Results View Component
const ResultsView = ({ results, assignment, streak, onExit }) => {
  const score = results.score || { percentage: 0, total_questions: 0, correct_answers: 0 };
  const correctAnswers = results.correct_answers || [];

  // Calculate grade
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'from-emerald-500 to-green-500', emoji: '🎉' };
    if (percentage >= 80) return { grade: 'A', color: 'from-green-500 to-emerald-500', emoji: '🌟' };
    if (percentage >= 70) return { grade: 'B', color: 'from-blue-500 to-cyan-500', emoji: '👍' };
    if (percentage >= 60) return { grade: 'C', color: 'from-yellow-500 to-orange-500', emoji: '📚' };
    if (percentage >= 50) return { grade: 'D', color: 'from-orange-500 to-red-500', emoji: '💪' };
    return { grade: 'F', color: 'from-red-500 to-pink-500', emoji: '📖' };
  };

  const gradeInfo = getGrade(score.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">{gradeInfo.emoji}</div>
            <h1 className="text-4xl font-bold text-white mb-2">Assignment Submitted!</h1>
            <p className="text-gray-300 text-lg">Great job completing your daily assignment</p>
          </motion.div>
        </div>

        {/* Score Display */}
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              className={`inline-block bg-gradient-to-r ${gradeInfo.color} text-white px-8 py-4 rounded-2xl shadow-lg mb-6`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              <div className="text-6xl font-bold mb-2">{score.percentage}%</div>
              <div className="text-2xl font-semibold">{gradeInfo.grade}</div>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">{score.correct_answers || 0}</div>
                <div className="text-gray-300">Correct</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400">{score.total_questions - (score.correct_answers || 0)}</div>
                <div className="text-gray-300">Incorrect</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400">{score.total_questions}</div>
                <div className="text-gray-300">Total Questions</div>
              </div>
            </div>

            {/* Streak Update */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-10 h-10 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">Your streak continues!</div>
                  <div className="text-gray-300">You've maintained a {streak} day learning streak</div>
                </div>
                <div className="text-4xl font-bold text-yellow-400">🔥</div>
              </div>
            </div>

            {/* Review Answers Button */}
            <button
              onClick={() => {/* Implement review functionality */}}
              className="w-full mb-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <FileCheck className="w-6 h-6" />
              Review Answers
            </button>

            {/* Exit Button */}
            <button
              onClick={onExit}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold text-lg transition-all duration-300"
            >
              Return to Assignments
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentAssignmentView;