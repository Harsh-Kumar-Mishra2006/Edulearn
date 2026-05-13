import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Code, Target, Clock, Zap, Book, Languages } from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';

const CourseForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};
  
  const [formData, setFormData] = useState({
    currentskills: '',
    fieldofstudy: '',
    language: '',
    goals: '',
    background: '',
    timecommitment: ''
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
      setError('Please complete previous steps first.');
      setTimeout(() => {
        navigate('/personal-form', { state: { course } });
      }, 2000);
    };
    
    getEmail();
    
    // Optional: Load previously saved course data if exists
    const savedCourseData = localStorage.getItem('courseInfo');
    if (savedCourseData) {
      try {
        const parsedData = JSON.parse(savedCourseData);
        console.log('📦 Loading saved course data:', parsedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }));
      } catch (err) {
        console.error('Error parsing saved course data:', err);
      }
    }
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
    
    console.log('🟡 Submitting course data with email:', currentStudentEmail);
    console.log('🟡 Form data:', formData);

    if (!currentStudentEmail) {
      setError('Please complete previous steps first.');
      setTimeout(() => {
        navigate('/personal-form', { state: { course } });
      }, 2000);
      return;
    }

    // Validate required fields
    if (!formData.currentskills) {
      setError('Please select your current skills');
      return;
    }
    
    if (!formData.fieldofstudy) {
      setError('Please select your field of study');
      return;
    }
    
    if (!formData.language) {
      setError('Please select your preferred language');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data to send
      const dataToSend = {
        email: currentStudentEmail,
        currentskills: formData.currentskills,
        fieldofstudy: formData.fieldofstudy,
        language: formData.language,
        goals: formData.goals || '',  // Optional fields
        background: formData.background || '',
        timecommitment: formData.timecommitment || ''
      };
      
      console.log('📤 Sending course data to backend:', dataToSend);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://edulearnbackend-ffiv.onrender.com/api/course/save', 
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Backend response:', response.data);
      
      if (response.data.success) {
        alert('Course details saved successfully!');
        
        // Save to localStorage for backup
        localStorage.setItem('courseInfo', JSON.stringify(dataToSend));
        localStorage.setItem('courseCompleted', 'true');
        
        navigate('/payment', { 
          state: { 
            course: course,
            email: currentStudentEmail,
            courseData: formData
          } 
        });
      } else {
        setError(response.data.error || 'Failed to save course details');
      }
    } catch (error) {
      console.error('❌ Error saving course details:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
        // If error says previous info missing, redirect back
        if (error.response.data.error.includes('personal') || 
            error.response.data.error.includes('background')) {
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

  // Options for dropdowns
  const currentSkillsOptions = [
    'Programming',
    'Design',
    'Marketing',
    'Writing',
    'Data Analysis',
    'No Technical Skills',
    'Basic Computer Skills'
  ];

  const fieldOfStudyOptions = [
    'Computer Science',
    'Engineering',
    'Business',
    'Arts & Humanities',
    'Science',
    'Mathematics',
    'Social Sciences',
    'Other'
  ];

  const languageOptions = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Other'
  ];

  const goalsOptions = [
    'Career Change',
    'Skill Development',
    'Personal Interest',
    'Academic Advancement',
    'Professional Certification',
    'Entrepreneurship'
  ];

  const backgroundOptions = [
    'Student',
    'Working Professional',
    'Freelancer',
    'Unemployed',
    'Entrepreneur',
    'Homemaker'
  ];

  const timeCommitmentOptions = [
    '1-5 hours per week',
    '5-10 hours per week',
    '10-15 hours per week',
    '15-20 hours per week',
    '20+ hours per week'
  ];

  return (
    <div className="min-h-screen bg-gradient to-br from-neutral-100 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <CourseSummary course={course} />
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/background-form', { state: { course } })}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Course Preferences</h1>
            <div className="w-20"></div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-16 h-1 bg-purple-600"></div>
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-16 h-1 bg-purple-600"></div>
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
          </div>
          <p className="text-center text-gray-600">Step 3 of 3: Tell us about your learning preferences</p>
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
            
            {/* Current Skills */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Zap className="h-4 w-4 mr-2" />
                Current Skills & Experience *
              </label>
              <select
                name="currentskills"
                value={formData.currentskills}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Select your current skills</option>
                {currentSkillsOptions.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Field of Study */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Book className="h-4 w-4 mr-2" />
                Field of Study *
              </label>
              <select
                name="fieldofstudy"
                value={formData.fieldofstudy}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Select your field of study</option>
                {fieldOfStudyOptions.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Language Preference */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Languages className="h-4 w-4 mr-2" />
                Preferred Language *
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Select preferred language</option>
                {languageOptions.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className='border-2 border-gray-200 rounded-lg p-4'>
              <div className="mb-2">
                <span className="text-sm text-blue-600 font-medium">*Optional Fields</span>
              </div>
              
              {/* Learning Goals */}
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Target className="h-4 w-4 mr-2" />
                  Learning Goals
                </label>
                <select
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select your learning goals</option>
                  {goalsOptions.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>

              {/* Background */}
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Code className="h-4 w-4 mr-2" />
                  Current Background
                </label>
                <select
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select your current background</option>
                  {backgroundOptions.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Time Commitment */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Commitment
                </label>
                <select
                  name="timecommitment"
                  value={formData.timecommitment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select your available time</option>
                  {timeCommitmentOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;