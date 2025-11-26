// components/forms/BackgroundForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Briefcase, Book } from 'lucide-react';
import axios from 'axios';

const BackgroundForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    education_level: '',
    current_status: '',
    profession: '',
    field_of_study: ''
  });
  const [loading, setLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');

  useEffect(() => {
    // Get email from cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'student_email') {
        setStudentEmail(value);
        break;
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get email from cookie (double check)
    const cookies = document.cookie.split(';');
    let currentStudentEmail = '';
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'student_email') {
        currentStudentEmail = value;
        break;
      }
    }

    console.log('🟡 Frontend - Student email from cookie:', currentStudentEmail);
    console.log('🟡 Frontend - Form data:', formData);

    if (!currentStudentEmail) {
      alert('Please complete personal information first.');
      navigate('/personal-form');
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Map frontend field names to backend field names
      const requestData = {
        educationalqualification: formData.education_level, // ✅ Map to backend field
        currentstatus: formData.current_status,             // ✅ Map to backend field
        profession: formData.profession,
        fieldofstudy: formData.field_of_study,              // ✅ Map to backend field
        email: currentStudentEmail
      };
      
      console.log('🟡 Frontend - Mapped data for backend:', requestData);
      
      const response = await axios.post('https://edulearnbackend-ffiv.onrender.com/api/background/save', requestData);
      
      console.log('🟢 Frontend - Success response:', response.data);
      
      if (response.data.success) {
        alert('Background information saved successfully!');
        navigate('/course-form');
      }
    } catch (error) {
      console.error('🔴 Frontend - Error details:', error);
      console.error('🔴 Frontend - Error response:', error.response?.data);
      
      if (error.response?.data?.error) {
        alert('Error: ' + error.response.data.error);
      } else if (error.request) {
        alert('Network error: Could not connect to server.');
      } else {
        alert('Error: ' + error.message);
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
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/personal-form')}
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
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
          </div>
          <p className="text-center text-gray-600">Step 2 of 3: Tell us about your background</p>
        </div>

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

            {/* Profession and Field of Study */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession *
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Book className="h-4 w-4 mr-2" />
                  Field of Study *
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="e.g., Computer Science"
                />
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