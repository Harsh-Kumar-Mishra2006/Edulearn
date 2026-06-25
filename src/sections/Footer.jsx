// components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  Award,
  Shield,
  ChevronRight,
  Send,
  Heart
} from 'lucide-react';

const Footer = () => {
  const socialIcons = [
    { Icon: Facebook, color: 'hover:bg-blue-600' },
    { Icon: Twitter, color: 'hover:bg-sky-500' },
    { Icon: Instagram, color: 'hover:bg-pink-600' },
    { Icon: Linkedin, color: 'hover:bg-blue-700' },
    { Icon: Youtube, color: 'hover:bg-red-600' }
  ];

  const quickLinks = ['Home', 'Courses', 'About Us', 'Pricing', 'Success Stories'];
  const categories = [
    'Web Development',
    'Microsoft Office',
    'Mobile App Development',
    'UI/UX Design',
    'Digital Marketing',
    'Graphic Design'
  ];
  const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                EduLearn
              </span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Transform your career with our expert-led courses. Learn at your own pace and join a community of 50,000+ successful students.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <Users className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">50K+</p>
                <p className="text-gray-400 text-xs">Students</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <Award className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">200+</p>
                <p className="text-gray-400 text-xs">Courses</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <GraduationCap className="h-5 w-5 text-pink-400 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">4.8</p>
                <p className="text-gray-400 text-xs">Rating</p>
              </div>
            </div>

            <div className="flex space-x-3">
              {socialIcons.map(({ Icon, color }, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 ${color} transition-all duration-300 border border-white/10 hover:border-transparent hover:scale-110 hover:shadow-lg`}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <ChevronRight className="h-3 w-3 mr-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              Categories
            </h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <motion.a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                    whileHover={{ x: 5 }}
                  >
                    {category}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Mail className="h-4 w-4 text-pink-400" />
              Contact Us
            </h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                whileHover={{ x: 5 }}
              >
                <MapPin className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  Darbhanga<br />
                  Bihar, India
                </p>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                whileHover={{ x: 5 }}
              >
                <Phone className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+91 xxxxx xxxxx</p>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                whileHover={{ x: 5 }}
              >
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">hello@edulearn.com</p>
              </motion.div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Send className="h-4 w-4 text-amber-400" />
                NEWSLETTER
              </h4>
              <div className="flex bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden focus-within:border-indigo-400 transition-all duration-300">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-white placeholder-gray-400 text-sm"
                />
                <motion.button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-3 transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="h-4 w-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              © 2026 EduLearn. All rights reserved.
              <Heart className="h-3 w-3 text-red-400 animate-pulse" />
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {legalLinks.map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <motion.button 
          className="relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300">
            <BookOpen className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-12 right-0 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <span className="font-semibold text-sm">Start Learning Today!</span>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white/90"></div>
          </div>
        </motion.button>
      </motion.div>
    </footer>
  );
};

export default Footer;