// components/CourseSummary.jsx
import React from 'react';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const CourseSummary = ({ course }) => {
  if (!course) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        {/* Course Info */}
        <div className="flex-1 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
          <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-gray-700">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{course.duration}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{course.students?.toLocaleString()} students</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
              <span className="text-sm">{course.rating}</span>
            </div>
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {course.category}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300 min-w-[200px]">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Course Fee</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ₹{course.price}
            </div>
            {course.discountPrice && (
              <div className="text-sm text-gray-500 line-through">
                ₹{course.discountPrice}
              </div>
            )}
            <div className="text-sm text-green-600 font-medium mt-2">
              One-time payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSummary;