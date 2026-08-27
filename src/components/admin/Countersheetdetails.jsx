import React from 'react';

export default function Countersheetdetails({
  selectedMonth = '',
  setSelectedMonth = () => {},
  generateMonthOptions = () => [],
  ALL_REPORT_COUNTERS = [],
  currentMonthSales = [],
  activeBooths = [],
  currentMonthExpenses = [],
  currentMonthSalaries = [],
  getMappedCounterName = (item) => item?.counterName || '',
  openCounters = {},
  toggleCounterAccordion = () => {},
  handleRentChange = () => {},
  handleDeleteBooth = () => {},
  handleDeleteExpense = () => {},
  totalTicketsIncome = 0,
  totalRent = 0,
  netIncome = 0,
  globalAdminExp = 0,
  globalBranchExp = 0,
  totalSalariesExpense = 0,
  handleDownloadSummaryPDF = () => {},
  handlePrintCounterReport = () => {},
  expenseCounter = '',
  setExpenseCounter = () => {},
  expenseTitle = '',
  setExpenseTitle = () => {},
  expenseAmount = '',
  setExpenseAmount = () => {},
  expenseDate = '',
  setExpenseDate = () => {},
  handleAddExpense = (e) => e.preventDefault(),
  isAddingExpense = false,
  countersList = []
}) {

  // স্ক্রিনশটের ডিজাইন অনুযায়ী উন্নত প্রিন্ট / PDF ফাংশন
  const defaultHandlePrintCounterReport = (cName, cSales, cBooths, adminExp, branchExp, cSalaries, cNet, sMonth) => {
    const printWindow = window.open('', '_blank');
    const totalQty = cSales.reduce((s, i) => s + Number(i.tickets || i.quantity || i.ticketCount || i.count || 1), 0);
    const totalAmt = cSales.reduce((s, i) => s + Number(i.total || i.amount || i.totalFare || i.fare || i.price || i.ticketPrice || i.cost || 0), 0);
    const totalRentAmt = cBooths.reduce((sum, b) => sum + (Number(b.rent) || 0), 0);
    const totalIncome = totalAmt + totalRentAmt;

    const totalSalaryAmt = cSalaries.reduce((sum, s) => sum + (Number(s.totalPayable) || 0), 0);
    const totalAdminExpAmt = adminExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalBranchExpAmt = branchExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalOfficeExp = totalAdminExpAmt + totalBranchExpAmt;
    const totalExpenseAmt = totalSalaryAmt + totalOfficeExp;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>রিপোর্ট - ${cName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Hind Siliguri', Arial, sans-serif;
            padding: 20px;
            color: #111;
            background: #fff;
            -webkit-font-smoothing: antialiased;
            max-width: 800px;
            margin: 0 auto;
          }
          .top-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .brand-info h2 { margin: 0; color: #1e3a8a; font-size: 22px; font-weight: 700; }
          .brand-info p { margin: 2px 0 0; color: #475569; font-size: 13px; font-weight: 600; }
          .report-link-btn { background: #e2e8f0; padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 4px; color: #1e3a8a; border: 1px solid #cbd5e1; }
          
          .month-badge { background: #e2e8f0; padding: 8px; text-align: center; font-weight: 700; font-size: 14px; margin-bottom: 8px; border-radius: 4px; color: #0f172a; border: 1px solid #cbd5e1; }
          .counter-badge { background: #2563eb; padding: 10px; text-align: center; font-weight: 700; font-size: 16px; margin-bottom: 15px; border-radius: 4px; color: #ffffff; }

          .section-title { background: #1e3a8a; color: #ffffff; padding: 8px 12px; text-align: center; font-weight: 700; font-size: 15px; border: 1px solid #1e3a8a; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #94a3b8; padding: 7px 10px; font-size: 13px; text-align: left; }
          th { background-color: #1e3a8a; color: #ffffff; font-weight: 700; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .row-highlight { background-color: #f1f5f9; font-weight: 700; }
          .row-rent { background-color: #fce7f3; font-weight: 700; color: #9d174d; }
          .row-total-income { background-color: #fbcfe8; font-weight: 700; color: #831843; }
          
          .net-income-box { background: #fecdd3; color: #9f1239; padding: 12px; text-align: center; font-weight: 700; font-size: 16px; border: 1px solid #fda4af; border-radius: 4px; margin-top: 15px; }
          .net-income-box.positive { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        </style>
      </head>
      <body>
        <div class="top-header">
          <div class="brand-info">
            <h2>এজে এন্টারপ্রাইজ</h2>
            <p>ঠিকানা: লতিফ ম্যানশন, আব্দুল্লাহপুর, উত্তরা, ঢাকা</p>
          </div>
          <div class="report-link-btn">আর্থিক বিবরণী রিপোর্ট</div>
        </div>
        
        <div class="month-badge">
          মাসের নাম: ${sMonth}
        </div>
        
        <div class="counter-badge">
          ${cName}
        </div>

        <div class="section-title">আয় ব্যয়ের হিসাব বিবরণী</div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">NO</th>
              <th>আয়ের খাত (কমিশন রেট)</th>
              <th class="text-center" style="width: 110px;">বিক্রিত টিকেট</th>
              <th class="text-right" style="width: 140px;">আয়ের পরিমাণ (টাকা)</th>
            </tr>
          </thead>
          <tbody>
            ${cSales.map((item, idx) => {
              const rawTransport = item.transport || item.transportName || item.busName || item.bus || item.name || 'অন্যান্য পরিবহন';
              let transportName = rawTransport;
              let supervisor = item.staffName || item.supervisor || item.person || item.manager || item.staff || '';
              let commissionRate = item.rate || item.commissionRate || item.commission || item.perTicketCommission || '';

              if (rawTransport.includes('-')) {
                const parts = rawTransport.split('-');
                if (parts.length >= 2) {
                  transportName = parts[0].trim();
                  if (!supervisor) {
                    supervisor = parts.slice(1).join('-').trim();
                  }
                }
              }

              const qty = Number(item.tickets || item.quantity || item.ticketCount || item.count || 1);
              const amt = Number(item.total || item.amount || item.totalFare || item.fare || item.price || item.ticketPrice || item.cost || 0);
              
              let detailsText = transportName;
              if (supervisor) {
                detailsText += `-${supervisor}`;
              }
              if (commissionRate) {
                detailsText += ` (${Number(commissionRate).toLocaleString('en-IN')} টাকা)`;
              } else {
                detailsText += ` (0 টাকা)`;
              }

              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${detailsText}</td>
                  <td class="text-center">${qty.toLocaleString('en-IN')}</td>
                  <td class="text-right">৳${amt.toLocaleString('en-IN')}</td>
                </tr>
              `;
            }).join('')}
            
            <tr class="row-highlight">
              <td colspan="2" class="text-right">সর্বমোট:</td>
              <td class="text-center">${totalQty.toLocaleString('en-IN')}</td>
              <td class="text-right">৳${totalAmt.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="row-rent">
              <td colspan="3" class="text-right">দোকান বুথ ভাড়া বাবদ আয়</td>
              <td class="text-right">৳${totalRentAmt.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="row-total-income">
              <td colspan="3" class="text-right">সর্বমোট আয়:</td>
              <td class="text-right">৳${totalIncome.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title" style="margin-top: 20px;">ব্যয়ের বিবরণ</div>
        <table>
          <thead>
            <tr>
              <th>খরচ এর খাত</th>
              <th class="text-right" style="width: 180px;">খরচ এর পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>স্টাফ মাসিক বেতন:</td>
              <td class="text-right">৳${totalSalaryAmt.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>অফিসের যাবতীয় খরচ:</td>
              <td class="text-right">৳${totalOfficeExp.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="row-highlight">
              <td class="text-right">সর্বমোট খরচ:</td>
              <td class="text-right">৳${totalExpenseAmt.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="net-income-box ${cNet >= 0 ? 'positive' : ''}">
          এই মাসের জমা: ${cNet < 0 ? `-৳${Math.abs(cNet).toLocaleString('en-IN')}` : `৳${cNet.toLocaleString('en-IN')}`}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const triggerPrint = (cName, cSales, cBooths, adminExp, branchExp, cSalaries, cNet, sMonth) => {
    if (typeof handlePrintCounterReport === 'function' && handlePrintCounterReport.toString().length > 50) {
      handlePrintCounterReport(cName, cSales, cBooths, adminExp, branchExp, cSalaries, cNet, sMonth);
    } else {
      defaultHandlePrintCounterReport(cName, cSales, cBooths, adminExp, branchExp, cSalaries, cNet, sMonth);
    }
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', Arial, sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', background: '#1e293b', padding: '12px 18px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="reportMonthSelect" style={{ fontWeight: '700', color: '#60a5fa', fontSize: '14px' }}>রিপোর্টের মাস নির্বাচন:</label>
          <select 
            id="reportMonthSelect" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
          >
            {(generateMonthOptions() || []).map(m => (
              <option key={m} value={m} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ➕অ্যাডমিন খরচ এন্ট্রি করুন */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #dc2626', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#f87171' }}>
          ➕অ্যাডমিন খরচ এন্ট্রি করুন
        </h3>
        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>কাউন্টার সিলেক্ট করুন</label>
            <select value={expenseCounter} onChange={e => setExpenseCounter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontFamily: 'inherit' }} required>
              {(countersList || []).map(c => <option key={c} value={c} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>খরচের বিবরণ / শিরোনাম</label>
            <input type="text" placeholder="যেমন: বিদ্যুৎ বিল / অফিস খরচ" value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontFamily: 'inherit' }} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>পরিমাণ (৳)</label>
            <input type="number" placeholder="৳500" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} onWheel={(e) => e.target.blur()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontFamily: 'inherit' }} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>তারিখ</label>
            <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontFamily: 'inherit' }} required />
          </div>
          <button type="submit" disabled={isAddingExpense} style={{ padding: '11px', backgroundColor: isAddingExpense ? '#64748b' : '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: isAddingExpense ? 'not-allowed' : 'pointer', marginTop: '4px', fontFamily: 'inherit' }}>
            {isAddingExpense ? 'জমা হচ্ছে...' : 'খরচ যোগ করুন'}
          </button>
        </form>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' }}>📋 কাউন্টারের বিস্তারিত হিসাব ও রিপোর্ট ({selectedMonth})</h3>
      
      {(ALL_REPORT_COUNTERS || []).map(counterName => {
        const counterSales = (currentMonthSales || []).filter(s => {
          const mapped = getMappedCounterName(s);
          if (mapped !== counterName) return false;
          const tName = s.transport || s.transportName || s.busName || s.bus || '';
          return !/রাসেদ|rashed/i.test(tName);
        });
        
        const counterTotalSales = counterSales.reduce((sum, item) => {
          const val = Number(item.total || item.amount || item.totalFare || item.fare || item.price || item.ticketPrice || item.cost || 0);
          return sum + val;
        }, 0);

        const counterBooths = (activeBooths || []).filter(b => b.counterName === counterName);
        const counterTotalRent = counterBooths.reduce((sum, b) => sum + (Number(b.rent) || 0), 0);

        const counterExpenses = (currentMonthExpenses || []).filter(e => {
          const mapped = getMappedCounterName(e);
          return mapped === counterName;
        });
        
        const adminExpenses = counterExpenses.filter(e => e.expenseType === 'admin');
        const branchExpenses = counterExpenses.filter(e => e.expenseType === 'branch' || !e.expenseType);

        const counterTotalAdminExpense = adminExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const counterTotalBranchExpense = branchExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const counterSalaries = (currentMonthSalaries || []).filter(s => s.branch === counterName);
        const counterTotalSalary = counterSalaries.reduce((sum, s) => sum + (Number(s.totalPayable) || 0), 0);

        const counterNet = counterTotalSales + counterTotalRent - counterTotalAdminExpense - counterTotalBranchExpense - counterTotalSalary;

        const isOpen = !!openCounters[counterName];
        const isUnassigned = counterName === "অনির্দিষ্ট/অন্যান্য কাউন্টার";

        if (isUnassigned && counterSales.length === 0 && counterExpenses.length === 0) {
          return null;
        }

        return (
          <div key={counterName} style={{ marginBottom: '20px', border: isUnassigned ? '2px dashed #f59e0b' : '1px solid #334155', borderRadius: '10px', overflow: 'hidden', backgroundColor: isUnassigned ? '#451a03' : '#1e293b' }}>
            <div 
              style={{ backgroundColor: isUnassigned ? '#78350f' : '#0f172a', padding: '14px 18px', fontWeight: '700', color: isUnassigned ? '#fde68a' : '#f8fafc', borderBottom: isOpen ? '1px solid #334155' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}
            >
              <div 
                onClick={() => toggleCounterAccordion(counterName)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>{isOpen ? '▼' : '▶'}</span>
                <span>📍 {counterName} {isUnassigned && '(যাচাই করুন)'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerPrint(counterName, counterSales, counterBooths, adminExpenses, branchExpenses, counterSalaries, counterNet, selectedMonth);
                  }}
                  style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
                >
                  🖨️ প্রিন্ট / PDF
                </button>
                <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700' }}>
                  নীট জমা: {(counterNet || 0).toLocaleString('en-IN')} ৳
                </span>
                <span 
                  onClick={() => toggleCounterAccordion(counterName)}
                  style={{ fontSize: '12px', color: '#cbd5e1', backgroundColor: '#334155', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {isOpen ? 'বন্ধ করুন' : 'বিস্তারিত দেখুন'}
                </span>
              </div>
            </div>
            
            {isOpen && (
              <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#38bdf8', fontWeight: '700' }}>১. কাউন্টার ও বাস অনুযায়ী মোট মাসিক হিসাব (টিকেট বিক্রয় ও কমিশন আয় বিবরণী)</h4>
                  {(() => {
                    const totalQty = counterSales.reduce((s, i) => s + Number(i.tickets || i.quantity || i.ticketCount || i.count || 1), 0);
                    const totalAmt = counterSales.reduce((s, i) => s + Number(i.total || i.amount || i.totalFare || i.fare || i.price || i.ticketPrice || i.cost || 0), 0);
                    return (
                      <div style={{ backgroundColor: '#064e3b', padding: '14px', borderRadius: '8px', border: '1px solid #059669', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '15px', color: '#ecfdf5', fontWeight: '700' }}>
                          📌 সর্বমোট - টিকেট বিক্রি: {totalQty.toLocaleString('en-IN')} টি, &nbsp;&nbsp; মোট কমিশন আয়: ৳{totalAmt.toLocaleString('en-IN')} টাকা
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4ade80', fontWeight: '700' }}>২. বুথ ও দোকান ভাড়া তালিকা</h4>
                  {counterBooths.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '10px' }}>এই কাউন্টারে কোনো বুথ ভাড়া নেই।</p>
                  ) : (
                    <div style={{ overflowX: 'auto', marginBottom: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#f8fafc' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#064e3b', color: '#4ade80' }}>
                            <th style={{ padding: '9px 12px', border: '1px solid #065f46' }}>বুথ নং</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #065f46' }}>ভাড়াগ্রহীতা</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #065f46' }}>ভাড়া (৳) [Edit]</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #065f46', textAlign: 'center' }}>অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {counterBooths.map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #334155' }}>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>{b.boothNo}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>{b.tenantName}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155' }}>
                                <input 
                                  type="number" 
                                  defaultValue={b.rent} 
                                  onBlur={(e) => handleRentChange(b.id, e.target.value)} 
                                  onWheel={(e) => e.target.blur()}
                                  style={{ padding: '5px', width: '100px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontFamily: 'inherit' }} 
                                />
                              </td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', textAlign: 'center' }}>
                                <button onClick={() => handleDeleteBooth(b.id)} style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>ডিলিট</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>মোট বুথ ভাড়া:</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#4ade80' }}>+{counterTotalRent.toLocaleString('en-IN')} টাকা</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#fb923c', fontWeight: '700' }}>৩. এডমিন খরচসমূহ (বিস্তারিত) ({selectedMonth})</h4>
                  {adminExpenses.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '10px' }}>এই কাউন্টারে কোনো এডমিন খরচ নেই।</p>
                  ) : (
                    <div style={{ overflowX: 'auto', marginBottom: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#f8fafc' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#7c2d12', color: '#fed7aa' }}>
                            <th style={{ padding: '9px 12px', border: '1px solid #9a3412' }}>তারিখ</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #9a3412' }}>বিবরণ</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #9a3412' }}>পরিমাণ (৳)</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #9a3412', textAlign: 'center' }}>অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminExpenses.map(exp => (
                            <tr key={exp.id} style={{ borderBottom: '1px solid #334155' }}>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>{exp.date}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>{exp.title || exp.description}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>৳{Number(exp.amount || 0).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', textAlign: 'center' }}>
                                <button onClick={() => handleDeleteExpense(exp.id)} style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>ডিলিট</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fb923c' }}>মোট এডমিন খরচ:</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#fb923c' }}>-{counterTotalAdminExpense.toLocaleString('en-IN')} টাকা</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#f87171', fontWeight: '700' }}>৪. মোট ব্রাঞ্চ খরচ (টোটাল) ({selectedMonth})</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#f87171' }}>মোট ব্রাঞ্চ খরচ (টোটাল):</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#f87171' }}>-{counterTotalBranchExpense.toLocaleString('en-IN')} টাকা</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#fde047', fontWeight: '700' }}>৫. স্টাফ বেতনসমূহ বিস্তারিত ({selectedMonth})</h4>
                  {counterSalaries.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '10px' }}>এই কাউন্টারে বেতনের কোনো রেকর্ড নেই।</p>
                  ) : (
                    <div style={{ overflowX: 'auto', marginBottom: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#f8fafc' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#713f12', color: '#fde047' }}>
                            <th style={{ padding: '9px 12px', border: '1px solid #854d0e' }}>স্টাফ নাম</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #854d0e' }}>পদবী</th>
                            <th style={{ padding: '9px 12px', border: '1px solid #854d0e' }}>প্রদেয় বেতন (৳)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {counterSalaries.map(sal => (
                            <tr key={sal.id} style={{ borderBottom: '1px solid #334155' }}>
                              <td style={{ padding: '9px 12px', border: '1px solid #334155', fontWeight: '600' }}>{sal.staffName}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #854d0e', fontWeight: '600' }}>{sal.designation}</td>
                              <td style={{ padding: '9px 12px', border: '1px solid #854d0e', fontWeight: '600' }}>৳{Number(sal.totalPayable || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fde047' }}>মোট বেতন:</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#fde047' }}>-{counterTotalSalary.toLocaleString('en-IN')} টাকা</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div id="economic-summary-box" style={{ backgroundColor: '#111827', color: '#fff', padding: '20px', borderRadius: '12px', marginTop: '30px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', fontWeight: '700' }}>📊 সর্বমোট অর্থনৈতিক সামারি ({selectedMonth})</h3>
          <button 
            type="button" 
            onClick={handleDownloadSummaryPDF}
            style={{ padding: '7px 15px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            📥 PDF ডাউনলোড করুন
          </button>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <p style={{ fontSize: '15px', margin: '8px 0', fontWeight: '600' }}>🎫 মোট টিকেট কমিশন (ইনকাম): <strong style={{ color: '#38bdf8', fontWeight: '700' }}>+{(totalTicketsIncome || 0).toLocaleString('en-IN')} ৳</strong></p>
        <p style={{ fontSize: '15px', margin: '8px 0', fontWeight: '600' }}>🏢 মোট দোকান ভাড়া (ইনকাম): <strong style={{ color: '#4ade80', fontWeight: '700' }}>+{(totalRent || 0).toLocaleString('en-IN')} ৳</strong></p>
        <p style={{ fontSize: '15px', margin: '8px 0', fontWeight: '600' }}>📉 মোট এডমিন খরচ: <strong style={{ color: '#fb923c', fontWeight: '700' }}>-{(globalAdminExp || 0).toLocaleString('en-IN')} ৳</strong></p>
        <p style={{ fontSize: '15px', margin: '8px 0', fontWeight: '600' }}>📉 মোট ব্রাঞ্চ খরচ (টোটাল): <strong style={{ color: '#f87171', fontWeight: '700' }}>-{(globalBranchExp || 0).toLocaleString('en-IN')} ৳</strong></p>
        <p style={{ fontSize: '15px', margin: '8px 0', fontWeight: '600' }}>👥 মোট স্টাফ বেতন: <strong style={{ color: '#60a5fa', fontWeight: '700' }}>-{(totalSalariesExpense || 0).toLocaleString('en-IN')} ৳</strong></p>
        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <h3 style={{ fontSize: '20px', marginTop: '12px', color: '#fef08a', fontWeight: '700' }}>
          💰 সর্বমোট অবশিষ্ট নীট জমা: {(netIncome || 0).toLocaleString('en-IN')} ৳
        </h3>
      </div>
    </div>
  );
}