// components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import Login from '../Components/auth/login';
import { 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  Settings,
  GraduationCap,
  Users,
  Shield,
  BarChart3
} from 'lucide-react';
import Signup from '../Components/auth/signup';
import { useNavigate } from 'react-router-dom'; // Add this import

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate(); // Initialize navigate hook

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', current: true },
      { name: 'Courses', href: '/courses', current: false },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        { name: 'My Learning', href: '/my-learning', current: false },
        { name: 'Test', href: '/test', current: false },
        { name: 'Record', href: '/student-record', current: false },
        { name: 'Assignments', href: '/assignments', current: false },
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...baseItems,
        /*{ name: 'My Courses', href: '/my-courses', current: false },*/
        { name: 'Create Course', href: '/create-course', current: false },
        { name: 'Quiz', href: '/quiz-creator', current: false },
        { name: 'Analytics', href: '/analytics', current: false },
      ];
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'User Management', href: '/users', current: false },
        { name: 'Analytics', href: '/analytics', current: false },
        { name: 'Student Records', href: '/student-records', current: false },
        { name: 'Settings', href: '/admin-settings', current: false },
      ];
    }

    return baseItems;
  };

  // Role-based features in profile dropdown
  const getProfileMenuItems = () => {
    const baseItems = [
      {
        href: '/profile',
        icon: User,
        label: 'Your Profile',
        show: true
      },
      {
        href: '/settings',
        icon: Settings,
        label: 'Settings',
        show: true
      }
    ];

    const roleSpecificItems = [
      {
        href: '/my-courses',
        icon: GraduationCap,
        label: 'My Courses',
        show: user?.role === 'student'
      },
      {
        href: '/teaching',
        icon: Users,
        label: 'Teaching Dashboard',
        show: user?.role === 'teacher'
      },
      {
        href: '/admin',
        icon: Shield,
        label: 'Admin Panel',
        show: user?.role === 'admin'
      },
      {
        href: '/analytics',
        icon: BarChart3,
        label: 'Analytics',
        show: user?.role === 'teacher' || user?.role === 'admin'
      }
    ];

    return [...baseItems, ...roleSpecificItems].filter(item => item.show);
  };

  // Role badge colors
  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Role display names
  const getRoleDisplayName = (role) => {
    const names = {
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Administrator'
    };
    return names[role] || 'User';
  };

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

   // Enhanced checkAuthStatus with redirect logic
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('userData');
      const currentPath = window.location.pathname;
      
      // Define public routes that don't require authentication
      const publicRoutes = ['/', '/dashboard', '/courses', '/login', '/signup'];
      
      // Define role-based routes
      const studentRoutes = ['/my-learning', '/test', '/student-record'];
      const teacherRoutes = ['/my-courses', '/create-course', '/quiz-creator', '/analytics'];
      const adminRoutes = ['/users', '/analytics', '/student-records', '/admin-settings'];
      
      if (token && loggedIn && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
        
        // Check if user is trying to access routes not allowed for their role
        if (parsedUser.role === 'student' && teacherRoutes.concat(adminRoutes).includes(currentPath)) {
          navigate('/dashboard');
        } else if (parsedUser.role === 'teacher' && adminRoutes.includes(currentPath)) {
          navigate('/dashboard');
        }
      } else {
        // User is not logged in, check if they're trying to access protected routes
        const allProtectedRoutes = studentRoutes.concat(teacherRoutes).concat(adminRoutes);
        if (allProtectedRoutes.includes(currentPath)) {
          navigate('/dashboard');
        }
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuthData();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleLoginOpen = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const handleSignupOpen = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const handleCloseModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('userData', JSON.stringify(userData));
    window.dispatchEvent(new Event('authChange'));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        clearAuthData();
        setIsProfileOpen(false);
         // Redirect to dashboard after logout
        navigate('/dashboard');
        
        window.dispatchEvent(new Event('authChange'));
      }
    } catch (err) {
      console.error('Logout error:', err);
      clearAuthData();
      setIsProfileOpen(false);
       // Redirect to dashboard after logout
      navigate('/dashboard');
        
      window.dispatchEvent(new Event('authChange'));
    }
  };

   const handleMobileLinkClick = (href) => {
    // Check if user is logged in and has access to this route
    if (!isLoggedIn) {
      const studentRoutes = ['/my-learning', '/test', '/student-record'];
      const teacherRoutes = ['/my-courses', '/create-course', '/quiz-creator', '/analytics'];
      const adminRoutes = ['/users', '/analytics', '/student-records', '/admin-settings'];
      
      const allProtectedRoutes = studentRoutes.concat(teacherRoutes).concat(adminRoutes);
      
      if (allProtectedRoutes.includes(href)) {
        alert('Please login to access this page');
        setIsMenuOpen(false);
        setIsLoginOpen(true);
        return false;
      }
    }
    setIsMenuOpen(false);
    return true;
  };

    useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-indigo-700 to-blue-700 shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-neutral-200">EduLearn</span>
            </div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  const navigationItems = getNavigationItems();
  const profileMenuItems = getProfileMenuItems();

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-700 to-blue-700 shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-neutral-200">EduLearn</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      item.current
                        ? 'text-white border-b-2 border-indigo-600'
                        : 'text-gray-200 hover:text-white hover:border-gray-300'
                    } transition-colors duration-200`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              {isLoggedIn && (
                <button className="relative p-2 text-gray-200 hover:text-white transition-colors rounded-lg hover:bg-indigo-600">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-200 hover:text-white hover:bg-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Profile Dropdown or Auth Buttons */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {user?.username || user?.name || 'User'}
                      </p>
                      <p className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                        {getRoleDisplayName(user?.role)}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-200" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.username || user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                          {getRoleDisplayName(user?.role)}
                        </span>
                      </div>
                      
                      {/* Menu Items */}
                      {profileMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <IconComponent className="h-4 w-4 mr-3" />
                            {item.label}
                          </a>
                        );
                      })}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLoginOpen}
                    className="text-gray-200 hover:text-white font-medium transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={handleSignupOpen}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-indigo-600 py-4">
              <div className="px-2 space-y-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                     onClick={(e) => {
              if (!handleMobileLinkClick(item.href)) {
                e.preventDefault();
              }
            }}
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      item.current
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-200 hover:bg-indigo-600 hover:text-white'
                    } transition-colors`}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                {!isLoggedIn && (
                  <div className="px-3 py-2 flex flex-col space-y-2">
                    <button
                      onClick={handleLoginOpen}
                      className="w-full text-center text-gray-200 hover:text-white font-medium transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={handleSignupOpen}
                      className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modals */}
      <Login 
        isOpen={isLoginOpen}
        onClose={handleCloseModals}
        onSwitchToSignup={handleSwitchToSignup}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <Signup 
        isOpen={isSignupOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default Navbar;