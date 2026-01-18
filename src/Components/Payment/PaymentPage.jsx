// components/PaymentPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  QrCode, 
  Upload, 
  X, 
  CheckCircle, 
  Download,
  BookOpen,
  RotateCcw,
  CreditCard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import CourseSummary from '../Student/course/courseSummary';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [isUploaded, setIsUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const qrCodeImage = "/QR.jpg";

  // Fetch course data on component mount
  useEffect(() => {
    const fetchCourseData = () => {
      try {
        console.log('🟡 Location state:', location.state);
        
        // Method 1: Check location state
        if (location.state?.course) {
          console.log('✅ Course found in location state:', location.state.course);
          setCourseData(location.state.course);
          setLoading(false);
          return;
        }
        
        // Method 2: Check localStorage as fallback
        const storedCourse = localStorage.getItem('selectedCourse');
        if (storedCourse) {
          try {
            const parsedCourse = JSON.parse(storedCourse);
            console.log('✅ Course found in localStorage:', parsedCourse);
            setCourseData(parsedCourse);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing stored course:', e);
          }
        }
        
        // No course data found
        console.error('❌ No course data found');
        setError('Course information is missing. Please select a course again.');
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error fetching course data:', error);
        setError('Failed to load course information');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [location]);

  // Function to check if course is in hardcoded list
  const isHardcodedCourse = (courseTitle) => {
    const hardcodedCourses = [
      'Web Development',
      'Microsoft Office',
      'Mobile App Development',
      'UI/UX Design',
      'Digital Marketing',
      'Graphic Design'
    ];
    return hardcodedCourses.includes(courseTitle);
  };

  // Function to get course details from backend
  const verifyCourseWithBackend = async (courseTitle) => {
    try {
      console.log('🔍 Verifying course with backend:', courseTitle);
      
      // Try the new endpoint first
      const response = await axios.get(
        `https://edulearnbackend-ffiv.onrender.com/api/payment/course-details/${encodeURIComponent(courseTitle)}`
      );
      
      if (response.data.success) {
        console.log('✅ Course verified via new endpoint');
        return {
          verified: true,
          data: response.data.course
        };
      }
    } catch (error) {
      console.log('🟡 New endpoint failed, trying fallback...');
      
      // Fallback: Try to check if it's a hardcoded course
      if (isHardcodedCourse(courseTitle)) {
        console.log('✅ Course is in hardcoded list');
        return {
          verified: true,
          data: null // Will use frontend data
        };
      }
      
      // Last resort: Check available courses endpoint
      try {
        const availableResponse = await axios.get(
          'https://edulearnbackend-ffiv.onrender.com/api/payment/available-courses'
        );
        
        if (availableResponse.data.success) {
          const allCourses = availableResponse.data.courses || [];
          const courseExists = allCourses.some(course => 
            course.title.toLowerCase() === courseTitle.toLowerCase()
          );
          
          if (courseExists) {
            console.log('✅ Course found in available courses');
            return { verified: true, data: null };
          }
        }
      } catch (e) {
        console.error('Fallback verification failed:', e);
      }
    }
    
    return { verified: false, data: null };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('uploading');

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setUploadStatus('success');
        setIsUploaded(true);
      };
      reader.readAsDataURL(file);
    }, 1500);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setUploadedImage(null);
    setUploadStatus('idle');
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = 'payment-qr-code.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

// In your PaymentPage.jsx, replace the handleConfirmEnrollment function with this:

// In PaymentPage.jsx, simplify handleConfirmEnrollment:

const handleConfirmEnrollment = async () => {
  if (!isUploaded || !selectedFile) {
    alert('Please upload payment screenshot first');
    return;
  }

  setProcessing(true);

  try {
    // Get student email
    let studentEmail = '';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'student_email') {
        studentEmail = value;
        break;
      }
    }

    if (!studentEmail && location.state?.email) {
      studentEmail = location.state.email;
    }

    if (!studentEmail) {
      alert('Email not found. Please complete the registration process first.');
      setProcessing(false);
      return;
    }

    // Validate course data
    if (!courseData || !courseData.title || courseData.price === undefined) {
      alert('Course information is missing');
      setProcessing(false);
      return;
    }

    // Create FormData - send exact course title
    const formData = new FormData();
    formData.append('screenshot', selectedFile);
    formData.append('student_email', studentEmail);
    formData.append('course_track', courseData.title); // Exact title
    formData.append('amount', courseData.price.toString());

    console.log('🟡 Sending payment:', {
      course: courseData.title,
      price: courseData.price,
      email: studentEmail
    });

    // Make API call
    const response = await axios.post(
      'https://edulearnbackend-ffiv.onrender.com/api/payment/process',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      }
    );

    console.log('🟢 Payment response:', response.data);

    if (response.data.success) {
      setShowSuccess(true);
      
      // Store enrollment info
      localStorage.setItem('recentEnrollment', JSON.stringify({
        courseTitle: courseData.title,
        enrollmentDate: new Date().toISOString(),
        paymentId: response.data.payment_id,
        enrollmentId: response.data.enrollment_id
      }));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
      alert(`Payment failed: ${response.data.error || 'Unknown error'}`);
    }
    
  }  catch (error) {
  console.error('🔴 Payment error:', error);
  
  let errorMessage = 'Payment processing failed';
  let errorDetails = '';
  
  if (error.response) {
    console.log('🔴 Full error response:', error.response.data);
    console.log('🔴 Error status:', error.response.status);
    console.log('🔴 Error headers:', error.response.headers);
    
    errorMessage = error.response.data.error || `Server error: ${error.response.status}`;
    errorDetails = JSON.stringify(error.response.data, null, 2);
  } else if (error.request) {
    errorMessage = 'Cannot connect to server. Please check your internet connection.';
  } else {
    errorMessage = error.message;
  }
  
  alert(`Error: ${errorMessage}\n\n${errorDetails ? 'Details:\n' + errorDetails : ''}`);
  
} finally {
  setProcessing(false);
}
};

  // Animation Components (keep the same as before)
  const UploadAnimation = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <Upload className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
      </div>
      <p className="mt-4 text-blue-600 font-medium">Uploading your screenshot...</p>
    </div>
  );

  const SuccessAnimation = () => (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative">
        <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
      </div>
      <p className="mt-4 text-green-600 font-medium text-lg">Screenshot uploaded successfully!</p>
      <p className="text-gray-600 text-sm">Ready to confirm enrollment</p>
    </div>
  );

  const PaymentSuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="relative">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4 animate-bounce" />
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          You are now enrolled in:
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-800 font-semibold">{courseData?.title}</p>
          <p className="text-green-700 text-sm">₹{courseData?.price}</p>
        </div>
        <p className="text-gray-600 mb-6">
          Redirecting to dashboard in 3 seconds...
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Course Information Missing</h3>
          <p className="text-gray-600 mb-6">{error || 'Please select a course to continue'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/courses')}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Summary */}
        {courseData && <CourseSummary course={courseData} />}
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Enrollment</h1>
            <div className="w-28"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Scan the QR code to pay and upload your payment confirmation
            </p>
            <div className="mt-4 inline-flex items-center bg-blue-50 px-4 py-2 rounded-full">
              <span className="text-blue-700 font-semibold">
                Course: {courseData.title} • ₹{courseData.price}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {isHardcodedCourse(courseData.title) ? 
                'Original Course' : 'Newly Added Course'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* QR Code Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Scan to Pay</h2>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                <p className="text-gray-700">
                  Amount: <span className="font-bold text-2xl text-green-600">₹{courseData.price}</span>
                </p>
                <p className="text-gray-500 text-sm mt-1">One-time payment for course enrollment</p>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <img
                  src={qrCodeImage}
                  alt="Payment QR Code"
                  className="w-full max-w-xs mx-auto aspect-square object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiA2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlFSIENvZGUgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadQR}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download QR Code</span>
              </button>
            </div>

            {/* Payment Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Instructions
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">1.</span>
                  Open your UPI app (Google Pay, PhonePe, Paytm, etc.)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">2.</span>
                  Scan the QR code above
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">3.</span>
                  Pay <strong>₹{courseData.price}</strong> for the course
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">4.</span>
                  Take a screenshot of payment confirmation
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">5.</span>
                  Upload the screenshot on the right
                </li>
              </ul>
            </div>
          </div>

          {/* Screenshot Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Upload Payment Proof</h2>
              </div>
              <p className="text-gray-600">Upload screenshot of your payment confirmation</p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-colors hover:border-purple-400 hover:bg-purple-50/50">
              
              {uploadStatus === 'uploading' && <UploadAnimation />}
              
              {uploadStatus === 'success' && <SuccessAnimation />}
              
              {uploadStatus === 'idle' && (
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">Drag & drop your screenshot here</p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
                  >
                    Choose File
                  </button>
                  <p className="text-gray-400 text-sm mt-3">Supports: PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <div className="mt-6">
                  <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <img
                      src={uploadedImage}
                      alt="Uploaded payment proof"
                      className="w-full max-w-xs mx-auto rounded-lg shadow-sm"
                    />
                    <div className="mt-3 flex justify-center space-x-3">
                      <button
                        onClick={handleRemoveImage}
                        className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Status Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 text-sm">
                <strong>Course:</strong> {courseData.title}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Amount:</strong> ₹{courseData.price}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Status:</strong> {
                  isHardcodedCourse(courseData.title) ? 
                  'Available for enrollment' : 
                  'New course - enrollment pending verification'
                }
              </p>
            </div>

            {/* Confirm Enrollment Button */}
            <button
              onClick={handleConfirmEnrollment}
              disabled={!isUploaded || processing || !courseData}
              className="w-full mt-8 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg shadow-green-500/25"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Enrollment...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-6 w-6" />
                  <span>
                    {!courseData ? 'Course Missing' : 
                     !isUploaded ? 'Upload Screenshot to Continue' : 
                     'Confirm Enrollment'}
                  </span>
                </>
              )}
            </button>

            {/* Status Message */}
            {isUploaded && !processing && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-center font-medium">
                  ✅ Payment proof uploaded! Click above to confirm your enrollment in "{courseData.title}".
                </p>
              </div>
            )}
            
            {/* Important Note for New Courses */}
            {!isHardcodedCourse(courseData.title) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This is a newly added course. If you encounter any issues with enrollment, 
                  please contact the admin for manual enrollment assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && <PaymentSuccessModal />}
    </div>
  );
};

export default PaymentPage;