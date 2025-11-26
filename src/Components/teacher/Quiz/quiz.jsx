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
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddQuizForm from '../../forms/Addquizform';

const Quiz = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

      const response = await fetch('http://localhost:3000/api/auth/check-teacher', {
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
      const response = await fetch('http://localhost:3000/api/course-materials/courses', {
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
      const response = await fetch('http://localhost:3000/api/quiz/teacher/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
      } else if (response.status === 404) {
        console.log('Quiz endpoint not found, using mock data');
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    }
  };

  // Fetch detailed quiz information
  const fetchQuizDetails = async (quizId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/quiz/teacher/quizzes/${quizId}`, {
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

  // Toggle quiz expansion
  const toggleQuizExpansion = async (quizId) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setSelectedQuizDetails(null);
    } else {
      setExpandedQuiz(quizId);
      await fetchQuizDetails(quizId);
    }
  };

  // Reset page
  const resetPage = () => {
    setExpandedQuiz(null);
    setSelectedQuizDetails(null);
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
            You are not authorized to access this page. Only teachers can create quizzes.
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
              <HelpCircle className="w-8 h-8" />
              <span className="text-2xl font-bold">Quiz Management</span>
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
            Quiz Management Portal
          </motion.h1>

          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
            {/* Create Quiz Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
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
              <Plus className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Create Quiz</h3>
              <p className="text-white/80 text-sm">Create new quizzes and assessments</p>
            </motion.div>

            {/* View Quiz Analytics Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/quiz-analytics')}
            >
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Quiz Analytics</h3>
              <p className="text-white/80 text-sm">View student performance and analytics</p>
            </motion.div>

            {/* Manage Questions Card */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/questions-bank')}
            >
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Question Bank</h3>
              <p className="text-white/80 text-sm">Manage question repository</p>
            </motion.div>
          </motion.div>

          {/* Quizzes Section */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Your Quizzes</h3>
              <div className="flex items-center gap-4">
                <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                  {quizzes.length} quizzes
                </span>
                <button
                  onClick={resetPage}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
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
                  <motion.div
                    key={quiz._id}
                    className="bg-white/10 border border-white/20 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Quiz Header */}
                    <div 
                      className="p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                      onClick={() => toggleQuizExpansion(quiz._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${
                            expandedQuiz === quiz._id ? 'bg-blue-500/20' : 'bg-white/10'
                          }`}>
                            {expandedQuiz === quiz._id ? 
                              <ChevronUp className="w-5 h-5" /> : 
                              <ChevronDown className="w-5 h-5" />
                            }
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{quiz.quiz_title}</h4>
                            <p className="text-white/60 text-sm">{quiz.quiz_description}</p>
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
                            <div className="text-white/70">{quiz.total_questions} questions</div>
                            <div className="text-white/50">{quiz.total_points} points</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Quiz Details */}
                    <AnimatePresence>
                      {expandedQuiz === quiz._id && (
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
                            ) : selectedQuizDetails ? (
                              <QuizQuestionsDisplay quiz={selectedQuizDetails} />
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
                ))}
              </div>
            )}
          </motion.div>

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
    </div>
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
        <h4 className="text-lg font-semibold border-b border-white/20 pb-2">
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
        <h5 className="font-semibold mb-3">Quiz Settings</h5>
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

// Create Quiz Form Component (same as before)
const CreateQuizForm = ({ courses, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (quizData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/quiz/teacher/quizzes', {
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

export default Quiz;