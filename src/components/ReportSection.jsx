import React from 'react';

export default function ReportSection({
  currentUser,
  filterMode,
  selectedDate,
  selectedMonth,
  selectedStaff,
  staffDataMap,
  showReport,
  setShowReport,
  sortedDailyBusSummary,
  sortedBusWiseMonthlySummary,
  sortedMonthlySummary,
  sortedMonthlyExpenseSummary,
  sortedSales,
  sortedExpenses,
  statementWithBalance,
  totalTicketsAll,
  totalCommissionAll,
  downloadPDF,
  formatDate,
  formatMonth,
  handleOpenEditSale,
  handleDeleteSale,
  handleDeleteExpense,
  startDate,
  endDate
}) {
  const staffText = selectedStaff === 'all' ? 'সকল স্টাফ (সবাই)' : (staffDataMap[selectedStaff]?.name || selectedStaff);
  const periodText = filterMode === 'daily' 
    ? `তারিখ: ${formatDate(selectedDate)}` 
    : filterMode === 'monthly' 
    ? `মাস: ${formatMonth(selectedMonth)}` 
    : `সময়কাল: ${formatDate(startDate)} হতে ${formatDate(endDate)}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>
          📊 সেলস ও রিপোর্ট সামারি ({filterMode === 'monthly' ? `মাস: ${formatMonth(selectedMonth)}` : filterMode === 'daily' ? `তারিখ: ${formatDate(selectedDate)}` : 'স্টেটমেন্ট'})
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={downloadPDF}
            style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🖨️ প্রিন্ট / PDF ডাউনলোড
          </button>
          <button 
            onClick={() => setShowReport(!showReport)}
            style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            {showReport ? 'রিপোর্ট লুকিয়ে রাখুন' : 'রিপোর্ট দেখুন'}
          </button>
        </div>
      </div>

      {showReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* কাউন্টার ও বাস অনুযায়ী মোট মাসিক হিসাব */}
          {filterMode === 'monthly' && (
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '14px', color: '#fff' }}>
              <h3 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '15px', color: '#38bdf8', fontWeight: '700' }}>
                🚌 কাউন্টার ও বাস অনুযায়ী মোট মাসিক হিসাব ({formatMonth(selectedMonth)})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>কাউন্টার / বাস ও ধরন</th>
                      <th style={{ padding: '10px' }}>কমিশন এর পরিমাণ</th>
                      <th style={{ padding: '10px' }}>মোট টিকেট</th>
                      <th style={{ padding: '10px' }}>মোট কমিশন (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBusWiseMonthlySummary.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>কোনো তথ্য পাওয়া যায়নি</td>
                      </tr>
                    ) : (
                      sortedBusWiseMonthlySummary.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '10px', fontWeight: '600', color: '#f8fafc' }}>{item.transport} ({item.ticketType})</td>
                          <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{item.rateDisplay}</td>
                          <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>{item.totalTickets} টি</td>
                          <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>৳ {item.totalCommission}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* দৈনিক বাস সামারি (যদি দৈনিক মোড হয়) */}
          {filterMode === 'daily' && sortedDailyBusSummary.length > 0 && (
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '14px', color: '#fff' }}>
              <h3 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '15px', color: '#38bdf8', fontWeight: '700' }}>
                🚌 আজকের বাস অনুযায়ী হিসাব ({formatDate(selectedDate)})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>পরিবহন / কাউন্টার</th>
                      <th style={{ padding: '10px' }}>বাসের ধরন</th>
                      <th style={{ padding: '10px' }}>কমিশন রেট</th>
                      <th style={{ padding: '10px' }}>মোট টিকেট</th>
                      <th style={{ padding: '10px' }}>মোট কমিশন (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDailyBusSummary.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#f8fafc' }}>{item.transport}</td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.ticketType}</td>
                        <td style={{ padding: '10px', color: '#38bdf8' }}>{item.rate} {item.commissionType === 'percent' ? '%' : 'টাকা'}</td>
                        <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>{item.totalTickets} টি</td>
                        <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>৳ {item.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* বিস্তারিত ট্রানজ্যাকশন ও স্টেটমেন্ট */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '14px', color: '#fff' }}>
            <h3 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '15px', color: '#38bdf8', fontWeight: '700' }}>
              📋 বিস্তারিত ট্রানজ্যাকশন ও স্টেটমেন্ট
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>তারিখ</th>
                    <th style={{ padding: '10px' }}>স্টাফ নাম</th>
                    <th style={{ padding: '10px' }}>বিবরণ / খাত</th>
                    <th style={{ padding: '10px' }}>টিকেট</th>
                    <th style={{ padding: '10px' }}>ইনকাম (জমা)</th>
                    <th style={{ padding: '10px' }}>খরচ</th>
                    <th style={{ padding: '10px' }}>ব্যালেন্স</th>
                    {currentUser?.role === 'ADMIN' && <th style={{ padding: '10px' }}>অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody>
                  {statementWithBalance.length === 0 ? (
                    <tr>
                      <td colSpan={currentUser?.role === 'ADMIN' ? 8 : 7} style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>কোনো তথ্য পাওয়া যায়নি</td>
                    </tr>
                  ) : (
                    statementWithBalance.map((item, index) => {
                      const originalSale = sortedSales.find(s => s.id === item.id);
                      const originalExpense = sortedExpenses.find(e => e.id === item.id);

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '10px', color: '#cbd5e1' }}>{formatDate(item.date)}</td>
                          <td style={{ padding: '10px', fontWeight: '600', color: '#f8fafc' }}>{item.staffName}</td>
                          <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.title}</td>
                          <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.tickets ? item.tickets + ' টি' : '-'}</td>
                          <td style={{ padding: '10px', color: item.type === 'INCOME' ? '#4ade80' : 'inherit', fontWeight: item.type === 'INCOME' ? 'bold' : 'normal' }}>
                            {item.type === 'INCOME' ? '৳ ' + item.amount : '-'}
                          </td>
                          <td style={{ padding: '10px', color: item.type === 'EXPENSE' ? '#f87171' : 'inherit', fontWeight: item.type === 'EXPENSE' ? 'bold' : 'normal' }}>
                            {item.type === 'EXPENSE' ? '৳ ' + item.amount : '-'}
                          </td>
                          <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>৳ {item.balance}</td>
                          {currentUser?.role === 'ADMIN' && (
                            <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                              {originalSale && (
                                <button onClick={() => handleOpenEditSale(originalSale)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>এডিট</button>
                              )}
                              {originalSale && (
                                <button onClick={() => handleDeleteSale(originalSale.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>ডিলিট</button>
                              )}
                              {originalExpense && (
                                <button onClick={() => handleDeleteExpense(originalExpense.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>ডিলিট</button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}