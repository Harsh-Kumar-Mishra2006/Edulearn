// components/NewCourses.jsx
import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  RefreshCw,
  BookText,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeacherCourseService from '../services/teacherCourseService'; // Adjust path
import PersonalForm from '../Components/forms/Personalform';

const NewCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);

  const navigate = useNavigate();

  const fetchCourses = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log('🔄 Fetching courses...');

    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = userData.role || '';

    console.log('User role:', userRole);
    console.log('User data:', userData);

    // Choose endpoint based on user role
    let endpoint = '';
    let headers = {};

    if (userRole === 'teacher') {
      // Teacher fetches their own courses
      endpoint = 'http://localhost:3000/api/teacher/courses';
      if (token) {
        headers = {
          'Authorization': `Bearer ${token}`
        };
      }
    } else if (userRole === 'student') {
      // Student fetches published courses - FIXED ENDPOINT
      endpoint = 'http://localhost:3000/api/student/courses';
      if (token) {
        headers = {
          'Authorization': `Bearer ${token}`
        };
      }
    } else {
      // Public access (no auth needed) - also use student endpoint
      endpoint = 'http://localhost:3000/api/student/courses';
      headers = {}; // No auth header
    }

    console.log(`Fetching from: ${endpoint} as ${userRole}`);
    console.log('Headers:', headers);

    const response = await fetch(endpoint, {
      headers: headers
    });

    console.log('Fetch status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Try to get error details
      const errorText = await response.text();
      console.error('Error response text:', errorText.substring(0, 200));
      
      // If it's HTML (404 page), give a more helpful error
      if (errorText.includes('<!DOCTYPE')) {
        throw new Error(`Route not found (404). Please check if the backend endpoint ${endpoint} exists.`);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Fetch result:', result);

    if (result.success) {
      const coursesData = result.data || [];

      // Log the first course to see its structure
      if (coursesData.length > 0) {
        console.log('First course data:', coursesData[0]);
        console.log('First course enrolledStudents:', coursesData[0].enrolledStudents);
      }

      // Transform the data to ensure it has all required fields
      const transformedCourses = coursesData.map(course => ({
        id: course._id || course.id || Date.now(),
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        category: course.category || 'General',
        image: course.image || '/default-course.jpg',
        price: course.price || 0,
        level: course.level || 'Beginner',
        createdBy: course.createdBy?.name || course.createdBy || course.instructor || 'Unknown',
        createdByRole: course.createdByRole || (userRole === 'teacher' ? 'teacher' : 'admin'),
        createdAt: course.createdAt || new Date().toISOString(),
        duration: course.duration || '10 hours',
        // Ensure enrolledStudents is a number
        enrolledStudents: Number(course.enrolledStudents) || Number(course.studentsEnrolled) || 0,
        rating: Number(course.rating) || 0,
        popular: Boolean(course.popular),
        isFeatured: Boolean(course.isFeatured),
        status: course.status || 'published',
        features: course.features || []
      }));

      setCourses(transformedCourses);
      setFilteredCourses(transformedCourses);

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(transformedCourses.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } else {
      setError(result.error || 'Failed to fetch courses');
      setCourses([]);
      setFilteredCourses([]);
    }

  } catch (err) {
    console.error('❌ Error fetching courses:', err);
    setError(err.message || 'Failed to load courses. Please try again later.');
    setCourses([]);
    setFilteredCourses([]);
  } finally {
    setLoading(false);
  }
};

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
    fetchCourses();

    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  // Filter and sort courses
  useEffect(() => {
    let result = [...courses];

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(course => course.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term)
      );
    }

    // In your useEffect for filtering and sorting, update the sorting section:
    result.sort((a, b) => {
      // Ensure we have default values for sorting
      const aEnrolled = a.enrolledStudents || 0;
      const bEnrolled = b.enrolledStudents || 0;
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);

      switch (sortBy) {
        case 'popular':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return bEnrolled - aEnrolled;

        case 'rating':
          return bRating - aRating;

        case 'price-low':
          return aPrice - bPrice;

        case 'price-high':
          return bPrice - aPrice;

        case 'newest':
          return bDate - aDate;

        case 'featured':
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;

        case 'teacher':
          if (a.createdByRole === 'teacher' && b.createdByRole !== 'teacher') return -1;
          if (a.createdByRole !== 'teacher' && b.createdByRole === 'teacher') return 1;
          return 0;

        default:
          return 0;
      }
    });

    setFilteredCourses(result);
  }, [selectedCategory, searchTerm, sortBy, courses]);

  const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');

    if (token && loggedIn && userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Auth check - parsed user:', parsedUser);
      
      // Make sure role is set
      if (!parsedUser.role) {
        // Try to get role from another source
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        parsedUser.role = decodedToken.role || 'student';
        localStorage.setItem('userData', JSON.stringify(parsedUser));
      }
      
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
  }
};

  const isAuthorizedStudent = () => {
    return isLoggedIn && user?.role === 'student';
  };

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
        coursePrice: course.price,
        courseId: course.id,
        courseType: 'created'
      }
    });
  };

  const getButtonText = () => {
    if (!isLoggedIn) return 'Login to Enroll';
    if (user?.role !== 'student') return 'Students Only';
    return 'Enroll Now';
  };

  const getButtonStyles = () => {
    const baseStyles = "w-full py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg ";

    if (isAuthorizedStudent()) {
      return baseStyles + "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-105 shadow-cyan-500/25";
    } else {
      return baseStyles + "bg-gray-400 text-gray-700 cursor-not-allowed shadow-gray-400/25";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRetry = () => {
    fetchCourses();
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

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === 'published').length;
  const teacherCourses = courses.filter(c => c.createdByRole === 'teacher').length;
  const popularCourses = courses.filter(c => c.popular).length;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">Course Catalog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore courses created by administrators and teachers. Learn from the best resources available.
          </p>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-sm text-blue-700">
                <strong>{totalCourses}</strong> Total Courses
              </span>
            </div>
            <div className="px-4 py-2 bg-green-50 rounded-full">
              <span className="text-sm text-green-700">
                <strong>{publishedCourses}</strong> Published
              </span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-full">
              <span className="text-sm text-emerald-700">
                <strong>{teacherCourses}</strong> Teacher Created
              </span>
            </div>
            <div className="px-4 py-2 bg-purple-50 rounded-full">
              <span className="text-sm text-purple-700">
                <strong>{popularCourses}</strong> Popular
              </span>
            </div>
          </div>

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
                <option value="newest">Newest First</option>
                <option value="featured">Featured</option>
                <option value="teacher">Teacher Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isAuthorizedStudent={isAuthorizedStudent}
              getButtonText={getButtonText}
              getButtonStyles={getButtonStyles}
              handleEnrollClick={handleEnrollClick}
              formatDate={formatDate}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'No courses available yet. Check back soon!'}
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSortBy('popular');
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Courses
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredCourses.length} of {totalCourses} courses • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Separate Course Card Component for better organization
const CourseCard = ({
  course,
  isAuthorizedStudent,
  getButtonText,
  getButtonStyles,
  handleEnrollClick,
  formatDate,
  isLoggedIn
}) => {
  // Add safe defaults
  const enrolledStudents = course.enrolledStudents || 0;
  const rating = course.rating || 0;
  const duration = course.duration || 'N/A';
  const courseFeatures = course.features || [];
  const courseCategory = course.category || 'General';
  const courseStatus = course.status || 'published';

  return (
    <div className="bg-neutral-200 rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group relative">

      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-course.jpg';
          }}
        />

        {/* Course Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {course.createdByRole === 'teacher' && (
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
              <Sparkles className="h-4 w-4 mr-1" />
              Teacher Created
            </div>
          )}
          {course.popular && (
            <div className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
              <TrendingUp className="h-4 w-4 mr-1" />
              Popular
            </div>
          )}
          {course.isFeatured && (
            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center w-fit">
              <BookText className="h-4 w-4 mr-1" />
              Featured
            </div>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-semibold text-gray-900">
          {course.price === 0 ? 'FREE' : `₹${course.price}`}
        </div>

        {/* Level Badge */}
        {course.level && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
            {course.level}
          </div>
        )}

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
          {courseCategory}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-1">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <span className="text-sm text-gray-600">by {course.createdBy}</span>
              {course.createdByRole === 'teacher' && (
                <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                  Teacher
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(course.createdAt)}
          </span>
        </div>

        {/* Course Info */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {duration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {enrolledStudents.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Features */}
        {courseFeatures.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2">
              {courseFeatures.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
            {courseFeatures.length > 4 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                +{courseFeatures.length - 4} more features
              </p>
            )}
          </div>
        )}

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

        {/* Course Status and Helper Text */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded ${courseStatus === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
            }`}>
            {courseStatus}
          </span>

          {!isAuthorizedStudent() && isLoggedIn && (
            <p className="text-xs text-gray-500">
              Switch to student account to enroll
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCourses;