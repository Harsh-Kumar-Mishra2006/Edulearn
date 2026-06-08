import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Mail, Book, Phone, Award, Briefcase, Lock } from 'lucide-react';
import { courses } from '../../services/Coursefile';

const AddTeacher = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    phone: '',
    password: '', // ✅ ADD PASSWORD FIELD
    qualification: '',
    years_of_experience: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    specialization: [],
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const availableCourses = [...new Set(courses.map(course => course.title))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long'
      });
      setLoading(false);
      return;
    }

    const processedData = {
      name: (formData.name || '').trim(),
      email: (formData.email || '').trim().toLowerCase(),
      course: (formData.course || '').trim(),
      phone: (formData.phone || '').trim(),
      password: formData.password, // ✅ Include password
      qualification: (formData.qualification || '').trim(),
      years_of_experience: Number(formData.years_of_experience) || 0,
      address: {
        street: (formData.address?.street || '').trim(),
        city: (formData.address?.city || '').trim(),
        state: (formData.address?.state || '').trim(),
        pincode: (formData.address?.pincode || '').trim(),
        country: (formData.address?.country || 'India').trim()
      },
      specialization: Array.isArray(formData.specialization) ?
        formData.specialization.map(s => s.trim()).filter(s => s) : [],
      bio: (formData.bio || '').trim()
    };

    const requiredFields = [
      { key: 'name', value: processedData.name },
      { key: 'email', value: processedData.email },
      { key: 'course', value: processedData.course },
      { key: 'phone', value: processedData.phone },
      { key: 'password', value: processedData.password },
      { key: 'qualification', value: processedData.qualification },
      { key: 'years_of_experience', value: processedData.years_of_experience }
    ];

    const emptyFields = requiredFields
      .filter(field => !field.value && field.value !== 0)
      .map(field => field.key);

    const addressFields = ['street', 'city', 'state', 'pincode'];
    const emptyAddressFields = addressFields
      .filter(key => !processedData.address[key])
      .map(key => `address.${key}`);

    const allEmptyFields = [...emptyFields, ...emptyAddressFields];

    if (allEmptyFields.length > 0) {
      setMessage({
        type: 'error',
        text: `Missing fields: ${allEmptyFields.join(', ')}`
      });
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(processedData.phone)) {
      setMessage({
        type: 'error',
        text: 'Phone must be 10-15 digits'
      });
      setLoading(false);
      return;
    }

    if (processedData.years_of_experience < 0 || processedData.years_of_experience > 50) {
      setMessage({
        type: 'error',
        text: 'Experience must be between 0-50 years'
      });
      setLoading(false);
      return;
    }

    const result = await onSubmit(processedData);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setFormData({
        name: '',
        email: '',
        course: '',
        phone: '',
        password: '',
        qualification: '',
        years_of_experience: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        specialization: [],
        bio: ''
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to add teacher'
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Add New Teacher</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3 rounded-lg ${message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
              {message.text}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter teacher's full name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          {/* ✅ NEW PASSWORD FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Set Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter password for teacher"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Teacher will use this password to login (minimum 6 characters)
            </p>
          </div>

          {/* Course Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Book className="w-4 h-4" />
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select a course</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
              pattern="[0-9]{10,15}"
            />
          </div>

          {/* Qualification Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter highest qualification"
            />
          </div>

          {/* Experience Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Experience (years)
            </label>
            <input
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              required
              min="0"
              max="50"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter years of experience"
            />
          </div>

          {/* Specialization Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specialization (Optional)
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Algebra, Calculus, Geometry (comma separated)"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description about the teacher..."
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Address Section */}
          <div className="space-y-4 pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Details
            </label>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pincode"
                  required
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddTeacher;