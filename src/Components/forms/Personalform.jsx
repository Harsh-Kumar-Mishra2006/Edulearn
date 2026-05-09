// components/forms/PersonalForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';

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
  const [error, setError] = useState('');

  // Fetch student profile on component mount
  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      console.log('=== FETCHING STUDENT PROFILE ===');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No token found, user might not be logged in');
        setFetchingProfile(false);
        return;
      }
      
      // Try to get user data from token payload first
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          
          if (payload.email) {
            // Fetch full profile from backend using the email
            const response = await axios.get(
              `https://edulearnbackend-ffiv.onrender.com/api/auth/student-details/${payload.email}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (response.data.success && response.data.data) {
              const userData = response.data.data;
              console.log('✅ Student data fetched:', userData);
              
              // Calculate age if DOB exists
              let ageValue = userData.age || '';
              if (!ageValue && userData.dob) {
                const today = new Date();
                const birthDate = new Date(userData.dob);
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  calculatedAge--;
                }
                ageValue = calculatedAge.toString();
              }
              
              // Format date for input
              let dobValue = userData.dob || '';
              if (dobValue && dobValue !== 'Invalid Date') {
                const date = new Date(dobValue);
                if (!isNaN(date.getTime())) {
                  dobValue = date.toISOString().split('T')[0];
                }
              }
              
              setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                age: ageValue,
                gender: userData.gender || '',
                dob: dobValue
              });
              
              setAutoFilled(true);
              console.log('📝 Form auto-filled with:', formData);
            }
          }
        }
      } catch (decodeError) {
        console.log('Token decode error:', decodeError);
      }
      
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number
    if (!formData.phone || formData.phone.trim() === '') {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to continue');
        setLoading(false);
        return;
      }

      console.log('📤 Submitting personal info:', formData);

      // ✅ FIXED: Use the correct API endpoint
      const response = await axios.post(
        'https://edulearnbackend-ffiv.onrender.com/api/personal/save-personal-info',
        {
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          email: formData.email,
          phone: String(formData.phone), // Ensure phone is string
          dob: formData.dob
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Server response:', response.data);
      
      if (response.data.success) {
        alert('Personal information saved successfully!');
        
        // Store email for next forms
        localStorage.setItem('studentEmail', formData.email);
        
        // Navigate to next form
        navigate('/background-form', { 
          state: { 
            course: course,
            email: formData.email,
            personalInfo: formData
          } 
        });
      } else {
        setError(response.data.message || 'Error saving information');
      }
      
    } catch (error) {
      console.error('❌ Error saving personal info:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        setError(error.response.data.error || error.response.data.message || 'Failed to save personal information');
      } else if (error.request) {
        // Request made but no response
        setError('Network error. Please check your connection.');
      } else {
        setError('Error: ' + error.message);
      }
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
    setError('');
    alert('Form cleared.');
  };

  // Manual retry function
  const retryAutoFill = () => {
    setFetchingProfile(true);
    fetchStudentProfile();
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Auto-fill Notification */}
        {autoFilled && !fetchingProfile && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-medium">Information auto-filled from your profile!</p>
                <p className="text-green-600 text-sm">Please review and complete any missing fields</p>
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
              <button
                type="button"
                onClick={retryAutoFill}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                Retry
              </button>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                  placeholder="your.email@example.com"
                  readOnly={autoFilled}
                />
                {autoFilled && (
                  <p className="text-xs text-gray-500 mt-1">Email is linked to your account and cannot be changed</p>
                )}
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
                    placeholder="9876543210"
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
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">ℹ️ Note:</span> {autoFilled 
                    ? 'Your profile information has been pre-filled from your account. Please verify all details are correct before proceeding.' 
                    : 'Please fill in all required fields accurately. This information will be used for your certificate.'}
                </p>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              type="submit"
              disabled={loading || fetchingProfile}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 
               fetchingProfile ? 'Loading...' : 
               'Continue to Background Information'}
            </button>
            
            {autoFilled && !fetchingProfile && (
              <button
                type="button"
                onClick={clearForm}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear Form & Enter Manually
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalForm;