// components/PaymentPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null); // ✅ Store the file separately
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [isUploaded, setIsUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const qrCodeImage = "/QR.jpg";

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

    setSelectedFile(file); // ✅ Store the file
    setUploadStatus('uploading');

    // Simulate upload process
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
    setSelectedFile(null); // ✅ Clear the stored file
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

  const handleConfirmEnrollment = async () => {
    if (!isUploaded || !selectedFile) { // ✅ Use selectedFile instead of fileInputRef
      alert('Please upload payment screenshot first');
      return;
    }

    setProcessing(true);

    try {
      // Get student email from cookie
      const cookies = document.cookie.split(';');
      let studentEmail = '';
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'student_email') {
          studentEmail = value;
          break;
        }
      }

      if (!studentEmail) {
        alert('Please complete the registration process first');
        navigate('/personal-form');
        return;
      }

      // Get course track - you might want to store this from previous forms
      const courseTrack = "Web Development"; // Update this dynamically

      // Create FormData to send the image
      const formData = new FormData();
      formData.append('screenshot', selectedFile); // ✅ Use selectedFile
      formData.append('student_email', studentEmail);
      formData.append('course_track', courseTrack);
      formData.append('amount', '499');

      console.log('🟡 Sending payment data to backend...');
      console.log('🟡 File:', selectedFile.name);
      console.log('🟡 Email:', studentEmail);
      console.log('🟡 Course:', courseTrack);

      const response = await axios.post('https://edulearnbackend-ffiv.onrender.com/api/payment/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('🟢 Payment response:', response.data);

      if (response.data.success) {
        setShowSuccess(true);
        // Auto navigate after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('🔴 Error processing payment:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        alert('Network error: Could not connect to server.');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Animation Components
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
        <p className="text-gray-600 mb-6">
          Your payment has been verified successfully. You are now enrolled in the course!
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 text-sm">
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/course-form')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course Details
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Enrollment</h1>
            <div className="w-28"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Scan the QR code to pay and upload your payment confirmation for the course 
            </p>
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
              <div className="bg-gradient to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                <p className="text-gray-700">
                  Amount: <span className="font-bold text-2xl text-green-600"></span>
                </p>
                <p className="text-gray-500 text-sm mt-1">One-time payment</p>
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
                  Pay the amount of course
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

            {/* Confirm Enrollment Button */}
            <button
              onClick={handleConfirmEnrollment}
              disabled={!isUploaded || processing}
              className="w-full mt-8 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg shadow-green-500/25"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-6 w-6" />
                  <span>{isUploaded ? 'Confirm Enrollment' : 'Upload Screenshot to Continue'}</span>
                </>
              )}
            </button>

            {/* Status Message */}
            {isUploaded && !processing && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-center font-medium">
                  ✅ Payment proof uploaded! Click above to confirm your enrollment.
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