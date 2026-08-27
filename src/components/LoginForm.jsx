import React, { useState, useEffect } from 'react';

const LoginForm = ({ emailInput, setEmailInput, passwordInput, setPasswordInput, handleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Remix Icon CDN ডাইনামিকালি লোড করা হচ্ছে
  useEffect(() => {
    const linkId = 'remix-icon-cdn';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      {/* কম্পোনেন্ট-নির্দিষ্ট সিএসএস স্টাইল */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Hind+Siliguri:wght@400;600;700&display=swap');

        .glass-login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          /* সুন্দর আধুনিক বিলাসীবাসের ব্যাকগ্রাউন্ড ছবি */
          background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.65)), 
                      url('https://i.postimg.cc/J0dGsXMq/cinematic-style-mall.jpg') no-repeat center center/cover;
          font-family: 'Poppins', 'Hind Siliguri', sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        .glass-card {
          width: 100%;
          max-width: 400px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          padding: 35px 30px;
          color: #ffffff;
        }

        .glass-card .logo-area {
          text-align: center;
          margin-bottom: 22px;
        }

        /* কোম্পানির লোগো স্পষ্টভাবে দেখানোর জন্য হোয়াইট কন্টেইনার */
        .glass-card .logo-area .company-logo-box {
          background: #ffffff;
          padding: 8px 16px;
          border-radius: 16px;
          display: inline-block;
          margin-bottom: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .glass-card .logo-area .company-logo-box img {
          height: 60px;
          object-fit: contain;
          display: block;
        }

        .glass-card h2 {
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          color: #ffffff;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .glass-card p.subtitle {
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 22px;
        }

        .input-box {
          position: relative;
          width: 100%;
          height: 52px;
          margin-bottom: 20px;
        }

        .input-box input {
          background: rgba(255, 255, 255, 0.08);
          width: 100%;
          height: 100%;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 30px;
          padding: 10px 45px 10px 20px;
          font-size: 15px;
          color: #ffffff;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .input-box input:focus {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
        }

        .input-box input::placeholder {
          color: rgba(255, 255, 255, 0.65);
          font-size: 14px;
        }

        .input-box i {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          font-size: 19px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
        }

        .remember-forgot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -5px;
          margin-bottom: 22px;
          font-size: 13px;
        }

        .remember-forgot label {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
        }

        .remember-forgot input[type="checkbox"] {
          accent-color: #2563eb;
          margin-right: 6px;
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .admin-reset-info {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-align: right;
          margin: 0;
        }

        .submit-btn {
          display: block;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          width: 100%;
          border-radius: 30px;
          font-size: 16px;
          height: 48px;
          font-weight: 600;
          text-align: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
        }

        .social-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 22px;
          font-size: 14px;
        }

        .social-buttons a {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s ease;
        }

        .social-buttons a:hover {
          color: #ffffff;
          opacity: 1;
        }

        input::-webkit-credentials-auto-fill-button,
        input::-webkit-clear-button {
          display: none !important;
        }
      `}</style>

      {/* প্রধান লগইন কন্টেইনার */}
      <div className="glass-login-container">
        <div className="glass-card">
          <form onSubmit={handleLogin}>
            
            {/* লোগো এবং হেডার */}
            <div className="logo-area">
              <div className="company-logo-box">
                <img 
                  src="https://i.postimg.cc/WbLRv3MK/Final-LOGO-001.png" 
                  alt="AJ Enterprise Logo" 
                />
              </div>
              <h2>AJ Enterprise</h2>
              <p className="subtitle">আপনার অ্যাকাউন্টে লগইন করুন</p>
            </div>

            {/* ইমেইল ইনপুট */}
            <div className="input-box">
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                placeholder="EMAIL" 
                required 
              />
              <i className="ri-mail-fill"></i>
            </div>

            {/* পাসওয়ার্ড ইনপুট */}
            <div className="input-box">
              <input 
                type={showPassword ? "text" : "password"} 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="password" 
                required 
                autoComplete="current-password"
              />
              <i 
                className={showPassword ? "ri-eye-fill" : "ri-eye-off-fill"} 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              ></i>
            </div>

            {/* রিমেম্বার মি এবং পাসওয়ার্ড পরিবর্তন সংক্রান্ত তথ্য */}
            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <p className="admin-reset-info">
                🔒 পাসওয়ার্ড কেবল অ্যাডমিন রিসেট করতে পারবেন
              </p>
            </div>

            {/* সাবমিট বাটন */}
            <button type="submit" className="submit-btn">
              লগইন করুন
            </button>

            {/* সোশ্যাল লিংক */}
            <div className="social-buttons">
              <a href="#google">
                <i className="ri-google-fill"></i> Google
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <a href="#facebook">
                <i className="ri-facebook-fill"></i> Facebook
              </a>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;