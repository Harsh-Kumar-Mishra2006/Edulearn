import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './sections/Navbar'
import HeroSection from './Components/Hero'
import Footer from './sections/Footer'
import CoursesPage from './Components/Course'
import PersonalForm from './Components/forms/Personalform'
import BackgroundForm from './Components/forms/Backgroundform'
import CourseForm from './Components/forms/Courseform'
import PaymentPage from './Components/Payment/PaymentPage';
import StudentRecords from './Components/admin/StudentRecords';
import AdminDashboard from './Components/admin/admindashboard';
import CreateCourse from './Components/teacher/CreateCourse';
import MyCourses from './Components/Student/MyCourses';
import CertificateManagement from './Components/admin/Certificate/CertificateManagement';
import MyLearning from './Components/Mylearning/Mylearning';
import Quiz from './Components/teacher/Quiz/quiz';
import Test from './Components/Student/Test/Test';
import QuizAttempt from './Components/Student/Test/QuizAttempt';
import StudentDashboard from './Components/Student/studentdashboard/StudentDashboard';
import Analytics from './Components/admin/Analytics/Analytics';
import AdminAnalytics from './Components/admin/Analytics/Analytics';
import NewCourses from './sections/newCourses';
import StudentAssignmentView from './Components/Student/assignments/studentAssignments';
import StudentQueryForm from './Components/forms/querryForm';
// Add this admin check function
const checkAdminAuth = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) return false;
  
  try {
    const user = JSON.parse(userData);
    return user.role === 'admin';
  } catch {
    return false;
  }
};

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  return checkAdminAuth() ? children : <Navigate to="/admin" replace />;
};

const ProtectedStudentRoute = ({ children }) => {
  return checkStudentAuth() ? children : <Navigate to="/student" replace />;
};
// In your Routes
<Route 
  path="/certificate" 
  element={
    <ProtectedAdminRoute>
      <CertificateManagement />
    </ProtectedAdminRoute>
  } 
/>,
<Route 
  path="/dashboard" 
  element={
    <ProtectedAdminRoute>
    </ProtectedAdminRoute>
  } 
/>

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <Routes>
          {/* Home page with hero and courses */}
          <Route path="/" element={
            <>
              <HeroSection />
              <CoursesPage />
              <StudentQueryForm/>
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <HeroSection />
              <CoursesPage />
              <StudentQueryForm/>
            </>
          } />

          <Route path="/dashboard" element={<AdminDashboard/>} />
          <Route path="/create-course" element={<CreateCourse/>}/>
          <Route path="/my-courses" element={<MyCourses/>}/>
          <Route 
  path="/certificate-management" 
  element={
    <ProtectedAdminRoute>
      <CertificateManagement />
    </ProtectedAdminRoute>
  } 
/>
          <Route path="/my-learning" element={<MyLearning/>}/>
          <Route path="/test" element={<Test/>}/>
          <Route path='/quiz-creator' element={<Quiz/>}/>
          <Route path="/quiz/attempt/:attemptId" element={<QuizAttempt />} />
          <Route path="/student-record" element={<StudentDashboard/>}/>
          <Route path="/assignments" element={<StudentAssignmentView/>}/>

          {/* Individual pages */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/personal-form" element={<PersonalForm />} />
          <Route path="/background-form" element={<BackgroundForm />} />
          <Route path="/course-form" element={<CourseForm />} />
          <Route path="/payment" element={<PaymentPage/>} />
          <Route path="/student-records" element={<StudentRecords/>}/>
          <Route path="/analytics" element={<AdminAnalytics/>}/>

           {/* Admin specific routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminDashboard />} />
          <Route path="/admin-settings" element={<AdminDashboard />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App
