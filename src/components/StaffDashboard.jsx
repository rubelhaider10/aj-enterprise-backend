import React, { useState, useEffect } from 'react';
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

const EXPENSE_CATEGORIES = [
  'মোবাইল বিল', 
  'ইউটিলিটি', 
  'স্টেশনরি', 
  'অনুদান', 
  'স্থায়ী খরচ', 
  'আপ্যায়ন', 
  'মেরামত ও রক্ষণাবেক্ষণ', 
  'অন্যান্য'
];

export default function StaffDashboard({ currentUser, sendToGoogleSheet }) {
  const currentUserEmail = currentUser?.email || auth.currentUser?.email;

  // একটিভ ট্যাব ট্র্যাকিং (0 = টিকেট এন্ট্রি, 1 = ব্রাঞ্চ খরচ এন্ট্রি)
  const [activeTab, setActiveTab] = useState(0);

  const [staffBuses, setStaffBuses] = useState([]);
  const [staffCounter, setStaffCounter] = useState('');
  
  // ১. টিকেট ফরম স্টেটসমূহ
  const [selectedBus, setSelectedBus] = useState('');
  const [busType, setBusType] = useState('AC');
  const [rateType, setRateType] = useState('fixed');
  const [rate, setRate] = useState('');
  const [tickets, setTickets] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  // ২. ব্রাঞ্চ খরচ এন্ট্রি ফরম স্টেটসমূহ
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const [loading, setLoading] = useState(true);

  // ডুপ্লিকেট সাবমিশন রোধ করার জন্য স্টেট
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpenseSubmitting, setIsExpenseSubmitting] = useState(false);

  // লগইন করা স্টাফের বরাদ্দকৃত বাস ও কাউন্টার ডেটাবেজ থেকে ফেচ করা
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!currentUserEmail) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "staffConfigs", currentUserEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const dataBuses = data.buses || [];
          const normalized = dataBuses.map(b => typeof b === 'string' ? { name: b, rate: '' } : b);
          setStaffBuses(normalized);
          setStaffCounter(data.counterName || data.branch || '');
        } else {
          const fallbackBuses = currentUser?.buses || ['অন্যান্য পরিবহন'];
          const normalized = fallbackBuses.map(b => typeof b === 'string' ? { name: b, rate: '' } : b);
          setStaffBuses(normalized);
          setStaffCounter(currentUser?.counterName || currentUser?.branch || '');
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
        setStaffBuses([{ name: 'অন্যান্য পরিবহন', rate: '' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [currentUserEmail, currentUser]);

  const handleBusChange = (e) => {
    const selectedBusName = e.target.value;
    setSelectedBus(selectedBusName);
    
    const foundBus = staffBuses.find(b => b.name === selectedBusName);
    if (foundBus && foundBus.rate !== undefined && foundBus.rate !== '') {
      setRate(foundBus.rate);
    } else {
      setRate('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedBus || !rate || !tickets || !entryDate) {
      return alert('দয়া করে সবগুলো ঘর সঠিকভাবে পূরণ করুন!');
    }

    setIsSubmitting(true);

    const tCount = Number(tickets);
    const tRate = Number(rate);
    const totalVal = tCount * tRate;

    try {
      const saleData = {
        staffId: currentUserEmail,
        staffName: currentUser?.name || auth.currentUser?.displayName || currentUserEmail?.split('@')[0] || 'স্টাফ',
        counterName: staffCounter, // কাউন্টার নাম যুক্ত করা হলো
        date: entryDate,
        transport: selectedBus,
        ticketType: busType,
        rateType: rateType,
        commissionType: rateType, 
        tickets: tCount,
        rate: tRate,
        total: totalVal,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "sales"), saleData);

      if (sendToGoogleSheet) {
        await sendToGoogleSheet({
          type: 'SALE',
          ...saleData
        });
      }

      alert('টিকেট বিক্রির হিসাব সফলভাবে জমা হয়েছে!');
      setSelectedBus('');
      setRate('');
      setTickets('');
    } catch (error) {
      alert('হিসাব জমা দিতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (isExpenseSubmitting) return;

    if (!expenseCategory || !expenseAmount || !expenseDate) {
      return alert('দয়া করে তারিখ, খরচের ক্যাটাগরি এবং পরিমাণ সঠিকভাবে পূরণ করুন!');
    }

    setIsExpenseSubmitting(true);

    try {
      const expenseData = {
        staffId: currentUserEmail,
        staffName: currentUser?.name || auth.currentUser?.displayName || currentUserEmail?.split('@')[0] || 'স্টাফ',
        counterName: staffCounter, // কাউন্টার নাম যুক্ত করা হলো
        date: expenseDate,
        title: expenseCategory,
        description: expenseDescription,
        amount: Number(expenseAmount),
        expenseType: 'branch', 
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "expenses"), expenseData);

      if (sendToGoogleSheet) {
        await sendToGoogleSheet({
          type: 'EXPENSE',
          ...expenseData
        });
      }

      alert('ব্রাঞ্চ খরচের হিসাব সফলভাবে সংরক্ষণ করা হয়েছে!');
      setExpenseCategory('');
      setExpenseDescription('');
      setExpenseAmount('');
    } catch (error) {
      alert('খরচ জমা দিতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setIsExpenseSubmitting(false);
    }
  };

  const totalAmount = (Number(tickets) || 0) * (Number(rate) || 0);

  const fontStyle = "'Hind Siliguri', 'Noto Serif Bengali', 'SolaimanLipi', sans-serif";

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontFamily: fontStyle }}>লোড হচ্ছে...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: fontStyle, maxWidth: '700px', margin: '0 auto', padding: '10px', color: '#F8FAFC' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        * { font-family: 'Hind Siliguri', 'Noto Serif Bengali', 'SolaimanLipi', sans-serif !important; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        .staff-nav-container {
          position: relative; display: flex; align-items: center; justify-content: space-between;
          padding: 4px; border-radius: 999px; background: #0A1422; border: 1px solid #1D3557;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4);
          margin-bottom: 10px; width: 100%; box-sizing: border-box;
        }
        .staff-nav-item {
          position: relative; flex: 1; height: 44px; display: flex; justify-content: center;
          align-items: center; text-decoration: none; color: #94A3B8; font-size: 14px;
          font-weight: 600; z-index: 2; transition: color 0.35s ease; cursor: pointer;
          text-align: center; padding: 0 6px; white-space: nowrap;
        }
        .staff-nav-item.active { color: #FFFFFF; }
        .staff-indicator {
          position: absolute; top: 4px; width: calc(50% - 4px); height: 44px;
          border-radius: 999px; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transition: left 0.35s cubic-bezier(0.34, 1.28, 0.74, 1); z-index: 1;
        }
        .tab-content { animation: fadeInSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="staff-nav-container">
        <div className="staff-indicator" style={{ left: activeTab === 0 ? '4px' : 'calc(50%)' }}></div>
        <div className={`staff-nav-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>🚌 কমিশন এন্ট্রি</div>
        <div className={`staff-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>💸 ব্রাঞ্চ খরচ এন্ট্রি</div>
      </div>

      {activeTab === 0 && (
        <div className="tab-content" style={{ backgroundColor: '#0D1B2A', padding: '24px 20px', borderRadius: '16px', border: '1px solid #1D3557' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700', color: '#F8FAFC' }}>🚌 স্টাফ ড্যাশবোর্ড (টিকেট ও কমিশন এন্ট্রি)</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>আপনার বরাদ্দকৃত কাউন্টার/বাস এবং কমিশন রেট দিয়ে তথ্য জমা দিন।</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>তারিখ</label>
              <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>কাউন্টার বা বাস সিলেক্ট করুন</label>
              <select value={selectedBus} onChange={handleBusChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none', cursor: 'pointer' }} required>
                <option value="" style={{ color: '#94A3B8', background: '#0A1422' }}>-- কাউন্টার বা পরিবহন সিলেক্ট করুন --</option>
                {staffBuses.map((bus, idx) => (
                  <option key={idx} value={bus.name} style={{ background: '#0A1422', color: '#F8FAFC' }}>{bus.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>বাসের ধরন</label>
                <select value={busType} onChange={e => setBusType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                  <option value="AC" style={{ background: '#0A1422', color: '#F8FAFC' }}>AC</option>
                  <option value="Non-AC" style={{ background: '#0A1422', color: '#F8FAFC' }}>Non-AC</option>
                  <option value="Business class" style={{ background: '#0A1422', color: '#F8FAFC' }}>Business class</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>রেটের ধরন</label>
                <select value={rateType} onChange={e => setRateType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                  <option value="fixed" style={{ background: '#0A1422', color: '#F8FAFC' }}>নির্দিষ্ট (টাকা)</option>
                  <option value="percentage" style={{ background: '#0A1422', color: '#F8FAFC' }}>পার্সেন্টেজ (%)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>কমিশন রেট</label>
                <input type="number" placeholder="রেট লিখুন" value={rate} onChange={e => setRate(e.target.value)} onWheel={e => e.target.blur()} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>টিকেট সংখ্যা</label>
                <input type="number" placeholder="সংখ্যা" value={tickets} onChange={e => setTickets(e.target.value)} onWheel={e => e.target.blur()} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
              </div>
            </div>

            <div style={{ background: '#0A1422', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1D3557', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8' }}>মোট কমিশন:</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>৳ {totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '13px', background: isSubmitting ? '#4B5563' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
              {isSubmitting ? 'জমা হচ্ছে...' : 'এন্ট্রি জমা দিন'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 1 && (
        <div className="tab-content" style={{ backgroundColor: '#0D1B2A', padding: '24px 20px', borderRadius: '16px', border: '1px solid #1D3557' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700', color: '#F8FAFC' }}>💸 ব্রাঞ্চ খরচ এন্ট্রি</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>আপনার ব্রাঞ্চের দৈনন্দিন খরচসমূহ এন্ট্রি দিন।</p>
          </div>

          <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>তারিখ</label>
              <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>খরচের ক্যাটাগরি</label>
              <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none', cursor: 'pointer' }} required>
                <option value="" style={{ color: '#94A3B8', background: '#0A1422' }}>-- ক্যাটাগরি সিলেক্ট করুন --</option>
                {EXPENSE_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat} style={{ background: '#0A1422', color: '#F8FAFC' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>খরচের বিবরণ (ঐচ্ছিক)</label>
              <input type="text" placeholder="বিবরণ লিখুন" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>পরিমাণ (টাকা)</label>
              <input type="number" placeholder="টাকা লিখুন" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} onWheel={e => e.target.blur()} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #1D3557', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
            </div>

            <button type="submit" disabled={isExpenseSubmitting} style={{ width: '100%', padding: '13px', background: isExpenseSubmitting ? '#4B5563' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: isExpenseSubmitting ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
              {isExpenseSubmitting ? 'জমা হচ্ছে...' : 'খরচ জমা দিন'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}