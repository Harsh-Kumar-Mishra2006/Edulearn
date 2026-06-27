import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle,
  Calendar,
  Mail,
  User,
  Shield
} from 'lucide-react';

const API_BASE_URL = 'https://edulearnbackend-ffiv.onrender.com/api';

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, issued: 0, revoked: 0 });
  const [user, setUser] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    student_email: '',
    course_title: '',
    completion_date: new Date().toISOString().split('T')[0],
    certificate_file: null
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const currentUser = userData ? JSON.parse(userData) : null;
    setUser(currentUser);
    
    if (currentUser) {
      loadCertificates();
      loadStats();
    }
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/certificates`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCertificates(data.success ? data.data || [] : []);
    } catch (err) {
      console.error('Load error:', err);
      alert('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data.data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.student_email || !uploadForm.course_title || !uploadForm.certificate_file) {
      alert('Please fill all fields and select a file');
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('student_email', uploadForm.student_email);
    formData.append('course_title', uploadForm.course_title);
    formData.append('completion_date', uploadForm.completion_date);
    formData.append('certificate_file', uploadForm.certificate_file);

    try {
      const res = await fetch(`${API_BASE_URL}/certificates/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      console.log('Upload response:', result);
      
      if (!res.ok) {
        alert(result.error || 'Upload failed');
        return;
      }

      alert('✅ Certificate uploaded successfully!');
      setUploadForm({
        student_email: '',
        course_title: '',
        completion_date: new Date().toISOString().split('T')[0],
        certificate_file: null
      });
      document.getElementById('certificate-file').value = '';
      loadCertificates();
      loadStats();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (!valid) {
      alert('Only PDF, JPG, PNG allowed');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large (max 10MB)');
      e.target.value = '';
      return;
    }
    setUploadForm({ ...uploadForm, certificate_file: file });
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}/download`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'certificate.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}/revoke`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin request' })
      });
      if (res.ok) {
        alert('✅ Revoked successfully');
        loadCertificates();
        loadStats();
      } else {
        const data = await res.json();
        alert(data.error || 'Revoke failed');
      }
    } catch (err) {
      alert('Failed to revoke: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Login Required</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-600 mt-2">Upload & manage student certificates</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Issued</p>
                <p className="text-3xl font-bold text-green-600">{stats.issued}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revoked</p>
                <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Upload className="h-6 w-6" /> Upload Certificate
            </h2>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Mail className="h-4 w-4" /> Student Email
                </label>
                <input
                  type="email"
                  required
                  value={uploadForm.student_email}
                  onChange={e => setUploadForm({ ...uploadForm, student_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.course_title}
                  onChange={e => setUploadForm({ ...uploadForm, course_title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Full Stack Web Development"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Calendar className="h-4 w-4" /> Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={uploadForm.completion_date}
                  onChange={e => setUploadForm({ ...uploadForm, completion_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Certificate File</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${uploadForm.certificate_file ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="certificate-file"
                  />
                  <label htmlFor="certificate-file" className="cursor-pointer block">
                    {uploadForm.certificate_file ? (
                      <div>
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="font-medium text-green-700">{uploadForm.certificate_file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(uploadForm.certificate_file.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading || !uploadForm.certificate_file}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {uploadLoading ? 'Uploading...' : 'Upload Certificate'}
              </button>
            </form>
          </div>

          {/* Certificate List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Certificates ({certificates.length})</h2>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : certificates.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p>No certificates uploaded yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {certificates.map(cert => (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{cert.student_name || cert.student_email}</div>
                              <div className="text-sm text-gray-500">{cert.student_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{cert.course_title}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cert.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDownload(cert._id, cert.certificate_file?.originalName)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            Download
                          </button>
                          {cert.status === 'issued' && (
                            <button
                              onClick={() => handleRevoke(cert._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateManagement;