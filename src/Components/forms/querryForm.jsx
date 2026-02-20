import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, Loader, MessageSquare, Lightbulb, User, Mail, Phone } from 'lucide-react';

const StudentQueryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    issue: '',
    suggestion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form progress
  useEffect(() => {
    let filled = 0;
    if (formData.name) filled += 20;
    if (formData.email) filled += 20;
    if (formData.phone) filled += 20;
    if (formData.issue) filled += 20;
    if (formData.suggestion) filled += 20;
    setFormProgress(filled);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://edulearnbackend-ffiv.onrender.com/api/queries/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Your query has been submitted successfully!'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          issue: '',
          suggestion: ''
        });
        setFormProgress(0);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to submit query'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-cyan-200 via-sky-200 to-fuchsia-200 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-20 left-20 text-blue-200 opacity-20"
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
      >
        <MessageSquare size={60} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-20 text-blue-200 opacity-20"
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
      >
        <Lightbulb size={60} />
      </motion.div>

      {/* Main form card */}
      <motion.div
        variants={itemVariants}
        className="relative w-full max-w-3xl z-10"
      >
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-blue-100"
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.3)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Header with animated gradient */}
          <motion.div
            className="relative h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center overflow-hidden"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            {/* Animated overlay */}
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Header content */}
            <motion.div
              className="text-center z-10"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                animate={{
                  textShadow: [
                    '0 0 8px rgba(255,255,255,0.5)',
                    '0 0 16px rgba(255,255,255,0.8)',
                    '0 0 8px rgba(255,255,255,0.5)'
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Student Query Form
              </motion.h1>
              <p className="text-blue-100 text-sm md:text-base">
                Share your thoughts and concerns with the administration
              </p>
            </motion.div>

            {/* Decorative circles */}
            <motion.div
              className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>

          {/* Animated progress bar */}
          <motion.div
            className="h-1.5 bg-blue-100"
            initial={{ width: '0%' }}
            animate={{ width: `${formProgress}%` }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% 200%' }}
            />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Personal Information Section */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
              {/* Name field */}
              <div>
                <motion.label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                  animate={focusedField === 'name' ? { color: '#2563eb', x: 5 } : { color: '#374151', x: 0 }}
                >
                  <User size={16} className={focusedField === 'name' ? 'text-blue-600' : 'text-gray-400'} />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </motion.label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  whileFocus={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)' }}
                />
              </div>

              {/* Email field */}
              <div>
                <motion.label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                  animate={focusedField === 'email' ? { color: '#2563eb', x: 5 } : { color: '#374151', x: 0 }}
                >
                  <Mail size={16} className={focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'} />
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </motion.label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  whileFocus={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)' }}
                />
              </div>

              {/* Phone field */}
              <div className="md:col-span-2">
                <motion.label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                  animate={focusedField === 'phone' ? { color: '#2563eb', x: 5 } : { color: '#374151', x: 0 }}
                >
                  <Phone size={16} className={focusedField === 'phone' ? 'text-blue-600' : 'text-gray-400'} />
                  <span>Phone Number</span>
                  <span className="text-red-500">*</span>
                </motion.label>
                <motion.input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your phone number"
                  whileFocus={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)' }}
                />
              </div>
            </motion.div>

            {/* Query Section */}
            <motion.div variants={itemVariants}>
              <motion.label
                htmlFor="issue"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                animate={focusedField === 'issue' ? { color: '#2563eb', x: 5 } : { color: '#374151', x: 0 }}
              >
                <MessageSquare size={18} className={focusedField === 'issue' ? 'text-blue-600' : 'text-gray-400'} />
                <span>Issue / Query</span>
                <motion.span
                  className="text-red-500 text-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  *
                </motion.span>
              </motion.label>
              
              <motion.textarea
                id="issue"
                name="issue"
                rows="4"
                value={formData.issue}
                onChange={handleChange}
                onFocus={() => setFocusedField('issue')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm"
                placeholder="Describe your issue or query in detail..."
                whileFocus={{ 
                  scale: 1.02, 
                  boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.2)',
                  borderColor: '#3b82f6'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              
              <AnimatePresence>
                {formData.issue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-xs text-blue-600 font-medium"
                  >
                    {formData.issue.length} characters
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Suggestion Section */}
            <motion.div variants={itemVariants}>
              <motion.label
                htmlFor="suggestion"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                animate={focusedField === 'suggestion' ? { color: '#2563eb', x: 5 } : { color: '#374151', x: 0 }}
              >
                <Lightbulb size={18} className={focusedField === 'suggestion' ? 'text-blue-600' : 'text-gray-400'} />
                <span>Suggestions</span>
                <motion.span
                  className="text-red-500 text-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  *
                </motion.span>
              </motion.label>
              
              <motion.textarea
                id="suggestion"
                name="suggestion"
                rows="4"
                value={formData.suggestion}
                onChange={handleChange}
                onFocus={() => setFocusedField('suggestion')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm"
                placeholder="Share your suggestions for improvement..."
                whileFocus={{ 
                  scale: 1.02, 
                  boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.2)',
                  borderColor: '#3b82f6'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              
              <AnimatePresence>
                {formData.suggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-xs text-blue-600 font-medium"
                  >
                    {formData.suggestion.length} characters
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Status message */}
            <AnimatePresence mode="wait">
              {submitStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className={`p-4 rounded-xl flex items-center gap-3 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.5 }}>
                      <CheckCircle size={20} className="text-green-600" />
                    </motion.div>
                  ) : (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3, repeat: 2 }}>
                      <AlertCircle size={20} className="text-red-600" />
                    </motion.div>
                  )}
                  <span className="flex-1">{submitStatus.message}</span>
                  <motion.button
                    type="button"
                    onClick={() => setSubmitStatus({ type: '', message: '' })}
                    className="text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading || !formData.name || !formData.email || !formData.phone || !formData.issue || !formData.suggestion}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={!loading && formData.name && formData.email && formData.phone && formData.issue && formData.suggestion ? { 
                  scale: 1.02, 
                  boxShadow: '0 25px 35px -10px rgba(37, 99, 235, 0.5)',
                } : {}}
                whileTap={!loading && formData.name && formData.email && formData.phone && formData.issue && formData.suggestion ? { scale: 0.98 } : {}}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400"
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ opacity: 0.3 }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                
                <motion.span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader size={20} />
                      </motion.div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={formData.name && formData.email && formData.phone && formData.issue && formData.suggestion ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Send size={20} />
                      </motion.div>
                      <span>Submit Query</span>
                    </>
                  )}
                </motion.span>
              </motion.button>
            </motion.div>

            {/* Helper text */}
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-gray-500"
            >
              Your query will be sent directly to the administration for review.
              <motion.span
                className="block mt-2 text-blue-600 font-medium"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Thank you for helping us improve! ✨
              </motion.span>
            </motion.p>

            {/* Required fields note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-center text-xs text-gray-400"
            >
              * All fields are required
            </motion.div>
          </form>
        </motion.div>

        {/* Decorative corner accents */}
        <motion.div
          className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default StudentQueryForm;