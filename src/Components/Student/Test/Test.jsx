// components/Test.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Calendar,
  BarChart3,
  Plus,
  Search,
  Filter,
  BookOpen,
  Target,
  TrendingUp,
  Eye,
  Download,
  Play,
  Clock4,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Test = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [user, setUser] = useState(null);

  // Update the fetchStudentQuizzes function in Test.jsx
// Update the fetchStudentQuizzes function in Test.jsx
const fetchStudentQuizzes = async () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    console.log('Fetching student quizzes...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/quiz/student/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        setQuizzes(result.data || []);
        console.log('Quizzes loaded:', result.data.length);
      } else {
        console.error('API returned error:', result.error);
        setQuizzes([]);
      }
    } else {
      console.error('HTTP error:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      setQuizzes([]);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    } else {
      console.error('Network error:', error);
    }
    setQuizzes([]);
  } finally {
    setLoading(false);
  }
};

// Add this useEffect hook in your Test.jsx component
useEffect(() => {
  fetchStudentQuizzes();
}, []);
  // Categorize quizzes based on status and time
  const categorizeQuizzes = (quizzes) => {
  const now = new Date();

  return quizzes.reduce((acc, quiz) => {
    const settings = quiz.quiz_settings || {};
    const startDate = settings.start_date ? new Date(settings.start_date) : new Date();
    const endDate = settings.end_date ? new Date(settings.end_date) : null;

    const hasStarted = now >= startDate;
    const hasEnded = endDate && now > endDate;

    // Remove the status === 'published' check during development
    if (hasEnded) {
      acc.completed.push({ ...quiz, attempt_status: 'missed' });
    } else if (hasStarted) {
      acc.upcoming.push({ ...quiz, attempt_status: 'available' });
    } else {
      acc.upcoming.push({ ...quiz, attempt_status: 'upcoming' });
    }

    return acc;
  }, { upcoming: [], completed: [] });
};

  const { upcoming, completed } = categorizeQuizzes(quizzes);

  const getFilteredQuizzes = () => {
    const allQuizzes = activeTab === 'upcoming' ? upcoming : completed;
    
    return allQuizzes.filter(quiz => 
      quiz.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.quiz_topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredQuizzes = getFilteredQuizzes();

  const startQuizAttempt = async (quizId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/quiz/student/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      // NOW IT WORKS!
      window.location.href = `/quiz/attempt/${data.data.attempt_id}`;
    } else {
      alert('Failed to start quiz');
    }
  } catch (error) {
    alert('Error starting quiz');
  }
};;

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'upcoming':
        return {
          title: "No Upcoming Tests",
          description: "You don't have any scheduled tests at the moment. Check back later for new assignments.",
          icon: <Clock className="h-16 w-16 text-blue-500" />,
          action: "Tests will appear here when assigned by your teacher"
        };
      case 'completed':
        return {
          title: "No Test History",
          description: "You haven't completed any tests yet. Your completed tests and scores will appear here.",
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          action: "Complete tests to see your results here"
        };
      default:
        return {
          title: "No Tests Available",
          description: "There are no tests to display in this section.",
          icon: <FileText className="h-16 w-16 text-gray-500" />,
          action: "Check other tabs or wait for teacher updates"
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  // Animation variants for framer-motion like effects
  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const pulseAnimation = "animate-pulse";
  const bounceAnimation = "animate-bounce";

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.quiz_settings?.start_date);
    const endDate = quiz.quiz_settings?.end_date ? new Date(quiz.quiz_settings.end_date) : null;
    
    if (quiz.attempt_status === 'missed') {
      return { status: 'missed', label: 'Missed', color: 'red' };
    }
    
    if (endDate && now > endDate) {
      return { status: 'ended', label: 'Ended', color: 'gray' };
    }
    
    if (now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    }
    
    return { status: 'active', label: 'Active', color: 'green' };
  };

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return 'No time limit';
    
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Time expired';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className={`h-8 bg-gray-300 rounded-lg w-64 mx-auto mb-4 ${pulseAnimation}`}></div>
            <div className={`h-4 bg-gray-200 rounded w-96 mx-auto ${pulseAnimation}`}></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${pulseAnimation}`}>
                <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-400 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="h-10 bg-gray-300 rounded-lg w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 transform transition-all duration-700 ease-out opacity-0 animate-fade-in"
             style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Test Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your tests, track progress, and view results in one place
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Tests Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
               style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{upcoming.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span>{upcoming.length > 0 ? 'Tests ready to take' : 'No tests available'}</span>
            </div>
          </div>

          {/* Completed Tests Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
               style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completed.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Target className="h-4 w-4 mr-1 text-blue-500" />
              <span>Total tests attempted</span>
            </div>
          </div>

          {/* Next Test Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
               style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {upcoming.filter(q => getQuizStatus(q).status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock4 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1 text-purple-500" />
              <span>Ready to attempt now</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-700 ease-out opacity-0 animate-fade-in"
             style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          
          {/* Header with Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {['upcoming', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {tab === 'upcoming' ? upcoming.length : completed.length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz List */}
          <div className="p-6">
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="max-w-md mx-auto">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <div className="relative inline-flex items-center justify-center h-24 w-24 bg-blue-50 rounded-full border-4 border-white shadow-lg">
                      {emptyState.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {emptyState.title}
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {emptyState.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuizzes.map((quiz, index) => {
                  const status = getQuizStatus(quiz);
                  const isExpanded = expandedQuiz === quiz._id;
                  
                  return (
                    <div
                      key={quiz._id}
                      className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      {/* Quiz Header */}
                      <div className="p-6 bg-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {quiz.quiz_title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                status.color === 'green' ? 'bg-green-100 text-green-800' :
                                status.color === 'red' ? 'bg-red-100 text-red-800' :
                                status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{quiz.quiz_description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {quiz.course_title}
                              </span>
                              <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {quiz.total_questions} questions
                              </span>
                              <span className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {quiz.total_points} points
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {quiz.quiz_settings?.time_limit} minutes
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            {status.status === 'active' && (
                              <button
                                onClick={() => startQuizAttempt(quiz._id)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Test
                              </button>
                            )}
                            
                            {status.status === 'missed' && (
                              <div className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Missed
                              </div>
                            )}

                            <button
                              onClick={() => setExpandedQuiz(isExpanded ? null : quiz._id)}
                              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  View Details
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Test Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Topic:</span>
                                  <span className="font-medium">{quiz.quiz_topic}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Time Limit:</span>
                                  <span className="font-medium">{quiz.quiz_settings?.time_limit} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Max Attempts:</span>
                                  <span className="font-medium">{quiz.quiz_settings?.max_attempts}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Show Results:</span>
                                  <span className="font-medium">
                                    {quiz.quiz_settings?.show_results ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Time Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Start Date:</span>
                                  <span className="font-medium">
                                    {new Date(quiz.quiz_settings?.start_date).toLocaleString()}
                                  </span>
                                </div>
                                {quiz.quiz_settings?.end_date && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">End Date:</span>
                                    <span className="font-medium">
                                      {new Date(quiz.quiz_settings.end_date).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {status.status === 'active' && quiz.quiz_settings?.end_date && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Time Remaining:</span>
                                    <span className="font-medium text-green-600">
                                      {formatTimeRemaining(quiz.quiz_settings.end_date)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Questions Preview */}
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Questions Preview</h4>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <p className="text-sm text-gray-600 mb-3">
                                This test contains {quiz.total_questions} questions with a total of {quiz.total_points} points.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {quiz.questions && quiz.questions.slice(0, 5).map((question, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    Q{idx + 1}: {question.points}pt
                                  </span>
                                ))}
                                {quiz.questions && quiz.questions.length > 5 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    +{quiz.questions.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Test;