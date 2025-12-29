// components/forms/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { ArrowLeft, Code, Target, Clock, Zap, Book, Languages } from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';

const CourseForm = () => {
  const navigate = useNavigate();
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

  const location = useLocation();
const { course } = location.state || {};


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
  
  if (!studentEmail) {
    alert('Please complete previous steps first.');
    navigate('/personal-form');
    return;
  }

  setLoading(true);

  try {
    // ✅ Ensure optional fields are sent as empty strings
    const dataToSend = {
      email: studentEmail,
      currentskills: formData.currentskills,
      fieldofstudy: formData.fieldofstudy,
      language: formData.language,
      goals: formData.goals || '',  // Send empty string if not selected
      background: formData.background || '',
      timecommitment: formData.timecommitment || ''
    };
    
    console.log('🟡 Frontend - Sending course data:', dataToSend);
    
    const response = await axios.post('https://edulearnbackend-ffiv.onrender.com/api/course/save', dataToSend);
    
    console.log('🟢 Frontend - Course save response:', response.data);
    
    if (response.data.success) {
      alert('Course details saved successfully!');
      navigate('/payment', { 
        state: { 
          course: course,
          email: studentEmail 
        } 
      });
    }
  } catch (error) {
    console.error('🔴 Frontend - Error saving course details:', error);
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
              onClick={() => navigate('/background-form')}
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
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div className="w-16 h-1 bg-purple-600"></div>
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-16 h-1 bg-purple-600"></div>
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
          </div>
          <p className="text-center text-gray-600">Step 3 of 3: Tell us about your learning preferences</p>
        </div>

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

            <div className='border-2 border-black p-2'>
              <span className="font-bold text-blue-500  ">*Optional</span>
            {/* Learning Goals */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4 mr-2" />
                Learning Goals *
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
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Code className="h-4 w-4 mr-2" />
                Current Background *
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
                Time Commitment *
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