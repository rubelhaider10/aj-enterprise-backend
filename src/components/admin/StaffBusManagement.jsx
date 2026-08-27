import React from 'react';

export default function StaffBusManagement({
  activeTab,
  handleAddStaff,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  newCategory,
  setNewCategory,
  newBranch,
  setNewBranch,
  countersList,
  newBuses,
  setNewBuses,
  isAddingStaff,
  selectedStaffEmail,
  setSelectedStaffEmail,
  activeStaffs,
  staffDataMap,
  editCategory,
  setEditCategory,
  editBranch,
  setEditBranch,
  editBasicSalary,
  setEditBasicSalary,
  editAdvanceSalary,
  setEditAdvanceSalary,
  editPassword,
  setEditPassword,
  editBuses,
  setEditBuses,
  handleUpdateStaff,
  isUpdatingStaff,
  isChangingPassword,
  handleDeleteStaff
}) {
  return (
    <>
      {activeTab === 'staff' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                ➕ নতুন স্টাফ বা ম্যানেজার যোগ করুন
              </h3>
              <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>স্টাফের নাম</label>
                  <input type="text" placeholder="যেমন: রহিম" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>স্টাফের ইমেইল (লগইন আইডি)</label>
                  <input type="email" placeholder="staff@aj.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>পাসওয়ার্ড</label>
                  <input type="password" placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>স্টাফ ক্যাটাগরি</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required>
                    <option value="counter" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>কাউন্টার স্টাফ</option>
                    <option value="general" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>জেনারেল স্টাফ</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>মূল কাউন্টার নির্ধারণ</label>
                  <select value={newBranch} onChange={e => setNewBranch(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required>
                    {countersList.map(c => <option key={c} value={c} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{c}</option>)}
                  </select>
                </div>
                {newCategory.toLowerCase() === 'counter' && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>বাসসমূহের তালিকা (কমা দিয়ে)</label>
                    <input type="text" placeholder="বাস ১, বাস ২" value={newBuses} onChange={e => setNewBuses(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required={newCategory.toLowerCase() === 'counter'} />
                  </div>
                )}
                <button type="submit" disabled={isAddingStaff} style={{ width: '100%', padding: '12px', backgroundColor: isAddingStaff ? '#64748b' : '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: isAddingStaff ? 'not-allowed' : 'pointer' }}>
                  {isAddingStaff ? 'জমা হচ্ছে...' : 'নতুন স্টাফ যুক্ত করুন'}
                </button>
              </form>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                ✏️ স্টাফ এডিট ও কাউন্টার/পাসওয়ার্ড পরিবর্তন
              </h3>
              <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>স্টাফ সিলেক্ট করুন</label>
                  <select value={selectedStaffEmail} onChange={e => setSelectedStaffEmail(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required>
                    <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>-- কাউন্টার/ব্রাঞ্চ অনুযায়ী স্টাফ সিলেক্ট করুন --</option>
                    {(() => {
                      const matchedStaffEmails = new Set();
                      const result = countersList.map(counter => {
                        const staffInCounter = activeStaffs.filter(email => {
                          const staffBranch = (staffDataMap[email]?.branch || '').trim().toLowerCase();
                          return staffBranch === counter.trim().toLowerCase();
                        });
                        staffInCounter.forEach(email => matchedStaffEmails.add(email));
                        if (staffInCounter.length === 0) return null;
                        return (
                          <optgroup key={counter} label={`📍 ${counter}`} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                            {staffInCounter.map(email => (
                              <option key={email} value={email} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                                {staffDataMap[email]?.name || email} ({email})
                              </option>
                            ))}
                          </optgroup>
                        );
                      });

                      const unassignedStaffs = activeStaffs.filter(email => !matchedStaffEmails.has(email));
                      if (unassignedStaffs.length > 0) {
                        result.push(
                          <optgroup key="unassigned" label="📍 অন্যান্য / আনলિસ્টেড ব্রাঞ্চ" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                            {unassignedStaffs.map(email => (
                              <option key={email} value={email} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                                {staffDataMap[email]?.name || email} ({email}) [{staffDataMap[email]?.branch || 'ব্রাঞ্চ নেই'}]
                              </option>
                            ))}
                          </optgroup>
                        );
                      }
                      return result;
                    })()}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>স্টাফ ক্যাটাগরি</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required>
                    <option value="counter" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>কাউন্টার স্টাফ</option>
                    <option value="general" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>জেনারেল স্টাফ</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>মূল কাউন্টার</label>
                  <select value={editBranch} onChange={e => setEditBranch(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} required>
                    {countersList.map(c => <option key={c} value={c} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>মূল বেতন (৳)</label>
                    <input type="number" value={editBasicSalary} onChange={e => setEditBasicSalary(e.target.value)} onWheel={(e) => e.target.blur()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>অগ্রিম বেতন (৳)</label>
                    <input type="number" value={editAdvanceSalary} onChange={e => setEditAdvanceSalary(e.target.value)} onWheel={(e) => e.target.blur()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>🔑 নতুন পাসওয়ার্ড সেট করুন (ঐচ্ছিক)</label>
                  <input type="password" placeholder="পাসওয়ার্ড পরিবর্তন করতে চাইলে নতুন পাসওয়ার্ড লিখুন" value={editPassword} onChange={e => setEditPassword(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} />
                </div>
                {editCategory.toLowerCase() === 'counter' && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>বাসের তালিকা</label>
                    <textarea rows={2} value={editBuses} onChange={e => setEditBuses(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={isUpdatingStaff || isChangingPassword} style={{ flex: 1, padding: '12px', backgroundColor: (isUpdatingStaff || isChangingPassword) ? '#64748b' : '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: (isUpdatingStaff || isChangingPassword) ? 'not-allowed' : 'pointer' }}>
                    {(isUpdatingStaff || isChangingPassword) ? 'জমা হচ্ছে...' : 'আপডেট করুন'}
                  </button>
                  <button type="button" onClick={handleDeleteStaff} style={{ padding: '12px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    রিসাইকেল বিনে পাঠান
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}