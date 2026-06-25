// components/CoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { courses, categories } from '../services/Coursefile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Users, 
  Clock, 
  Filter, 
  Search,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Lock,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  Award,
  RefreshCw,
  Globe,
  Video,
  FileText,
  Zap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('userData');
      
      if (token && loggedIn && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authorized student
  const isAuthorizedStudent = () => {
    return isLoggedIn && user?.role === 'student';
  };

  // Filter courses based on category and search
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.students - a.students;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Handle enroll button click
  const handleEnrollClick = (course) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (!isAuthorizedStudent()) {
      alert(`Enrollment is only available for students. Your current role is ${user?.role}.`);
      return;
    }
    
    navigate('/personal-form', { 
      state: { 
        course: course,
        courseTrack: course.title,
        coursePrice: course.price
      } 
    });
  };

  // Get button text based on user status
  const getButtonText = () => {
    if (!isLoggedIn) return 'Login to Enroll';
    if (user?.role !== 'student') return 'Students Only';
    return 'Enroll Now';
  };

  // Get button styles based on user status
  const getButtonStyles = () => {
    const baseStyles = "w-full py-3 rounded-xl font-semibold transition-all duration-300 transform ";
    
    if (isAuthorizedStudent()) {
      return baseStyles + "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] shadow-indigo-500/25";
    } else {
      return baseStyles + "bg-gray-400 text-gray-700 cursor-not-allowed shadow-gray-400/25";
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium animate-pulse">Loading courses...</p>
          <p className="text-gray-500 text-sm mt-2">Discover amazing learning opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-6 shadow-xl overflow-hidden relative min-h-screen">
      {/* Animated Background */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Courses</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Discover courses designed to help you achieve your career goals. Learn from industry experts and join thousands of successful students.
          </motion.p>
          
          {/* User Status Indicator */}
          {isLoggedIn && (
            <motion.div 
              className="mt-4 inline-flex items-center px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-indigo-200 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <User className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-gray-700">
                Logged in as: <strong className="text-indigo-700">{user?.name}</strong>
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                <Shield className="w-3 h-3" />
                {user?.role}
              </span>
            </motion.div>
          )}
        </div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-indigo-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-indigo-200 rounded-xl px-4 py-3 bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-indigo-200 rounded-xl px-4 py-3 bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {currentCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Course Image with Gradient Overlay */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {course.popular && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold shadow-lg">
                          <TrendingUp className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full text-xs font-semibold shadow-lg">
                        {course.category}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold text-gray-900 shadow-lg">
                      Rs {course.price.toLocaleString()}
                    </div>
                    
                    {/* Overlay for non-student users */}
                    {!isAuthorizedStudent() && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white text-center p-4">
                          <Lock className="h-10 w-10 mx-auto mb-2" />
                          <p className="font-semibold text-sm">Enrollment Available for Students Only</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 text-indigo-500 mr-2" />
                      <span>by {course.instructor}</span>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-gray-700">{course.rating}</span>
                      </div>
                    </div>

                    {/* Features - Compact */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                          <CheckCircle className="h-3 w-3" />
                          {feature}
                        </span>
                      ))}
                      {course.features.length > 3 && (
                        <span className="text-xs text-gray-400">+{course.features.length - 3} more</span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={() => handleEnrollClick(course)}
                      className={getButtonStyles()}
                      disabled={!isAuthorizedStudent()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {!isAuthorizedStudent() && <Lock className="h-4 w-4" />}
                        {getButtonText()}
                      </div>
                    </button>

                    {/* Helper text for non-student users */}
                    {!isAuthorizedStudent() && isLoggedIn && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Switch to student account to enroll
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-indigo-600" />
                </button>
                <span className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium shadow-md">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-indigo-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;