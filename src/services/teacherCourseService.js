// services/TeacherCourseService.js
const API_BASE_URL = 'http://localhost:3000';

class TeacherCourseService {
  static async fetchAllCourses() {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📚 Fetching courses from:', `${API_BASE_URL}/api/teacher/courses`);
      
      const response = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('API Error:', await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response success:', result.success);
      console.log('Number of courses:', result.data?.length || 0);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch courses');
      }

      return result.data || [];
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  static transformCourses(courses) {
    if (!Array.isArray(courses)) {
      console.error('Courses data is not an array:', courses);
      return [];
    }

    return courses.map(course => {
      // Build image URL
      let imageUrl = '/default-course.jpg';
      if (course.image) {
        if (course.image.startsWith('http')) {
          imageUrl = course.image;
        } else {
          imageUrl = `${API_BASE_URL}/uploads/${course.image}`;
        }
      }

      // Determine creator role and name
      const createdByRole = course.createdByRole || (course.createdBy === req.user?.id ? 'teacher' : 'admin');
      const createdByName = course.instructor || course.createdByName || (createdByRole === 'teacher' ? 'Teacher' : 'Admin');

      return {
        id: course._id || course.id,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        image: imageUrl,
        duration: course.duration || 'Not specified',
        level: course.level || 'Beginner',
        price: course.price || 0,
        rating: course.rating || 0,
        category: course.category || 'Others',
        features: Array.isArray(course.features) ? course.features : [],
        popular: Boolean(course.popular),
        isFeatured: Boolean(course.isFeatured),
        status: course.status || 'published',
        createdBy: createdByName,
        createdAt: course.createdAt || new Date().toISOString(),
        enrolledStudents: course.studentsEnrolled || course.enrolledStudents || 0,
        createdByRole: createdByRole,
        type: createdByRole === 'teacher' ? 'teacher' : 'admin',
        // Additional fields that might be in your CourseCard
        prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
        learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
        isFree: Boolean(course.isFree),
        discountPrice: course.discountPrice || null
      };
    });
  }

  static async createCourse(formData, imageFile) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features' || key === 'prerequisites' || key === 'learningOutcomes') {
          if (formData[key] && formData[key].length > 0) {
            data.append(key, formData[key].join(','));
          }
        } else if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      
      // Append image
      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();
      console.log('Create course response:', result);
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to create course');
      }

      return result;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }
}

export default TeacherCourseService;