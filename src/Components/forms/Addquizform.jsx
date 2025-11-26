// components/forms/AddQuizForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Clock,
  Users,
  Eye
} from 'lucide-react';

const AddQuizForm = ({ courses, onSubmit, loading, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState({
    course_id: courses.length > 0 ? courses[0]._id : '',
    quiz_title: '',
    quiz_description: '',
    quiz_topic: '',
    questions: [],
    quiz_settings: {
      time_limit: 30,
      max_attempts: 1,
      show_results: true,
      is_active: true,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: ''
    }
  });

  const steps = [
    { title: 'Basic Info', description: 'Quiz basic information' },
    { title: 'Add Questions', description: 'Create quiz questions' },
    { title: 'Settings', description: 'Configure quiz settings' },
    { title: 'Review', description: 'Review and create' }
  ];

  // Handle basic info changes
  const handleBasicInfoChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle settings changes
  const handleSettingsChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      quiz_settings: {
        ...prev.quiz_settings,
        [field]: value
      }
    }));
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      question_number: quizData.questions.length + 1,
      question_text: '',
      options: {
        A: '',
        B: '',
        C: '',
        D: ''
      },
      correct_option: 'A',
      explanation: '',
      points: 1
    };
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    
    if (field.startsWith('options.')) {
      const optionKey = field.split('.')[1];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        options: {
          ...updatedQuestions[index].options,
          [optionKey]: value
        }
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Delete question
  const deleteQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index)
      .map((question, idx) => ({
        ...question,
        question_number: idx + 1
      }));
    
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        return quizData.course_id && quizData.quiz_title.trim() && quizData.quiz_topic.trim();
      case 1: // Questions
        return quizData.questions.length > 0 && 
               quizData.questions.every(q => 
                 q.question_text.trim() && 
                 q.options.A.trim() && 
                 q.options.B.trim() && 
                 q.options.C.trim() && 
                 q.options.D.trim()
               );
      case 2: // Settings
        return quizData.quiz_settings.time_limit >= 5 && 
               quizData.quiz_settings.max_attempts >= 1;
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(quizData);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep 
          quizData={quizData} 
          courses={courses}
          onChange={handleBasicInfoChange} 
        />;
      case 1:
        return <QuestionsStep 
          questions={quizData.questions}
          onAddQuestion={addQuestion}
          onUpdateQuestion={updateQuestion}
          onDeleteQuestion={deleteQuestion}
        />;
      case 2:
        return <SettingsStep 
          settings={quizData.quiz_settings}
          onChange={handleSettingsChange}
        />;
      case 3:
        return <ReviewStep quizData={quizData} courses={courses} />;
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
                  ? 'bg-blue-600 text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="text-xs mt-2 text-center">
                <div className={`font-medium ${
                  index === currentStep ? 'text-blue-600' : 'text-gray-600'
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
      <form onSubmit={handleSubmit}>
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
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    Create Quiz
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
const BasicInfoStep = ({ quizData, courses, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Quiz Information</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Course *
          </label>
          <select
            value={quizData.course_id}
            onChange={(e) => onChange('course_id', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            Quiz Title *
          </label>
          <input
            type="text"
            value={quizData.quiz_title}
            onChange={(e) => onChange('quiz_title', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quiz Topic *
          </label>
          <input
            type="text"
            value={quizData.quiz_topic}
            onChange={(e) => onChange('quiz_topic', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter quiz topic"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quiz Description
          </label>
          <textarea
            value={quizData.quiz_description}
            onChange={(e) => onChange('quiz_description', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Describe the quiz"
            maxLength="500"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {quizData.quiz_description.length}/500
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
        <h3 className="text-xl font-semibold text-gray-800">Quiz Questions</h3>
        <button
          type="button"
          onClick={onAddQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No questions added yet</p>
          <p className="text-gray-500 text-sm">Click "Add Question" to get started</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((question, index) => (
            <QuestionItem
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

// Individual Question Component
const QuestionItem = ({ question, index, onUpdate, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-gray-800">Question {question.question_number}</h4>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Option ${option}`}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
            <select
              value={question.correct_option}
              onChange={(e) => onUpdate(index, 'correct_option', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <select
              value={question.points}
              onChange={(e) => onUpdate(index, 'points', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Explanation for the correct answer"
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
      <h3 className="text-xl font-semibold text-gray-800">Quiz Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              value={settings.time_limit}
              onChange={(e) => onChange('time_limit', parseInt(e.target.value))}
              min="5"
              max="180"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="text-sm text-gray-500 mt-1">5-180 minutes</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maximum Attempts *
            </label>
            <input
              type="number"
              value={settings.max_attempts}
              onChange={(e) => onChange('max_attempts', parseInt(e.target.value))}
              min="1"
              max="5"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="text-sm text-gray-500 mt-1">1-5 attempts</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={settings.start_date}
              onChange={(e) => onChange('start_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={settings.end_date}
              onChange={(e) => onChange('end_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.show_results}
            onChange={(e) => onChange('show_results', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Show results to students after submission
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.is_active}
            onChange={(e) => onChange('is_active', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            Activate quiz immediately
          </span>
        </label>
      </div>
    </motion.div>
  );
};

// Step 4: Review
const ReviewStep = ({ quizData, courses }) => {
  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);
  const selectedCourse = courses.find(c => c._id === quizData.course_id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800">Review Quiz</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium">{selectedCourse ? selectedCourse.course_title : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{quizData.quiz_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Topic:</span>
              <span className="font-medium">{quizData.quiz_topic}</span>
            </div>
            {quizData.quiz_description && (
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="text-gray-800 mt-1">{quizData.quiz_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Settings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Time Limit:</span>
              <span className="font-medium">{quizData.quiz_settings.time_limit} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Attempts:</span>
              <span className="font-medium">{quizData.quiz_settings.max_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Show Results:</span>
              <span className="font-medium">{quizData.quiz_settings.show_results ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active:</span>
              <span className="font-medium">{quizData.quiz_settings.is_active ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">Questions Summary</h4>
          <div className="text-sm text-gray-600">
            {quizData.questions.length} questions • {totalPoints} total points
          </div>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {quizData.questions.map((question, index) => (
            <div key={index} className="border-b pb-3 last:border-b-0">
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
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
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

export default AddQuizForm;