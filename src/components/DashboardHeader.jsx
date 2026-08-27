import React from 'react';

export default function DashboardHeader({
  currentUser,
  isOnline,
  selectedStaff,
  setSelectedStaff,
  filterMode,
  setFilterMode,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setShowPasswordModal,
  handleLogout,
  staffDataMap = {},
  salesData = [],
  expenseData = []
}) {
  // শুধু 'কাউন্টার স্টাফ' ক্যাটাগরির স্টাফদের ফিল্টার করে লিস্ট প্রস্তুত করার লজিক
  const activeStaffList = React.useMemo(() => {
    const staffMapSet = new Map();

    // ১. staffDataMap থেকে শুধুমাত্র 'কাউন্টার স্টাফ' ক্যাটাগরির স্টাফদের যুক্ত করা
    Object.values(staffDataMap).forEach(staff => {
      if (staff.email && staff.email !== 'admin@aj.com' && staff.role !== 'ADMIN') {
        const category = (staff.category || '').toLowerCase();
        // বাংলা অথবা ইংরেজি বা আংশিক নামের মিল চেক করা যাতে ক্যাটাগরি মিস না হয়
        if (
          category.includes('কাউন্টার') || 
          category.includes('counter') || 
          category === 'টিকেট বিক্রেতা' ||
          !staff.category // যদি ক্যাটাগরি ফিল্ড খালি থাকে কিন্তু কাউন্টার স্টাফ হয়
        ) {
          staffMapSet.set(staff.email, staff.name || staff.email);
        }
      }
    });

    // ২. salesData বা expenseData থেকে যদি কাউন্টার স্টাফদের ইমেইল থাকে এবং তা staffDataMap-এ কাউন্টার হিসেবে চিহ্নিত থাকে
    salesData.forEach(s => {
      const email = s.staffEmail || s.email;
      const name = s.staffName || s.name;
      if (email && !staffMapSet.has(email) && email !== 'admin@aj.com') {
        const staffInfo = staffDataMap[email];
        const category = (staffInfo?.category || '').toLowerCase();
        if (
          !staffInfo || 
          category.includes('কাউন্টার') || 
          category.includes('counter') || 
          category === 'টিকেট বিক্রেতা' || 
          !staffInfo.category
        ) {
          staffMapSet.set(email, name || staffInfo?.name || email);
        }
      }
    });

    return Array.from(staffMapSet.entries()).map(([email, name]) => ({ email, name }));
  }, [salesData, expenseData, staffDataMap]);

  return (
    <div style={{ background: '#0B2A55', padding: '20px', borderRadius: '16px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
      
      {/* লোগো ও হেডার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="https://i.postimg.cc/9MnZNrQ6/AJ-Enterprise-LOGO.png" 
            alt="AJ Enterprise Logo" 
            style={{ height: '45px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '8px' }} 
          />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#fff' }}>
            AJ Enterprise (এজে এন্টারপ্রাইজ)
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isOnline ? '#22c55e' : '#ef4444' }} title={isOnline ? 'অনলাইন' : 'অফলাইন'} />
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fbbf24' }}>
              {currentUser?.name || 'ব্যবহারকারী'} ({currentUser?.role || 'STAFF'})
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{currentUser?.email}</span>
          </div>
        </div>
      </div>

      {/* ফিল্টার অপশন */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {currentUser?.role === 'ADMIN' && (
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>স্টাফ ফিল্টার (সক্রিয়)</label>
              <select 
                value={selectedStaff} 
                onChange={e => setSelectedStaff(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                <option value="all">সকল স্টাফ (সবাই)</option>
                {activeStaffList.map((staff) => (
                  <option key={staff.email} value={staff.email}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>রিপোর্টের ধরন</label>
            <select 
              value={filterMode} 
              onChange={e => setFilterMode(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              <option value="monthly">মাসিক রিপোর্ট</option>
              <option value="daily">দৈনিক রিপোর্ট</option>
              <option value="statement">তারিখ থেকে তারিখ (স্ট্যান্ডার্ড স্টেটমেন্ট)</option>
            </select>
          </div>

          {filterMode === 'daily' && (
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>তারিখ নির্বাচন</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
              />
            </div>
          )}

          {filterMode === 'monthly' && (
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>মাস নির্বাচন</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
              />
            </div>
          )}

          {filterMode === 'statement' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>শুরু তারিখ</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>শেষ তারিখ</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* শুধুমাত্র ADMIN হলেই পাসওয়ার্ড পরিবর্তনের বাটনটি দেখাবে */}
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setShowPasswordModal(true)} 
              style={{ padding: '8px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              🔐 পাসওয়ার্ড পরিবর্তন
            </button>
          )}

          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            🚪 লগআউট
          </button>
        </div>
      </div>

    </div>
  );
}