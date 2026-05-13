import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Briefcase, Book } from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';

const BackgroundForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};
  
  const [formData, setFormData] = useState({
    education_level: '',
    current_status: '',
    profession: '',
    field_of_study: ''
  });
  const [loading, setLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ FIXED: Get email from MULTIPLE sources
    const getEmail = () => {
      // Priority 1: Check location state
      if (location.state?.email) {
        console.log('✅ Email from location state:', location.state.email);
        setStudentEmail(location.state.email);
        return;
      }
      
      // Priority 2: Check localStorage (where PersonalForm stores it)
      const localStorageEmail = localStorage.getItem('studentEmail');
      if (localStorageEmail) {
        console.log('✅ Email from localStorage:', localStorageEmail);
        setStudentEmail(localStorageEmail);
        return;
      }
      
      // Priority 3: Check sessionStorage as backup
      const sessionEmail = sessionStorage.getItem('tempStudentEmail');
      if (sessionEmail) {
        console.log('✅ Email from sessionStorage:', sessionEmail);
        setStudentEmail(sessionEmail);
        return;
      }
      
      // Priority 4: Try to get from token payload
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.email) {
              console.log('✅ Email from token payload:', payload.email);
              setStudentEmail(payload.email);
              return;
            }
          }
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
      
      // No email found
      console.error('❌ No email found in any source!');
      setError('Please complete personal information first.');
      setTimeout(() => {
        navigate('/personal-form', { state: { course } });
      }, 2000);
    };
    
    getEmail();
  }, [location.state, navigate, course]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check email is available
    let currentStudentEmail = studentEmail;
    
    // Try localStorage again if state is empty
    if (!currentStudentEmail) {
      currentStudentEmail = localStorage.getItem('studentEmail');
    }
    
    // Try sessionStorage
    if (!currentStudentEmail) {
      currentStudentEmail = sessionStorage.getItem('tempStudentEmail');
    }

    console.log('🟡 Submitting with email:', currentStudentEmail);
    console.log('🟡 Form data:', formData);

    if (!currentStudentEmail) {
      setError('No email found. Please complete personal information first.');
      setTimeout(() => {
        navigate('/personal-form', { state: { course } });
      }, 2000);
      return;
    }

    // Validate required fields
    if (!formData.education_level) {
      setError('Please select your education level');
      return;
    }
    
    if (!formData.current_status) {
      setError('Please select your current status');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map frontend field names to backend field names
      const requestData = {
        educationalqualification: formData.education_level,
        currentstatus: formData.current_status,
        profession: formData.profession || '',
        fieldofstudy: formData.field_of_study || '',
        email: currentStudentEmail
      };
      
      console.log('📤 Sending to backend:', requestData);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://edulearnbackend-ffiv.onrender.com/api/background/save', 
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Backend response:', response.data);
      
      if (response.data.success) {
        alert('Background information saved successfully!');
        
        // Store in localStorage for next form
        localStorage.setItem('backgroundInfo', JSON.stringify(requestData));
        
        navigate('/course-form', { 
          state: { 
            course: course,
            email: currentStudentEmail,
            backgroundInfo: formData
          } 
        });
      } else {
        setError(response.data.error || 'Failed to save information');
      }
    } catch (error) {
      console.error('❌ Error saving background info:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
        // If error says personal info not found, redirect back
        if (error.response.data.error.includes('personal information')) {
          setTimeout(() => {
            navigate('/personal-form', { state: { course } });
          }, 2000);
        }
      } else if (error.request) {
        setError('Network error: Could not connect to server.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const educationLevels = [
    'High School',
    'Some College',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Other'
  ];

  const currentStatusOptions = [
    'Student',
    'Working Professional',
    'Looking for Job',
    'Freelancer',
    'Entrepreneur',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient to-br from-green-50 to-teal-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <CourseSummary course={course} />
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/personal-form', { state: { course } })}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Background Information</h1>
            <div className="w-20"></div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
          </div>
          <p className="text-center text-gray-600">Step 2 of 3: Tell us about your background</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Email Display (for debugging - remove in production) */}
        {studentEmail && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            <strong>Student Email:</strong> {studentEmail}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            
            {/* Education Level */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 mr-2" />
                Highest Education Level *
              </label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Select Education Level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Current Status */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 mr-2" />
                Current Status *
              </label>
              <select
                name="current_status"
                value={formData.current_status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Select Current Status</option>
                {currentStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className='border-2 border-gray-200 rounded-lg p-4'>
              <div className="mb-2">
                <span className="text-sm text-blue-600 font-medium">*Optional Fields</span>
              </div>
              
              {/* Profession and Field of Study */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Book className="h-4 w-4 mr-2" />
                    Field of Study
                  </label>
                  <input
                    type="text"
                    name="field_of_study"
                    value={formData.field_of_study}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue to Course Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BackgroundForm;