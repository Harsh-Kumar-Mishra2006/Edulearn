// services/TeacherCourseService.js
const API_BASE_URL = 'http://localhost:5000'; // Change to your backend URL

class TeacherCourseService {
  static async fetchAllCourses() {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch from both admin and teacher APIs
      const [adminResponse, teacherResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/new-courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null)
      ]);

      const allCourses = [];

      // Process admin courses
      if (adminResponse && adminResponse.ok) {
        const adminData = await adminResponse.json();
        if (adminData.success) {
          const adminCourses = this.transformAdminCourses(adminData.data);
          allCourses.push(...adminCourses);
        }
      }

      // Process teacher courses
      if (teacherResponse && teacherResponse.ok) {
        const teacherData = await teacherResponse.json();
        if (teacherData.success) {
          const teacherCourses = this.transformTeacherCourses(teacherData.data);
          allCourses.push(...teacherCourses);
        }
      }

      return allCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  static transformAdminCourses(courses) {
    return courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      image: course.image ? `${API_BASE_URL}/uploads/courses/images/${course.image}` : '/default-course.jpg',
      duration: course.duration,
      level: course.level,
      price: course.price,
      rating: course.rating || 0,
      students: 0,
      category: course.category,
      features: course.features || [],
      popular: course.popular || false,
      isFeatured: course.isFeatured || false,
      status: course.status,
      createdBy: course.createdByName || course.instructor || 'Admin',
      createdAt: course.createdAt,
      enrolledStudents: course.studentsEnrolled || 0,
      createdByRole: 'admin',
      type: 'admin'
    }));
  }

  static transformTeacherCourses(courses) {
    return courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      image: course.image ? `${API_BASE_URL}/uploads/courses/images/${course.image}` : '/default-course.jpg',
      duration: course.duration,
      level: course.level,
      price: course.price,
      rating: course.rating || 0,
      students: 0,
      category: course.category,
      features: course.features || [],
      popular: course.popular || false,
      isFeatured: course.isFeatured || false,
      status: course.status,
      createdBy: course.instructor || course.createdByName || 'Teacher',
      createdAt: course.createdAt,
      enrolledStudents: course.studentsEnrolled || 0,
      createdByRole: 'teacher',
      type: 'teacher'
    }));
  }

  static async createCourse(formData, imageFile) {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features' || key === 'prerequisites' || key === 'learningOutcomes') {
          if (formData[key].length > 0) {
            data.append(key, formData[key].join(','));
          }
        } else {
          data.append(key, formData[key]);
        }
      });
      
      // Append image
      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/new-courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();
      
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