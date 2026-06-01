// pages/QuizAttempt.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, XCircle, RotateCcw, BarChart3, Award, Target, BookOpen } from 'lucide-react';

const QuizAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [showAttemptHistory, setShowAttemptHistory] = useState(false);

  // Fetch quiz attempt data
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch current attempt
        const attemptRes = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/quiz/student/attempt/${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const attemptData = await attemptRes.json();
        
        if (attemptData.success) {
          setQuizData(attemptData.data.quiz);
          setTimeLeft(attemptData.data.quiz.quiz_settings.time_limit * 60);
          
          // Fetch previous attempts for this quiz
          const quizId = attemptData.data.quiz._id;
          const historyRes = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/quiz/student/quiz/${quizId}/attempts`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const historyData = await historyRes.json();
          
          if (historyData.success && historyData.data) {
            setPreviousAttempts(historyData.data);
          }
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
        alert('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleOptionChange = (questionIndex, option) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const submitAnswers = Object.keys(answers).map(qIdx => ({
      question_number: parseInt(qIdx) + 1,
      selected_option: answers[qIdx]
    }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/quiz/student/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          answers: submitAnswers, 
          time_taken: (quizData?.quiz_settings?.time_limit * 60) - timeLeft 
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error || 'Submission failed');
        setIsSubmitted(false);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Submission failed');
      setIsSubmitted(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // RESULTS VIEW - Complete redesign for better data display
  if (isSubmitted && result) {
    const scoreData = result.score || {};
    const totalQuestions = quizData?.total_questions || 0;
    const correctAnswers = scoreData.correct_answers || scoreData.correct || 0;
    const wrongAnswers = scoreData.wrong_answers || scoreData.wrong || (totalQuestions - correctAnswers);
    const percentage = scoreData.percentage || 0;
    const earnedPoints = scoreData.earned_points || scoreData.obtained || 0;
    const totalPoints = scoreData.total_points || scoreData.total || 0;
    
    // Determine grade and message
    let grade = '';
    let gradeColor = '';
    let message = '';
    
    if (percentage >= 90) {
      grade = 'A+';
      gradeColor = 'text-green-700';
      message = 'Excellent work! Outstanding performance! 🎉';
    } else if (percentage >= 80) {
      grade = 'A';
      gradeColor = 'text-green-600';
      message = 'Great job! Keep up the good work! 👏';
    } else if (percentage >= 70) {
      grade = 'B';
      gradeColor = 'text-blue-600';
      message = 'Good effort! You\'re doing well! 👍';
    } else if (percentage >= 60) {
      grade = 'C';
      gradeColor = 'text-yellow-600';
      message = 'Not bad! Review the material and try again! 📚';
    } else if (percentage >= 50) {
      grade = 'D';
      gradeColor = 'text-orange-600';
      message = 'You passed! But there\'s room for improvement. 💪';
    } else {
      grade = 'F';
      gradeColor = 'text-red-600';
      message = 'Don\'t give up! Review and try the next attempt. 🌟';
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 mb-8 text-white transform transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Quiz Completed!</h1>
                <p className="text-green-100 mt-1">Your answers have been submitted successfully</p>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transform transition-all duration-500 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-400" />
                Your Score
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 shadow-lg">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{percentage}%</div>
                    <div className="text-sm opacity-90">Score</div>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${gradeColor} mb-2`}>Grade: {grade}</div>
                <p className="text-gray-600 text-lg">{message}</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                  <div className="text-sm text-gray-600">Wrong</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{earnedPoints}/{totalPoints}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
              </div>

              {/* Attempt Info */}
              {result.attempt_info && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex flex-wrap justify-between text-sm">
                    <span className="text-gray-600">Attempt #{result.attempt_info.attempt_number}</span>
                    <span className="text-gray-600">Time Taken: {Math.floor(result.attempt_info.time_taken / 60)}m {result.attempt_info.time_taken % 60}s</span>
                    <span className="text-gray-600">Submitted: {formatDateTime(result.attempt_info.submitted_at)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Results by Question */}
          {result.detailed_results && result.detailed_results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Detailed Results
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {result.detailed_results.map((q, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 ${q.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {q.is_correct ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800">Question {q.question_number}: {q.question_text}</h3>
                          <span className={`text-sm font-medium px-2 py-1 rounded ${q.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {q.points_earned}/{q.points} points
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">Your answer: <span className="font-medium">{q.selected_option || 'Not answered'}</span></p>
                          {!q.is_correct && q.correct_option && (
                            <p className="text-green-700">Correct answer: {q.correct_option}</p>
                          )}
                          {q.explanation && (
                            <p className="text-gray-600 text-sm mt-2 italic">💡 {q.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attempt History Dropdown */}
          {previousAttempts && previousAttempts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <button
                onClick={() => setShowAttemptHistory(!showAttemptHistory)}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  <span className="text-xl font-bold">Previous Attempts ({previousAttempts.length})</span>
                </div>
                <span className="text-2xl">{showAttemptHistory ? '▲' : '▼'}</span>
              </button>
              
              {showAttemptHistory && (
                <div className="p-6 space-y-4">
                  {previousAttempts.map((attempt, idx) => (
                    <div key={attempt._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <span className="font-semibold text-gray-800">Attempt #{attempt.attempt_number}</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {formatDateTime(attempt.submitted_at)}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">{attempt.score?.percentage || 0}%</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">{attempt.score?.earned_points || 0}/{attempt.score?.total_points || 0}</div>
                            <div className="text-xs text-gray-500">Points</div>
                          </div>
                          <button
                            onClick={() => navigate(`/quiz/attempt/${attempt._id}/review`)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/test')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Back to Tests
            </button>
            {result.can_retake && (
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // QUIZ ATTEMPT VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{quizData?.quiz_title}</h1>
            <p className="text-gray-600 mt-1">{quizData?.quiz_description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 text-2xl font-bold text-red-600">
              <Clock className="h-8 w-8" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            {timeLeft < 300 && timeLeft > 0 && (
              <p className="text-sm text-red-600 mt-2 animate-pulse">⏰ Hurry up! Less than 5 minutes left</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Object.keys(answers).length} of {quizData?.questions.length} answered</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / (quizData?.questions.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quizData?.questions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800 mb-4">{q.question_text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(q.options).map(([key, value]) => (
                      <label 
                        key={key}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 
                          ${answers[idx] === key 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={key}
                          checked={answers[idx] === key}
                          onChange={() => handleOptionChange(idx, key)}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="font-medium text-gray-700">{key}.</span>
                        <span className="ml-2 text-gray-600">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4 bg-white shadow-2xl rounded-xl p-4 mt-8 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-gray-700">
                Answered: <span className="text-blue-600 font-bold">{Object.keys(answers).length}</span> 
                <span className="text-gray-400"> / {quizData?.questions.length}</span>
              </p>
              {Object.keys(answers).length < (quizData?.questions.length || 0) && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ {quizData?.questions.length - Object.keys(answers).length} questions remaining
                </p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSubmitted ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;