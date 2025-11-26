// pages/QuizAttempt.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const QuizAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch quiz attempt data
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/quiz/student/attempt/${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setQuizData(data.data.quiz);
          setTimeLeft(data.data.quiz.quiz_settings.time_limit * 60); // minutes → seconds
        }
      } catch (err) {
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
          handleSubmit(); // Auto-submit when time ends
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
        body: JSON.stringify({ answers: submitAnswers, time_taken: quizData.quiz_settings.time_limit * 60 - timeLeft })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      alert('Submission failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading Quiz...</div>;

  if (isSubmitted && result) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Submitted Successfully!</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-10">
            <div className="bg-blue-100 p-6 rounded-xl">
              <p className="text-sm text-blue-600">Score</p>
              <p className="text-3xl font-bold text-blue-800">{result.score.obtained}/{result.score.total}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-xl">
              <p className="text-sm text-green-600">Percentage</p>
              <p className="text-3xl font-bold text-green-800">{result.score.percentage}%</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-xl">
              <p className="text-sm text-purple-600">Correct</p>
              <p className="text-3xl font-bold text-purple-800">{result.score.correct}</p>
            </div>
            <div className="bg-red-100 p-6 rounded-xl">
              <p className="text-sm text-red-600">Wrong</p>
              <p className="text-3xl font-bold text-red-800">{result.score.wrong}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/test')}
            className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Test Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{quizData?.quiz_title}</h1>
          <p className="text-gray-600 mt-1">{quizData?.quiz_description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3 text-2xl font-bold text-red-600">
            <Clock className="h-8 w-8" />
            {formatTime(timeLeft)}
          </div>
          {timeLeft < 300 && <p className="text-sm text-red-600 mt-2">Hurry up! Less than 5 minutes left</p>}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {quizData?.questions.map((q, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4">
              <span className="text-2xl font-bold text-blue-600">Q{idx + 1}.</span>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-800 mb-6">{q.question_text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(q.options).map(([key, value]) => (
                    <label 
                      key={key}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition 
                        ${answers[idx] === key 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        value={key}
                        checked={answers[idx] === key}
                        onChange={() => handleOptionChange(idx, key)}
                        className="mr-4 h-5 w-5 text-blue-600"
                      />
                      <span className="text-lg">{key}. {value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-6 border-t">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-lg font-medium">
            Answered: {Object.keys(answers).length} / {quizData?.questions.length}
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="bg-green-600 text-white px-10 py-4 rounded-lg text-xl font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isSubmitted ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;