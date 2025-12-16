// components/Login.jsx - FULLY RESPONSIVE + SCROLLABLE ON MOBILE
import React, { useState } from 'react';
import { X, BookOpen, Eye, EyeOff, Mail, GraduationCap, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'student', label: 'Student', icon: GraduationCap, color: 'blue' },
    { value: 'teacher', label: 'Teacher', icon: Users, color: 'green' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loginData = { password: formData.password };
      if (formData.identifier.includes('@')) {
        loginData.email = formData.identifier;
      } else {
        loginData.username = formData.identifier;
      }

      const response = await fetch(' https://edulearnbackend-ffiv.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role !== selectedRole) {
          setError(`You are a ${data.user.role}, but selected ${selectedRole}. Choose correct role.`);
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.data);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(data.user));

        alert(`Welcome back, ${data.user.name}!`);

        if (onLoginSuccess) onLoginSuccess(data.user);
        window.dispatchEvent(new Event('authChange'));
        onClose();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Server might be down.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* SCROLLABLE CONTAINER */}
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* HEADER + CLOSE BUTTON */}
        <div className="relative p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Welcome to EduLearn</h2>
          <p className="text-indigo-100 mt-2">Choose your role and sign in</p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
          {/* Role Selection */}
          <div className="mb-8">
            <p className="text-center text-sm font-medium text-gray-700 mb-5">I am signing in as:</p>
            <div className="grid grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    disabled={loading}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3
                      ${isActive 
                        ? `border-${role.color}-500 bg-${role.color}-50 shadow-xl scale-110` 
                        : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                      }`}
                  >
                    <Icon className={`h-10 w-10 ${isActive ? `text-${role.color}-600` : 'text-gray-500'}`} />
                    <span className={`font-bold text-sm ${isActive ? `text-${role.color}-700` : 'text-gray-700'}`}>
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="your@email.com or username"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-14 pl-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button onClick={onSwitchToSignup} className="text-indigo-600 font-bold hover:underline">
                Create one now
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;