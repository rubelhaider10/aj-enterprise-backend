import React from 'react';

export default function AdminDashboard({
  staffDataMap = {},
  newStaffEmail,
  setNewStaffEmail,
  newStaffName,
  setNewStaffName,
  newStaffPassword,
  setNewStaffPassword,
  newStaffCategory,
  setNewStaffCategory,
  newStaffBuses,
  setNewStaffBuses,
  editingStaffEmail,
  setEditingStaffEmail,
  handleSaveStaffConfig,
  handleEditStaff,
  handleDeleteStaff,
  handleCashCorrection, // ক্যাশ কারেকশনের জন্য অতিরিক্ত অপশন (ঐচ্ছিক)
  currentUser
}) {
  if (currentUser?.role !== 'ADMIN') return null;

  // ১. staffDataMap প্রপস খালি বা undefined থাকলে সেফটি চেক
  const safeStaffMap = staffDataMap || {};

  return (
    <div style={{ marginTop: '35px', backgroundColor: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '19px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
        ⚙️ অ্যাডমিন প্যানেল: স্টাফ ও বাস ম্যানেজমেন্ট[cite: 32]
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* ফর্ম সেকশন */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>
            {editingStaffEmail ? `✏️ স্টাফ এডিট করুন (${editingStaffEmail})` : '➕ নতুন স্টাফ ও পাসওয়ার্ড যোগ করুন'}
          </h4>
          <form onSubmit={handleSaveStaffConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>স্টাফ ইমেইল (ইউনিক আইডি)</label>
              <input 
                type="email" 
                placeholder="staff@aj.com" 
                value={newStaffEmail} 
                onChange={e => setNewStaffEmail(e.target.value)} 
                disabled={!!editingStaffEmail} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none', backgroundColor: editingStaffEmail ? '#e2e8f0' : '#fff' }} 
                required 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>স্টাফের নাম</label>
              <input 
                type="text" 
                placeholder="নাম লিখুন" 
                value={newStaffName} 
                onChange={e => setNewStaffName(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                required 
              />
            </div>
            {!editingStaffEmail && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>পাসওয়ার্ড</label>
                <input 
                  type="password" 
                  placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড" 
                  value={newStaffPassword} 
                  onChange={e => setNewStaffPassword(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                  required 
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>স্টাফ ক্যাটাগরি</label>
              <select 
                value={newStaffCategory} 
                onChange={e => setNewStaffCategory(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="counter">কাউন্টার স্টাফ</option>
                <option value="general">সাধারণ</option>
              </select>
            </div>
            {((newStaffCategory || '').toLowerCase() === 'counter' || newStaffCategory === 'টিকেট বিক্রেতা') && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>বাসসমূহের তালিকা (কমা দিয়ে আলাদা করুন)</label>
                <textarea 
                  placeholder="যেমন: হানিফ পরিবহন, শ্যামলী এস এস" 
                  value={newStaffBuses} 
                  onChange={e => setNewStaffBuses(e.target.value)} 
                  rows="3" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: "'Hind Siliguri', sans-serif" }} 
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ flex: 1, padding: '11px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>
                {editingStaffEmail ? 'স্টাফ তথ্য আপডেট করুন' : 'স্টাফ একাউন্ট তৈরি ও সেভ করুন'}
              </button>
              {editingStaffEmail && (
                <button type="button" onClick={() => { setEditingStaffEmail(null); setNewStaffEmail(''); setNewStaffName(''); setNewStaffCategory('counter'); setNewStaffBuses(''); }} style={{ padding: '11px 14px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* স্টাফ তালিকা, বিক্রয় হিসাব ও কারেকশন অপশন সেকশন */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>👥 বর্তমান স্টাফ ও তাদের বিক্রয় হিসাব</h4>
          <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(safeStaffMap).length === 0 ? (
              <div style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>কোনো স্টাফের ডাটা পাওয়া যায়নি।</div>
            ) : (
              Object.entries(safeStaffMap)
                .filter(([email, info]) => email !== 'admin@aj.com' && info?.role !== 'ADMIN' && !info?.isDeleted)
                .map(([email, info]) => {
                  // ২. ক্যাটাগরি চেক করার সময় toLowerCase() ব্যবহার করে অমিল দূর করা হয়েছে
                  const categoryStr = (info?.category || '').toLowerCase();
                  const isCounter = categoryStr === 'counter' || categoryStr === 'টিকেট বিক্রেতা' || categoryStr === '';

                  return (
                    <div key={email} style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <b style={{ fontSize: '13px', color: '#0f172a' }}>{info?.name || 'নামহীন স্টাফ'}</b>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({email})</span>
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div>
                            <b>ক্যাটাগরি:</b> <span style={{ color: !isCounter ? '#d97706' : '#16a34a', fontWeight: '600' }}>{!isCounter ? 'সাধারণ' : 'কাউন্টার স্টাফ'}</span>
                          </div>
                          {info?.branch && (
                            <div>
                              <b>ব্রাঞ্চ:</b> {info.branch}
                            </div>
                          )}
                          {isCounter && (
                            <div>
                              <b>বাসসমূহ:</b> {info?.buses && info.buses.length > 0 ? info.buses.join(', ') : 'কোনো বাস নেই'}
                            </div>
                          )}
                          
                          {/* ৩. কাউন্টার স্টাফের টিকিট বিক্রি ও কালেকশনের হিসাব প্রদর্শন */}
                          {isCounter && (
                            <div style={{ background: '#f1f5f9', padding: '6px 8px', borderRadius: '6px', marginTop: '4px', fontSize: '11px', color: '#334155' }}>
                              <div>🎫 মোট টিকিট বিক্রি: <b>{info?.totalTicketsSold || 0} টি</b></div>
                              <div>💰 মোট কালেকশন: <b>৳ {info?.totalCollection || 0}</b></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* কারেকশন ও ম্যানেজমেন্ট অপশন (এডিট, ক্যাশ কারেকশন, ডিলিট) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '10px' }}>
                        <button 
                          onClick={() => handleEditStaff(email, info)} 
                          style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        >
                          এডিট
                        </button>
                        {handleCashCorrection && isCounter && (
                          <button 
                            onClick={() => handleCashCorrection(email, info)} 
                            style={{ background: '#fef3c7', color: '#b45309', border: 'none', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                          >
                            ক্যাশ কারেকশন
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteStaff(email)} 
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}