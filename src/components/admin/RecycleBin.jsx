import React from 'react';

export default function RecycleBin({
  activeTab,
  trashedCounters,
  handleRestoreCounter,
  handlePermanentDeleteCounter,
  trashedStaffs,
  staffDataMap,
  handleRestoreStaff,
  handlePermanentDeleteStaff,
  trashedSales,
  formatDateToCustom,
  handleRestoreSale,
  handlePermanentDeleteSale,
  trashedBooths,
  handleRestoreBooth,
  handlePermanentDeleteBooth,
  trashedExpenses,
  handleRestoreExpense,
  handlePermanentDeleteExpense,
  trashedSalaries,
  handleRestoreSalary,
  handlePermanentDeleteSalary
}) {
  return (
    <>
      {activeTab === 'recycle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fca5a5', margin: 0 }}>🗑️ রিসাইকেল বিন (রিস্টোর বা স্থায়ী ডিলিট করুন - ফায়ারবেস ব্যাকএন্ড)</h3>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📍 ডিলিটকৃত কাউন্টারসমূহ</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedCounters.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedCounters.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত কাউন্টার নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedCounters.map(cObj => (
                    <li key={cObj.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{cObj.name}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreCounter(cObj)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteCounter(cObj)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>👥 ডিলিটকৃত স্টাফগণ</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedStaffs.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedStaffs.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত স্টাফ নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedStaffs.map(email => (
                    <li key={email} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{staffDataMap[email]?.name || email} ({email})</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreStaff(email)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteStaff(email)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎫 ডিলিটকৃত বিক্রয় রেকর্ডসমূহ</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedSales.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedSales.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত বিক্রয় রেকর্ড নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedSales.map(s => (
                    <li key={s.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{formatDateToCustom(s.date || s.timestamp)} — ৳{s.amount || s.totalFare || 0} [{s.addedBy || s.sellerEmail || 'N/A'}]</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreSale(s.id)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteSale(s.id)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🏢 ডিলিটকৃত বুথ ও ভাড়া</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedBooths.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedBooths.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত বুথ নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedBooths.map(b => (
                    <li key={b.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{b.counterName} — {b.boothNo} ({b.tenantName}) — ৳{b.rent}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreBooth(b.id)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteBooth(b.id)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💸 ডিলিটকৃত খরচসমূহ</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedExpenses.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedExpenses.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত খরচ নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedExpenses.map(e => (
                    <li key={e.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{e.counterName} — {e.title || e.description} (৳{e.amount}) [{e.date}]</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreExpense(e.id)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteExpense(e.id)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #7f1d1d', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#451a03' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '14px 18px', fontWeight: 'bold', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💰 ডিলিটকৃত বেতনের রেকর্ড</span>
              <span style={{ fontSize: '12px', backgroundColor: '#991b1b', padding: '4px 8px', borderRadius: '6px', color: '#fee2e2' }}>({trashedSalaries.length})</span>
            </div>
            <div style={{ padding: '15px' }}>
              {trashedSalaries.length === 0 ? <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>কোনো ডিলিটকৃত বেতনের রেকর্ড নেই।</p> : (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f8fafc' }}>
                  {trashedSalaries.map(s => (
                    <li key={s.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{s.month} — {s.staffName} ({s.staffId}) — ৳{s.totalPayable}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreSalary(s.id)} style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>রিস্টোর</button>
                        <button onClick={() => handlePermanentDeleteSalary(s.id)} style={{ padding: '4px 10px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>স্থায়ী ডিলিট</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}