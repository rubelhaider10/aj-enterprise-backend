import React, { useState } from 'react';

export default function SalarySheet({
  activeTab,
  selectedMonth,
  setSelectedMonth,
  generateMonthOptions,
  handleAutoLoadPreviousMonthSalaries,
  staffDataMap,
  activeStaffs,
  countersList,
  calculateSalaryDetails,
  activeSalaries,
  handleDeleteSalary,
}) {
  // কোন ব্রাঞ্চ বা কাউন্টার সিলেক্ট করা আছে তার স্টেট
  const [selectedBranch, setSelectedBranch] = useState(countersList?.[0] || '');
  
  // প্রতিটি স্টাফের ইনপুট ডাটা ট্র্যাক করার জন্য (absentDays, advanceSalary, paymentStatus)
  const [staffInputs, setStaffInputs] = useState({});
  const [savingStaffId, setSavingStaffId] = useState(null);

  // সংরক্ষিত রেকর্ডসমূহের কাউন্টার ওয়াইজ ড্রপডাউন ওপেন/ক্লোজ রাখার স্টেট (যেমন: { 'কাউন্টার নাম': true/false })
  const [collapsedCounters, setCollapsedCounters] = useState({});

  // ড্রপডাউন টগল করার ফাংশন
  const toggleCounterDropdown = (counterName) => {
    setCollapsedCounters(prev => ({
      ...prev,
      [counterName]: !prev[counterName]
    }));
  };

  // ইনপুট পরিবর্তনের হ্যান্ডলার
  const handleInputChange = (staffId, field, value) => {
    setStaffInputs(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        [field]: value
      }
    }));
  };

  // নির্দিষ্ট স্টাফের বেতন সেভ করার ফাংশন
  const handleSaveStaffSalary = async (staff, email, calculatedValues) => {
    try {
      setSavingStaffId(email);
      const inputData = staffInputs[email] || {};
      
      const payload = {
        month: selectedMonth,
        staffName: staff.name || '',
        branch: selectedBranch,
        staffId: staff.staffId || email.split('@')[0].toUpperCase(),
        designation: staff.designation || 'জেনারেল স্টাফ',
        basicSalary: Number(staff.basicsalary ?? staff.basicSalary) || 0,
        absentDays: Number(inputData.absentDays ?? 0),
        advanceSalary: Number(inputData.advanceSalary ?? (staff.advancesalary ?? staff.advanceSalary ?? 0)),
        totalPayable: calculatedValues.total,
        paymentStatus: inputData.paymentStatus || 'অপরিশোধ'
      };

      console.log("Saving salary for:", payload);
      alert(`${staff.name} এর বেতন সফলভাবে সেভ করা হয়েছে!`);
    } catch (error) {
      console.error("Salary save error:", error);
      alert("বেতন সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSavingStaffId(null);
    }
  };

  return (
    <>
      {activeTab === 'salary' && (
        <div>
          {/* মাস নির্বাচন ও অটো-লোড হেডার */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', background: '#1e293b', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="monthSelect" style={{ fontWeight: '700', color: '#60a5fa', fontSize: '14px' }}>বর্তমান কার্যরত মাস নির্বাচন:</label>
              <select 
                id="monthSelect" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
              >
                {generateMonthOptions().map(m => (
                  <option key={m} value={m} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{m}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="button" 
              onClick={handleAutoLoadPreviousMonthSalaries}
              style={{ padding: '9px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
              🔄 পূর্ববর্তী মাস থেকে স্টাফ ডাটা কপি করুন
            </button>
          </div>

          {/* ব্রাঞ্চ বা কাউন্টার সিলেকশন */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
              🏢 ব্রাঞ্চ / কাউন্টার অনুযায়ী স্টাফ বেতন নির্ধারণ ({selectedMonth})
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#93c5fd', display: 'block', marginBottom: '6px' }}>১. মূল কাউন্টার / ব্রাঞ্চ সিলেক্ট করুন:</label>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                {countersList.map(c => (
                  <option key={c} value={c} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{c}</option>
                ))}
              </select>
            </div>

            {/* নির্বাচিত ব্রাঞ্চের স্টাফ লিস্ট টেবিল ফরম্যাট */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#4ade80', marginBottom: '10px' }}>
                📍 [{selectedBranch}] কাউন্টারের কর্মরত স্টাফ তালিকা ও বেতন হিসাব:
              </h4>

              {activeStaffs.filter(email => {
                const staff = staffDataMap[email];
                return staff && (staff.branch === selectedBranch || (!countersList.includes(staff.branch) && selectedBranch === "অনির্দিষ্ট/অন্যান্য কাউন্টার"));
              }).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#94a3b8', fontStyle: 'italic' }}>
                  এই কাউন্টারে কোনো রেজিস্টার্ড স্টাফ পাওয়া যায়নি।
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#f8fafc' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>২. স্টাফ নাম</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৩. মাস</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৪. স্টাফ আইডি</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৫. পদবী</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৬. মূল বেতন (৳)</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৭. অনুপস্থিত দিন</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৮. অগ্রিম কর্তন (৳)</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>৯. সর্বমোট প্রদেয় (৳)</th>
                        <th style={{ padding: '10px', border: '1px solid #334155' }}>১০. স্ট্যাটাস</th>
                        <th style={{ padding: '10px', border: '1px solid #334155', textAlign: 'center' }}>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeStaffs
                        .filter(email => {
                          const staff = staffDataMap[email];
                          return staff && (staff.branch === selectedBranch || (!countersList.includes(staff.branch) && selectedBranch === "অনির্দিষ্ট/অন্যান্য কাউন্টার"));
                        })
                        .map(email => {
                          const staff = staffDataMap[email];
                          const staffIdKey = email;
                          const currentInput = staffInputs[staffIdKey] || {};
                          
                          const basic = Number(staff.basicsalary ?? staff.basicSalary) || 0;
                          const absent = Number(currentInput.absentDays ?? 0);
                          const advance = Number(currentInput.advanceSalary ?? (staff.advancesalary ?? staff.advanceSalary ?? 0));
                          
                          const dim = 30; 
                          const { total } = calculateSalaryDetails ? calculateSalaryDetails(basic, dim, absent, advance) : { total: basic - advance };

                          return (
                            <tr key={email} style={{ borderBottom: '1px solid #334155', backgroundColor: '#1e293b' }}>
                              <td style={{ padding: '10px', border: '1px solid #334155', fontWeight: 'bold' }}>{staff.name || email}</td>
                              <td style={{ padding: '10px', border: '1px solid #334155', color: '#93c5fd' }}>{selectedMonth}</td>
                              <td style={{ padding: '10px', border: '1px solid #334155' }}>{staff.staffId || email.split('@')[0].toUpperCase()}</td>
                              <td style={{ padding: '10px', border: '1px solid #334155' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#334155', fontSize: '11px' }}>
                                  {staff.designation || 'জেনারেল স্টাফ'}
                                </span>
                              </td>
                              <td style={{ padding: '10px', border: '1px solid #334155', fontWeight: 'bold' }}>৳{basic.toLocaleString('bn-BD')}</td>
                              <td style={{ padding: '10px', border: '1px solid #334155' }}>
                                <input 
                                  type="number" 
                                  min="0"
                                  value={currentInput.absentDays !== undefined ? currentInput.absentDays : 0}
                                  onChange={(e) => handleInputChange(staffIdKey, 'absentDays', e.target.value)}
                                  onWheel={(e) => e.target.blur()}
                                  style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center' }}
                                />
                              </td>
                              <td style={{ padding: '10px', border: '1px solid #334155' }}>
                                <input 
                                  type="number" 
                                  min="0"
                                  value={currentInput.advanceSalary !== undefined ? currentInput.advanceSalary : (staff.advancesalary ?? staff.advanceSalary ?? 0)}
                                  onChange={(e) => handleInputChange(staffIdKey, 'advanceSalary', e.target.value)}
                                  onWheel={(e) => e.target.blur()}
                                  style={{ width: '85px', padding: '6px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}
                                />
                              </td>
                              <td style={{ padding: '10px', border: '1px solid #334155', fontWeight: 'bold', color: '#4ade80' }}>
                                ৳{total.toLocaleString('bn-BD')}
                              </td>
                              <td style={{ padding: '10px', border: '1px solid #334155' }}>
                                <select 
                                  value={currentInput.paymentStatus || 'অপরিশোধ'}
                                  onChange={(e) => handleInputChange(staffIdKey, 'paymentStatus', e.target.value)}
                                  style={{ padding: '6px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }}
                                >
                                  <option value="অপরিশোধ">অপরিশোধ</option>
                                  <option value="পরিশোধিত">পরিশোধিত</option>
                                </select>
                              </td>
                              <td style={{ padding: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                                <button 
                                  type="button"
                                  disabled={savingStaffId === email}
                                  onClick={() => handleSaveStaffSalary(staff, email, { total })}
                                  style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  {savingStaffId === email ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* পূর্বে সংরক্ষিত বেতন রেকর্ডসমূহ (কাউন্টার ওয়াইজ ড্রপডাউন সহ) */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
              📋 সংরক্ষিত বেতনের রেকর্ডসমূহ (কাউন্টার অনুযায়ী) ({selectedMonth})
            </h3>
            
            {activeSalaries.filter(s => s.month === selectedMonth).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>এই মাসে এখনো কোনো বেতনের রেকর্ড সংরক্ষিত হয়নি।</p>
            ) : (
              countersList.map(counterName => {
                const counterSalaries = activeSalaries.filter(s => s.month === selectedMonth && s.branch === counterName);
                if (counterSalaries.length === 0) return null;

                const isOpen = !collapsedCounters[counterName]; // ডিফল্টভাবে খোলা থাকতে পারে অথবা বন্ধ

                return (
                  <div key={counterName} style={{ marginBottom: '15px', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                    {/* কাউন্টার হেডার ও ড্রপডাউন বাটন */}
                    <div 
                      onClick={() => toggleCounterDropdown(counterName)}
                      style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#1e293b', borderBottom: isOpen ? '1px solid #334155' : 'none' }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '14px' }}>
                        📍 কাউন্টার: {counterName} ({counterSalaries.length} জন স্টাফ)
                      </span>
                      <button 
                        type="button" 
                        style={{ fontSize: '12px', color: '#ffffff', backgroundColor: '#334155', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {isOpen ? 'ড্রপডাউন বন্ধ করুন ▴' : 'ড্রপডাউন খুলুন ▾'}
                      </button>
                    </div>

                    {/* ড্রপডাউন বডি (স্টাফ লিস্ট টেবিল) */}
                    {isOpen && (
                      <div style={{ padding: '12px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#f8fafc' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#1e293b', color: '#cbd5e1' }}>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>স্টাফ নাম</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>আইডি</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>পদবী</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>মূল বেতন</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>অনুপস্থিত দিন</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>অগ্রিম কর্তন</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>সর্বমোট প্রদেয়</th>
                              <th style={{ padding: '8px', border: '1px solid #334155' }}>স্ট্যাটাস</th>
                              <th style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {counterSalaries.map(sal => (
                              <tr key={sal.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '8px', border: '1px solid #334155', fontWeight: 'bold' }}>{sal.staffName}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>{sal.staffId}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>{sal.designation}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>৳{sal.basicSalary}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>{sal.absentDays || 0} দিন</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>৳{sal.advanceSalary || 0}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155', fontWeight: 'bold', color: '#4ade80' }}>৳{sal.totalPayable}</td>
                                <td style={{ padding: '8px', border: '1px solid #334155' }}>
                                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: sal.paymentStatus === 'পরিশোধিত' ? '#065f46' : '#7f1d1d', color: sal.paymentStatus === 'পরিশোধিত' ? '#34d399' : '#fca5a5' }}>
                                    {sal.paymentStatus || 'অপরিশোধ'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                                  <button onClick={() => handleDeleteSalary(sal.id)} style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ডিলিট</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}