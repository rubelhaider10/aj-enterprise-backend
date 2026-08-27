import React from 'react';

export default function CounterAccounts({
  selectedMonth = '',
  setSelectedMonth = () => {},
  generateMonthOptions = () => [],
  newCounter = '',
  setNewCounter = () => {},
  newBoothNo = '',
  setNewBoothNo = () => {},
  newTenant = '',
  setNewTenant = () => {},
  newRent = '',
  setNewRent = () => {},
  handleAddBooth = (e) => e.preventDefault(),
  isAddingBooth = false,
  countersList = [],
  activeTab = 'booth',
  newDynamicCounterInput = '',
  setNewDynamicCounterInput = () => {},
  handleAddNewCounter = () => {},
  isAddingCounter = false,
  counters = [],
  editingCounterId = null,
  editedCounterName = '',
  setEditedCounterName = () => {},
  handleSaveCounterEdit = () => {},
  setEditingCounterId = () => {},
  handleEditCounterClick = () => {},
  handleDeleteCounter = () => {}
}) {
  if (activeTab && activeTab !== 'booth') {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#1e293b', borderRadius: '12px', margin: '20px' }}>
        <h3>অন্যান্য ট্যাব সিলেক্ট করা আছে ({activeTab})।</h3>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', background: '#1e293b', padding: '12px 18px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="boothMonthSelect" style={{ fontWeight: '700', color: '#60a5fa', fontSize: '14px' }}>হিসাবের মাস নির্বাচন:</label>
          <select 
            id="boothMonthSelect" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
          >
            {(generateMonthOptions() || []).map(m => (
              <option key={m} value={m} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* নতুন ব্রাঞ্চ বা কাউন্টার ডায়নামিকালি যোগ, এডিট ও ডিলিট করুন (ড্রপডাউন বাটন বন্ধ করা হয়েছে) */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #065f46', marginBottom: '25px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', backgroundColor: '#065f46' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ➕ নতুন ব্রাঞ্চ বা কাউন্টার ডায়নামিকালি যোগ, এডিট ও ডিলিট করুন (ফায়ারবেস যুক্ত)
          </h3>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="নতুন কাউন্টারের নাম লিখুন (যেমন: গুলশান কাউন্টার)" 
              value={newDynamicCounterInput}
              onChange={(e) => setNewDynamicCounterInput(e.target.value)}
              style={{ flex: 1, minWidth: '250px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
            />
            <button 
              type="button" 
              onClick={handleAddNewCounter}
              disabled={isAddingCounter}
              style={{ padding: '10px 20px', backgroundColor: isAddingCounter ? '#64748b' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isAddingCounter ? 'not-allowed' : 'pointer' }}
            >
              {isAddingCounter ? 'জমা হচ্ছে...' : 'কাউন্টার যুক্ত করুন'}
            </button>
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#34d399' }}>বর্তমান কাউন্টারসমূহ তালিকা:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {counters.filter(c => !c.isDeleted).map((cObj, idx) => {
                const cName = cObj.name || cObj;
                const cId = cObj.id;
                return (
                  <div key={cId || cName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px', border: '1px solid #334155' }}>
                    {editingCounterId === cId ? (
                      <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                        <input 
                          type="text" 
                          value={editedCounterName} 
                          onChange={(e) => setEditedCounterName(e.target.value)}
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff' }}
                        />
                        <button 
                          onClick={() => handleSaveCounterEdit(cId)}
                          style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          সেভ
                        </button>
                        <button 
                          onClick={() => setEditingCounterId(null)}
                          style={{ padding: '6px 12px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{idx + 1}. {cName}</span>
                    )}

                    {editingCounterId !== cId && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleEditCounterClick(cObj)}
                          style={{ padding: '5px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          এডিট
                        </button>
                        <button 
                          onClick={() => handleDeleteCounter(cObj)}
                          style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ডিলিট
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #0284c7' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#38bdf8' }}>
            ➕ নতুন বুথ বা দোকান ভাড়া যোগ করুন
          </h3>
          <form onSubmit={handleAddBooth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>কাউন্টার সিলেক্ট</label>
              <select value={newCounter} onChange={e => setNewCounter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold' }} required>
                {(countersList || []).map(c => <option key={c} value={c} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>বুথ নং</label>
              <input type="text" placeholder="যেমন: বুথ ১" value={newBoothNo} onChange={e => setNewBoothNo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff' }} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>বুথ বা দোকানের নাম / ভাড়াগৃহীতা</label>
              <input type="text" placeholder="যেমন: সেন্টমার্টিন পরিবহন" value={newTenant} onChange={e => setNewTenant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff' }} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>ভাড়ার পরিমাণ (৳)</label>
              <input type="number" placeholder="যেমন: ৫০০০" value={newRent} onChange={e => setNewRent(e.target.value)} onWheel={(e) => e.target.blur()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff' }} required />
            </div>
            <button type="submit" disabled={isAddingBooth} style={{ padding: '11px', backgroundColor: isAddingBooth ? '#64748b' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isAddingBooth ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
              {isAddingBooth ? 'জমা হচ্ছে...' : 'বুথ ভাড়া যোগ করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}