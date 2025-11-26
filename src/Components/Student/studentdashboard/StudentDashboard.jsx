// pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Download, Award, FileText, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        const email = user.email || user.user?.email;

        if (!email || !token) {
          alert('Please login first');
          setLoading(false);
          return;
        }

        const res = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/certificates/student/${email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (data.success) {
          setCertificates(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const downloadCertificate = async (id, filename) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://edulearnbackend-ffiv.onrender.com/api/certificates/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'certificate.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Download failed');
      }
    } catch (err) {
      alert('Error downloading certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-5xl font-bold text-gray-800 mb-4">Your Certificates</h1>
        <p className="text-xl text-gray-600 mb-12">Download all certificates issued to you</p>

        {loading ? (
          <div className="py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-2xl text-gray-600">Loading your certificates...</p>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-10 text-white">
                  <Award className="h-20 w-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">{cert.course_title}</h3>
                  <p className="text-sm mt-2 opacity-90">
                    Issued: {new Date(cert.issue_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-8 space-y-4 bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Certificate ID</p>
                    <p className="font-mono text-sm bg-gray-200 px-3 py-1 rounded mt-1">
                      {cert.certificate_id}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadCertificate(cert._id, cert.certificate_file?.originalName)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-emerald-700 transition shadow-xl flex items-center justify-center gap-3"
                  >
                    <Download className="h-7 w-7" />
                    Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <AlertCircle className="h-24 w-24 text-orange-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-700">No Certificates Found</h2>
            <p className="text-xl text-gray-600 mt-4">
              Admin hasn't uploaded any certificate for you yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;