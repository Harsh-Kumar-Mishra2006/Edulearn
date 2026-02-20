// components/CoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { courses, categories } from '../services/Coursefile';
import { 
  Star, 
  Users, 
  Clock, 
  Filter, 
  Search,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Handle enroll button click
  // In Courses.jsx, update the handleEnrollClick function:
const handleEnrollClick = (course) => {
  if (!isLoggedIn) {
    navigate('/login');
    return;
  }
  
  if (!isAuthorizedStudent()) {
    alert(`Enrollment is only available for students. Your current role is ${user?.role}.`);
    return;
  }
  
  // Pass the entire course object
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
    const baseStyles = "w-full py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg ";
    
    if (isAuthorizedStudent()) {
      return baseStyles + "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-105 shadow-cyan-500/25";
    } else {
      return baseStyles + "bg-gray-400 text-gray-700 cursor-not-allowed shadow-gray-400/25";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-sky-200 to-fuchsia-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our <span className="text-blue bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Courses</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover courses designed to help you achieve your career goals. Learn from industry experts and join thousands of successful students.
          </p>
          
          {/* User Status Indicator */}
          {isLoggedIn && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <span className="text-sm text-blue-700">
                Logged in as: <strong>{user?.name}</strong> ({user?.role})
              </span>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="hover:shadow-2xl hover:shadow-neutral-500 bg-gradient-to-r from-neutral-200/50 to-gray-200/50 rounded-2xl shadow-xl border border-black p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCourses.map(course => (
            <div
              key={course.id}
              className="bg-neutral-200 rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group relative"
            >
              
              {/* Course Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {course.popular && (
                  <div className="absolute top-4 left-4 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Popular
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-semibold text-gray-900">
                  Rs{course.price}
                </div>
                
                {/* Overlay for non-student users */}
                {!isAuthorizedStudent() && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white text-center p-4">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-semibold">Enrollment Available for Students Only</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Category Badge */}
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {course.category}
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center mb-4">
                  <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">by {course.instructor}</span>
                </div>

                {/* Course Info */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {course.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => handleEnrollClick(course)}
                  className={getButtonStyles()}
                  disabled={!isAuthorizedStudent()}
                >
                  <div className="flex items-center justify-center">
                    {!isAuthorizedStudent() && <Lock className="h-4 w-4 mr-2" />}
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
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;