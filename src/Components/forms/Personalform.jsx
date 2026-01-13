// components/forms/PersonalForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';
import Cookies from 'js-cookie';

const PersonalForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    dob: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [autoFilled, setAutoFilled] = useState(false);

  // Fetch student profile on component mount
  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
  try {
    console.log('=== AUTO-FILL DEBUGGING ===');
    
    // 1. Look for userData FIRST (this has the current student)
    const userDataString = localStorage.getItem('userData');
    
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        console.log('✅ Found current user in "userData":', user);
        
        if (user.role === 'student') {
          console.log('✅ User is a student - auto-filling form');
          
          // Calculate age if DOB exists
          let ageValue = user.profile?.age || '';
          if (!ageValue && user.profile?.dob) {
            const today = new Date();
            const birthDate = new Date(user.profile.dob);
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
            ageValue = calculatedAge.toString();
          }
          
          // Format date for input
          let dobValue = user.profile?.dob || '';
          if (dobValue) {
            const date = new Date(dobValue);
            if (!isNaN(date.getTime())) {
              dobValue = date.toISOString().split('T')[0];
            }
          }
          
          // Create new form data
          const newFormData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            age: ageValue,
            gender: user.profile?.gender || '',
            dob: dobValue
          };
          
          console.log('📝 Form data to set:', newFormData);
          
          // Update form
          setFormData(newFormData);
          setAutoFilled(true);
          
          // Show success message
          setTimeout(() => {
            const filledFields = Object.values(newFormData).filter(v => v && v.toString().trim() !== '').length;
            if (filledFields >= 3) {
              alert(`✅ ${filledFields} fields auto-filled from your profile!`);
            }
          }, 500);
          
          setFetchingProfile(false);
          return;
        } else {
          console.log('⚠️ User in "userData" is not a student, role:', user.role);
        }
      } catch (parseError) {
        console.log('❌ Error parsing userData:', parseError);
      }
    }
    
    // 2. If no userData, check token for user info
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Token found, checking payload...');
      
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          
          if (payload.role === 'student') {
            console.log('✅ Token belongs to a student, using token data');
            
            setFormData(prev => ({
              ...prev,
              name: payload.name || '',
              email: payload.email || ''
            }));
            
            setAutoFilled(true);
          }
        }
      } catch (e) {
        console.log('Cannot decode token:', e);
      }
    }
    
    // 3. Clean up old "user" key if it exists (optional)
    const oldUser = localStorage.getItem('user');
    if (oldUser) {
      try {
        const oldUserData = JSON.parse(oldUser);
        if (oldUserData.role !== 'student') {
          console.log('🧹 Found old non-student user data, removing...');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
  } catch (error) {
    console.log('❌ Error in fetchStudentProfile:', error);
  } finally {
    setFetchingProfile(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'https://edulearnbackend-ffiv.onrender.com/api/personal/save', 
        formData
      );
      
      if (response.data.success) {
        // Save email to cookie for future forms
        document.cookie = `student_email=${formData.email}; path=/; max-age=86400`;
        
        alert('Personal information saved successfully!');
        navigate('/background-form', { 
          state: { 
            course: course,
            email: formData.email 
          } 
        });
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      alert('Error saving personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      email: '',
      phone: '',
      dob: ''
    });
    setAutoFilled(false);
    alert('Form cleared.');
  };

  // Enhanced debug function
  const debugLocalStorage = () => {
    console.log('=== COMPLETE LOCALSTORAGE DUMP ===');
    console.log('Total items:', localStorage.length);
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      console.log(`\n=== ${key} ===`);
      
      // Try to parse if it looks like JSON
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        try {
          const parsed = JSON.parse(value);
          console.log('Parsed:', parsed);
        } catch (e) {
          console.log('Not JSON, raw value (first 200 chars):', value.substring(0, 200));
        }
      } else {
        console.log('Value (first 200 chars):', value?.substring(0, 200));
      }
    }
    
    // Check cookies too
    console.log('\n=== COOKIES ===');
    console.log('All cookies:', document.cookie);
    
    // Check if user is logged in by any indicator
    console.log('\n=== LOGIN STATUS CHECK ===');
    const hasToken = localStorage.getItem('token') || Cookies.get('token');
    console.log('Has token:', !!hasToken);
    
    if (hasToken) {
      console.log('Token exists, trying to decode...');
      const token = localStorage.getItem('token') || Cookies.get('token');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token user info:', {
            name: payload.name,
            email: payload.email,
            role: payload.role,
            userId: payload.userId
          });
        }
      } catch (e) {
        console.log('Token decode error:', e.message);
      }
    }
  };

  // Quick check for common localStorage patterns
  const quickCheck = () => {
    console.log('=== QUICK CHECK ===');
    
    // Check common patterns
    const checks = [
      'token',
      'user',
      'auth',
      'login',
      'currentUser',
      'userInfo',
      'profile',
      'auth_token',
      'access_token'
    ];
    
    checks.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`Found "${key}":`, value.substring(0, 100));
        
        // Try to parse if JSON
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            const parsed = JSON.parse(value);
            console.log(`Parsed "${key}":`, parsed);
            
            // If this looks like user data, use it
            if (parsed.name || parsed.email) {
              console.log(`✅ "${key}" contains user data!`);
              if (parsed.role === 'student') {
                alert(`Found student data in "${key}"! Auto-filling...`);
                setFormData(prev => ({
                  ...prev,
                  name: parsed.name || '',
                  email: parsed.email || '',
                  phone: parsed.phone || ''
                }));
                setAutoFilled(true);
              }
            }
          } catch (e) {
            // Not JSON
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <CourseSummary course={course} />
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
            <div className="w-20"></div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div className="w-16 h-1 bg-blue-600"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
          </div>
          <p className="text-center text-gray-600">Step 1 of 3: Tell us about yourself</p>
        </div>

        {/* Debug Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Debug Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={debugLocalStorage}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Full LocalStorage Dump
            </button>
            <button
              onClick={quickCheck}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
            >
              Quick Check
            </button>
            <button
              onClick={fetchStudentProfile}
              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
            >
              Retry Auto-fill
            </button>
            <button
              onClick={clearForm}
              className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Auto-fill Notification */}
        {autoFilled && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 font-medium">Information auto-filled from your profile</p>
                <p className="text-blue-600 text-sm">Please review and complete any missing fields</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {fetchingProfile ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your profile information...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="16"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone and DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> {autoFilled 
                    ? 'Your profile information has been pre-filled. Please verify all details are correct before proceeding.' 
                    : 'Please fill in all required fields. If you are a registered student, your information may auto-fill.'}
                </p>
              </div>

            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading || fetchingProfile}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 
               fetchingProfile ? 'Loading...' : 
               'Continue to Background Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalForm;