// components/teacher/AddNewCourse.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Tag,
  CheckCircle,
  AlertCircle,
  Users,
  Plus
} from 'lucide-react';

const AddNewCourse = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    price: '',
    category: 'Development',
    features: [],
    popular: false,
    isFree: false,
    discountPrice: '',
    prerequisites: [],
    learningOutcomes: [],
    metaTitle: '',
    metaDescription: '',
    isFeatured: false
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [currentOutcome, setCurrentOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Development',
    'Design', 
    'Marketing',
    'Productivity',
    'Business',
    'Technology',
    'Personal Development',
    'Others'
  ];

  const levels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'All Levels',
    'Beginner to Advanced',
    'Beginner to Intermediate'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        setError('Price cannot be negative');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (currentPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()]
      }));
      setCurrentPrerequisite('');
    }
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    if (currentOutcome.trim()) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, currentOutcome.trim()]
      }));
      setCurrentOutcome('');
    }
  };

  const removeOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Course description is required');
      return;
    }
    
    if (!formData.duration.trim()) {
      setError('Course duration is required');
      return;
    }
    
    if (!formData.isFree && (!formData.price || formData.price === '')) {
      setError('Course price is required for paid courses');
      return;
    }
    
    if (!image) {
      setError('Course image is required');
      return;
    }

    // Prepare form data
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('level', formData.level);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('popular', formData.popular.toString());
    formDataToSend.append('isFree', formData.isFree.toString());
    formDataToSend.append('isFeatured', formData.isFeatured.toString());
    
    // Append price only if not free
    if (!formData.isFree) {
      formDataToSend.append('price', formData.price);
    } else {
      formDataToSend.append('price', '0');
    }
    
    if (formData.discountPrice) {
      formDataToSend.append('discountPrice', formData.discountPrice);
    }
    
    // Append arrays as comma-separated strings
    if (formData.features.length > 0) {
      formDataToSend.append('features', formData.features.join(','));
    }
    
    if (formData.prerequisites.length > 0) {
      formDataToSend.append('prerequisites', formData.prerequisites.join(','));
    }
    
    if (formData.learningOutcomes.length > 0) {
      formDataToSend.append('learningOutcomes', formData.learningOutcomes.join(','));
    }
    
    // Append meta fields
    if (formData.metaTitle) {
      formDataToSend.append('metaTitle', formData.metaTitle);
    }
    
    if (formData.metaDescription) {
      formDataToSend.append('metaDescription', formData.metaDescription);
    }
    
    // Append image
    if (image) {
      formDataToSend.append('image', image);
    }

    setLoading(true);

  try {
    const token = localStorage.getItem('token');
    
    console.log('📤 Sending to:', 'https://edulearnbackend-ffiv.onrender.com/api/teacher/courses');
    
    const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/teacher/courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataToSend
    });
    // Check if response is JSON or HTML
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      // It's HTML - likely a 404/500 error page
      const text = await response.text();
      console.error('❌ Server returned HTML (not JSON):', text.substring(0, 200));
      
      // Try to extract error from HTML or show generic message
      let errorMsg = `Server error (${response.status})`;
      if (text.includes('<title>')) {
        const match = text.match(/<title>(.*?)<\/title>/);
        if (match) errorMsg = match[1];
      }
      
      setError(`Failed to create course: ${errorMsg}`);
      return;
    }

    const result = await response.json();
    
    if (!result.success) {
      setError(result.error || result.message || 'Failed to create course');
    } else {
      // Success
      setFormData({ /* reset form */ });
      setImage(null);
      setImagePreview(null);
      onSuccess();
    }
  } catch (err) {
    console.error('❌ Error creating course:', err);
    setError(`Failed to create course: ${err.message}`);
  } finally {
    setLoading(false);
  }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add New Course to Catalog</h2>
              <p className="text-sm text-gray-600">This course will be available to all students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6 text-black">
              {/* Course Title */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., Web Development Masterclass"
                  required
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Describe what students will learn in this course..."
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="e.g., 12 weeks, 8 hours"
                    required
                  />
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">₹</span>
                  Pricing
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-gray-700">This is a free course</span>
                  </label>

                  {!formData.isFree && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Price (INR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="₹500"
                          required={!formData.isFree}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Discount Price (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="₹400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 text-black">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-48 h-32 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 font-medium">Upload course image</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                        <span className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors">
                          Choose File
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course Features
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Add ?. to safely check if features exists */}
{formData.features?.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {formData.features.map((feature, index) => (
      <span
        key={index}
        className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
      >
        {feature}
        <button
          type="button"
          onClick={() => removeFeature(index)}
          className="text-emerald-500 hover:text-emerald-700"
        >
          ×
        </button>
      </span>
    ))}
  </div>
)}
                </div>
              </div>

              {/* Course Flags */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="block text-sm font-medium text-gray-700 mt-1">Popular</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="block text-sm font-medium text-gray-700 mt-1">Featured</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Course...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Add to Catalog
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddNewCourse;