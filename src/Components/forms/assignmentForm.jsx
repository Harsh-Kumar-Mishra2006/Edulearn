// components/forms/AddAssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Users,
  AlertCircle,
  Target,
  CheckCircle,
  FileText
} from 'lucide-react';

const AddAssignmentForm = ({ courses, onSubmit, loading, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assignmentData, setAssignmentData] = useState({
    course_id: courses.length > 0 ? courses[0]._id : '',
    assignment_title: '',
    assignment_description: '',
    assignment_topic: '',
    assignment_date: new Date().toISOString().split('T')[0], // Today's date
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    due_time: '23:59',
    questions: [],
    total_points: 0, // ADD THIS
    settings: {
      max_attempts: 1,
      allow_late_submission: false,
      late_submission_penalty: 0,
      show_answers_after_due: false,
      is_active: true
    }
  });

  // Calculate max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const steps = [
    { title: 'Basic Info', description: 'Assignment details' },
    { title: 'Add Questions', description: 'Create MCQ questions' },
    { title: 'Settings', description: 'Configure assignment' },
    { title: 'Review', description: 'Review and create' }
  ];

  // Handle basic info changes
  const handleBasicInfoChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle settings changes
  const handleSettingsChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  // Add new question
  // Add new question
const addQuestion = () => {
  if (assignmentData.questions.length >= 20) {
    alert('Maximum 20 questions allowed for daily assignments');
    return;
  }

  const newQuestion = {
    question_number: assignmentData.questions.length + 1,
    question_text: '',
    options: {
      A: '',
      B: '',
      C: '',
      D: ''
    },
    correct_option: 'A',
    explanation: '',
    points: 1, // Ensure this is a number
    question_type: 'mcq'
  };
  
  setAssignmentData(prev => ({
    ...prev,
    questions: [...prev.questions, newQuestion],
    total_points: prev.total_points + 1 // Update total points
  }));
};

  // Update question
  // Update question
const updateQuestion = (index, field, value) => {
  const updatedQuestions = [...assignmentData.questions];
  
  if (field.startsWith('options.')) {
    const optionKey = field.split('.')[1];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      options: {
        ...updatedQuestions[index].options,
        [optionKey]: value
      }
    };
  } else if (field === 'points') {
    // Handle points update and recalculate total
    const oldPoints = updatedQuestions[index].points || 0;
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      points: parseInt(value) || 1
    };
    const newPoints = updatedQuestions[index].points;
    
    setAssignmentData(prev => ({
      ...prev,
      questions: updatedQuestions,
      total_points: prev.total_points - oldPoints + newPoints
    }));
    return;
  } else {
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
  }
  
  setAssignmentData(prev => ({
    ...prev,
    questions: updatedQuestions
  }));
};

  // Delete question
 // Delete question
const deleteQuestion = (index) => {
  const deletedPoints = assignmentData.questions[index].points || 0;
  
  const updatedQuestions = assignmentData.questions
    .filter((_, i) => i !== index)
    .map((question, idx) => ({
      ...question,
      question_number: idx + 1
    }));
  
  setAssignmentData(prev => ({
    ...prev,
    questions: updatedQuestions,
    total_points: prev.total_points - deletedPoints
  }));
};

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        return assignmentData.course_id && 
               assignmentData.assignment_title.trim() && 
               assignmentData.assignment_topic.trim() &&
               assignmentData.assignment_date &&
               assignmentData.due_date;
      case 1: // Questions
  return assignmentData.questions.length > 0 && 
         assignmentData.questions.length <= 20 &&
         assignmentData.questions.every(q => {
           // Check question text
           if (!q.question_text.trim()) return false;
           
           // Check all options exist and are not empty
           const options = q.options || {};
           if (!options.A || !options.B || !options.C || !options.D) return false;
           if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) return false;
           
           // Check correct option is valid
           if (!['A', 'B', 'C', 'D'].includes(q.correct_option)) return false;
           
           // Check points is a number
           if (isNaN(q.points) || q.points < 1) return false;
           
           return true;
         });
      case 2: // Questions
        return assignmentData.questions.length > 0 && 
               assignmentData.questions.length <= 20 &&
               assignmentData.questions.every(q => 
                 q.question_text.trim() && 
                 q.options.A.trim() && 
                 q.options.B.trim() && 
                 q.options.C.trim() && 
                 q.options.D.trim()
               );
      case 3: // Settings
        return assignmentData.settings.max_attempts >= 1;
      default:
        return true;
    }
  };

  // Handle form submission
  // Handle form submission
// In parent component where you handle form submission:
const handleSubmitAssignment = async (assignmentData) => {
  try {
    console.log('📤 Sending assignment data:', assignmentData);
    
    // Make sure you have the token
    const token = localStorage.getItem('teacherToken'); // or your token key
    
    const response = await fetch('/api/assignments/teacher/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assignmentData)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔴 Backend error:', errorData);
      throw new Error(errorData.error || 'Failed to create assignment');
    }
    
    const data = await response.json();
    console.log('✅ Assignment created:', data);
    
    // Handle success
    alert('Assignment created successfully!');
    
  } catch (error) {
    console.error('🔴 Form submission error:', error);
    alert(`Error: ${error.message}`);
  }
};

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep 
          assignmentData={assignmentData} 
          courses={courses}
          maxDate={maxDate}
          onChange={handleBasicInfoChange} 
        />;
      case 1:
        return <QuestionsStep 
          questions={assignmentData.questions}
          onAddQuestion={addQuestion}
          onUpdateQuestion={updateQuestion}
          onDeleteQuestion={deleteQuestion}
        />;
      case 2:
        return <SettingsStep 
          settings={assignmentData.settings}
          onChange={handleSettingsChange}
        />;
      case 3:
        return <ReviewStep assignmentData={assignmentData} courses={courses} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                index === currentStep
                  ? 'bg-green-600 text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="text-xs mt-2 text-center">
                <div className={`font-medium ${
                  index === currentStep ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
                <div className="text-gray-400 hidden sm:block">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmitAssignment}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : onCancel()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Assignment
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Step 1: Basic Information
const BasicInfoStep = ({ assignmentData, courses, maxDate, onChange }) => {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Assignment Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Course *
          </label>
          <select
            value={assignmentData.course_id}
            onChange={(e) => onChange('course_id', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.course_title} - {course.course_category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assignment Title *
          </label>
          <input
            type="text"
            value={assignmentData.assignment_title}
            onChange={(e) => onChange('assignment_title', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter assignment title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Topic/Subject *
          </label>
          <input
            type="text"
            value={assignmentData.assignment_topic}
            onChange={(e) => onChange('assignment_topic', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., Mathematics, Science, History"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assignment Description
          </label>
          <textarea
            value={assignmentData.assignment_description}
            onChange={(e) => onChange('assignment_description', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Describe the assignment objectives and requirements"
            maxLength="500"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {assignmentData.assignment_description.length}/500
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Assignment Date *
            </label>
            <input
              type="date"
              value={assignmentData.assignment_date}
              onChange={(e) => onChange('assignment_date', e.target.value)}
              min={today}
              max={maxDate.toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due Date *
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={assignmentData.due_date}
                onChange={(e) => onChange('due_date', e.target.value)}
                min={assignmentData.assignment_date}
                max={maxDate.toISOString().split('T')[0]}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="time"
                value={assignmentData.due_time}
                onChange={(e) => onChange('due_time', e.target.value)}
                className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Step 2: Questions
const QuestionsStep = ({ questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">MCQ Questions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add up to 20 multiple choice questions for daily assignment
          </p>
        </div>
        <button
          type="button"
          onClick={onAddQuestion}
          disabled={questions.length >= 20}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question ({questions.length}/20)
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No questions added yet</p>
          <p className="text-gray-500 text-sm">Click "Add Question" to start creating MCQs</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((question, index) => (
            <AssignmentQuestionItem
              key={index}
              question={question}
              index={index}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Individual Assignment Question Component
const AssignmentQuestionItem = ({ question, index, onUpdate, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-green-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
            Q{question.question_number}
          </span>
          <span className="text-sm text-gray-600">
            Daily Assignment Question
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
            required
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Enter your question"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map(option => (
            <div key={option}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option {option} *
              </label>
              <input
                type="text"
                value={question.options[option]}
                onChange={(e) => onUpdate(index, `options.${option}`, e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Option ${option}`}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Correct Answer *
            </label>
            <select
              value={question.correct_option}
              onChange={(e) => onUpdate(index, 'correct_option', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Points
            </label>
            <select
              value={question.points}
              onChange={(e) => onUpdate(index, 'points', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(points => (
                <option key={points} value={points}>
                  {points} point{points > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
          <textarea
            value={question.explanation}
            onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Provide explanation for the correct answer"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Settings
const SettingsStep = ({ settings, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800">Assignment Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maximum Attempts *
            </label>
            <select
              value={settings.max_attempts}
              onChange={(e) => onChange('max_attempts', parseInt(e.target.value))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="1">1 attempt</option>
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Late Submission Penalty (%)
            </label>
            <input
              type="number"
              value={settings.late_submission_penalty}
              onChange={(e) => onChange('late_submission_penalty', e.target.value)}
              min="0"
              max="50"
              step="5"
              disabled={!settings.allow_late_submission}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-100"
            />
            <div className="text-sm text-gray-500 mt-1">
              Percentage of points deducted for late submission
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Daily Assignment Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Assignments are created on daily basis. Students can attempt them on the assigned date.
                  Late submissions are optional and can be configured below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.allow_late_submission}
            onChange={(e) => onChange('allow_late_submission', e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            Allow late submissions
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.show_answers_after_due}
            onChange={(e) => onChange('show_answers_after_due', e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            Show correct answers to students after due date
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.is_active}
            onChange={(e) => onChange('is_active', e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            Activate assignment immediately
          </span>
        </label>
      </div>
    </motion.div>
  );
};

// Step 4: Review
const ReviewStep = ({ assignmentData, courses }) => {
  const totalPoints = assignmentData.questions.reduce((sum, q) => sum + q.points, 0);
  const selectedCourse = courses.find(c => c._id === assignmentData.course_id);
  
  const dueDateTime = new Date(`${assignmentData.due_date}T${assignmentData.due_time}`);
  const assignmentDate = new Date(assignmentData.assignment_date);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800">Review Assignment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" />
            Assignment Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium">{selectedCourse ? selectedCourse.course_title : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{assignmentData.assignment_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Topic:</span>
              <span className="font-medium">{assignmentData.assignment_topic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{assignmentDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due:</span>
              <span className="font-medium">
                {dueDateTime.toLocaleDateString()} at {dueDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {assignmentData.assignment_description && (
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="text-gray-800 mt-1">{assignmentData.assignment_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Settings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Max Attempts:</span>
              <span className="font-medium">{assignmentData.settings.max_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Submissions:</span>
              <span className="font-medium">{assignmentData.settings.allow_late_submission ? 'Allowed' : 'Not Allowed'}</span>
            </div>
            {assignmentData.settings.allow_late_submission && (
              <div className="flex justify-between">
                <span className="text-gray-600">Late Penalty:</span>
                <span className="font-medium">{assignmentData.settings.late_submission_penalty}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Show Answers:</span>
              <span className="font-medium">{assignmentData.settings.show_answers_after_due ? 'After Due Date' : 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active:</span>
              <span className="font-medium">{assignmentData.settings.is_active ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">Questions Summary</h4>
          <div className="text-sm text-gray-600">
            {assignmentData.questions.length} questions • {totalPoints} total points
          </div>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {assignmentData.questions.map((question, index) => (
            <div key={index} className="border-b border-green-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    Q{question.question_number}: {question.question_text}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['A', 'B', 'C', 'D'].map(option => (
                      <span
                        key={option}
                        className={`text-xs px-2 py-1 rounded ${
                          question.correct_option === option
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {option}. {question.options[option]}
                        {question.correct_option === option && ' ✓'}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                  {question.points} pt{question.points > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AddAssignmentForm;