// components/teacher/Members.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, UserCheck, UserPlus } from 'lucide-react';
import TeachersList from '../TeacherList';
import StudentList from '../studentlist';

const Members = () => {
  const [activeTab, setActiveTab] = useState('teachers');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const tabVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Members Portal
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage all teachers and students in one unified dashboard
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1.5 shadow-lg flex gap-2">
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'teachers' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'teachers'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <Users className="w-5 h-5" />
              Teachers
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'teachers' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                Faculty
              </span>
            </motion.button>
            
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'students' ? 'active' : 'inactive'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Students
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'students' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                Learners
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'teachers' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'teachers' ? (
            <TeachersList 
              showDeleteButton={true}
              showHeader={true}
              headerTitle=""
              itemsPerPage={6}
              className="bg-transparent shadow-none"
            />
          ) : (
            <StudentList />
          )}
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 text-center">
            <UserCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Total Faculty</p>
            <p className="text-2xl font-bold text-gray-800">View in tab</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 text-center">
            <UserPlus className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">View in tab</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Community Size</p>
            <p className="text-2xl font-bold text-gray-800">Growing Daily</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Members;