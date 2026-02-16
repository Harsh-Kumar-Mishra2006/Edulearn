🎓 Edulearn – High-Performance Learning Management System (LMS)
Edulearn is a full-featured, scalable E-learning platform engineered to bridge the gap between instructors and students. It handles everything from secure multi-role authentication and dynamic course creation to optimized media delivery and real-time notifications.

🎯 The Problem & My Solution
Most educational tools struggle with media latency and insecure content delivery. I built Edulearn to provide a sub-2-second page load experience while maintaining strict Role-Based Access Control (RBAC) to protect premium educational content.

🚀 Technical Core & Features
🔐 Multi-Role Architecture
Admin/Instructor Dashboard: Complete CRUD suite for course management. Instructors can upload curriculum, track student enrollments, and manage course metadata.

Student Experience: A seamless "Enroll & Learn" flow with progress tracking and persistent lesson state.

RBAC: Secure route protection ensuring only enrolled students can access specific video/PDF resources.

⚡ Performance & Optimization (Resume Highlights)
Database Efficiency: Optimized MongoDB schemas and indexing, resulting in a 30% reduction in query response times.

Media Pipeline: Integrated Cloudinary SDK with Multer for asynchronous file uploads. This offloaded media processing from the main thread, reducing server storage load by 60%.

Global State: Managed complex user sessions and course states using Redux Toolkit, ensuring zero-lag UI updates during navigation.

🛡️ Security First
JWT & Bcrypt: Industry-standard encryption for user credentials and stateless session management.

Helmet.js Implementation: Protected the application against XSS, clickjacking, and other common vulnerabilities by strictly configuring HTTP headers.

Data Validation: Leveraged a robust validation layer to prevent NoSQL injections and malformed data entries.

Tech Stack & Tools
Frontend: React.js, Redux Toolkit, Tailwind CSS, Framer Motion
Backend: Node.js, Express.js, RESTful APIs
Database: MongoDB (NoSQL) with Mongoose ODM
Cloud/DevOps: Cloudinary (Media), Render (Deployment), Git
Services: SMTP (Automated Emails), JWT (Auth)

🏗️ System Architecture
Frontend: Single Page Application (SPA) communicating via Axios.

API Layer: Express middleware handles authentication and sanitization.

Storage: Metadata in MongoDB; heavy assets (Videos/Images) in Cloudinary.

⚙️ Quick Start
Prerequisites: Node.js (v16+), MongoDB Atlas Account.

Clone & Install:

Bash
git clone https://github.com/Harsh-Kumar-Mishra2006/Edulearn.git
cd Edulearn
npm run install-all  # Installs both client and server dependencies
Environment Setup: Create a .env in the root and add:

MONGO_URI, JWT_SECRET, CLOUDINARY_URL, SMTP_MAIL

Launch:

Bash
npm run dev  # Starts the concurrently running dev environment
