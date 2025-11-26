// pages/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Users, Target, TrendingUp, Award, Clock, AlertCircle } from 'lucide-react';

const AdminAnalytics = () => {
  const [quizStats, setQuizStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizScores();
  }, []);

  const fetchQuizScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://edulearnbackend-ffiv.onrender.com/api/quiz/admin/scores', {
  headers: { Authorization: `Bearer ${token}` }
});

      const data = await res.json();
      if (data.success) {
        setQuizStats(data.data || []);
      } else {
        setError('Failed to load quiz scores');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalStudents = quizStats.length;
  const avgScore = quizStats.length > 0 
    ? (quizStats.reduce((acc, s) => acc + s.score.percentage, 0) / quizStats.length).toFixed(1)
    : 0;
  const passedStudents = quizStats.filter(s => s.score.percentage >= 50).length;
  const topScorer = quizStats.reduce((prev, current) => 
    (prev.score?.percentage || 0) > (current.score?.percentage || 0) ? prev : current, {}
  );

  const chartData = quizStats.map((s, i) => ({
    name: s.student_email?.split('@')[0] || `Student ${i+1}`,
    score: s.score?.percentage || 0,
    correct: s.score?.correct || 0,
    total: s.score?.total || 0
  }));

  const passFailData = [
    { name: 'Passed (≥50%)', value: passedStudents, color: '#10b981' },
    { name: 'Failed (<50%)', value: totalStudents - passedStudents, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
            <BarChart className="h-12 w-12 text-indigo-600" />
            Quiz Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">Real-time performance of all students</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Total Students</p>
            <p className="text-4xl font-bold text-gray-800">{totalStudents}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition">
            <Target className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Average Score</p>
            <p className="text-4xl font-bold text-gray-800">{avgScore}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Pass Rate</p>
            <p className="text-4xl font-bold text-gray-800">
              {totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition">
            <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Top Scorer</p>
            <p className="text-xl font-bold text-gray-800">
              {topScorer.student_email || 'N/A'}
            </p>
            <p className="text-3xl font-bold text-purple-600">{topScorer.score?.percentage || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Student Scores</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pass vs Fail</h2>
            <div className="">
              <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="70%"
                  cy="70%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-green-600">{passedStudents}</p>
              <p className="text-gray-600">Students Successfully Completed the course eligible for certificate</p>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Quiz Results</h2>
          {quizStats.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="h-20 w-20 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No quiz attempts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Email</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Score</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Correct</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Wrong</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quizStats.map((stat, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-medium">{stat.student_email}</td>
                      <td className="text-center font-bold text-xl">
                        <span className={stat.score.percentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {stat.score.percentage}%
                        </span>
                      </td>
                      <td className="text-center text-green-600 font-semibold">{stat.score.correct}</td>
                      <td className="text-center text-red-600 font-semibold">{stat.score.wrong}</td>
                      <td className="text-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          stat.score.percentage >= 50 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.score.percentage >= 50 ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;