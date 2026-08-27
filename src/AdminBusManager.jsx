import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STAFF_EMAILS = [
  'misuk@aj.com',
  'asif@aj.com',
  'jahid@aj.com',
  'anwar@aj.com',
  'nasim@aj.com',
  'toufik@aj.com',
  'manam@aj.com'
];

export default function AdminBusManager() {
  const [selectedStaff, setSelectedStaff] = useState(STAFF_EMAILS[0]);
  const [buses, setBuses] = useState([]);
  const [newBusName, setNewBusName] = useState('');
  const [newBusRate, setNewBusRate] = useState('');
  const [loading, setLoading] = useState(false);

  // স্টাফ পরিবর্তনের সাথে সাথে ডেটাবেজ থেকে তার বাস ও রেট লোড করা
  useEffect(() => {
    fetchStaffBuses(selectedStaff);
  }, [selectedStaff]);

  const fetchStaffBuses = async (email) => {
    setLoading(true);
    try {
      const docRef = doc(db, "staffConfigs", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBuses(docSnap.data().buses || []);
      } else {
        setBuses([]); // যদি ডেটা না থাকে
      }
    } catch (error) {
      console.error("Error fetching staff buses: ", error);
    }
    setLoading(false);
  };

  // নতুন বাস যোগ করা
  const handleAddBus = (e) => {
    e.preventDefault();
    if (!newBusName || !newBusRate) {
      return alert('বাসের নাম এবং কমিশন রেট উভয়ই দিন!');
    }

    const updatedBuses = [...buses, { name: newBusName, rate: newBusRate }];
    setBuses(updatedBuses);
    setNewBusName('');
    setNewBusRate('');
  };

  // বাস ডিলিট করা
  const handleDeleteBus = (index) => {
    const updatedBuses = buses.filter((_, i) => i !== index);
    setBuses(updatedBuses);
  };

  // রেট বা নাম এডিট করা
  const handleBusChange = (index, field, value) => {
    const updatedBuses = [...buses];
    updatedBuses[index][field] = value;
    setBuses(updatedBuses);
  };

  // ফায়ারস্টোরে সেভ বা আপডেট করা
  const handleSaveToDatabase = async () => {
    try {
      const docRef = doc(db, "staffConfigs", selectedStaff);
      await setDoc(docRef, { buses: updatedBusesClean(buses) });
      alert('সফলভাবে স্টাফের বাস ও কমিশন রেট আপডেট করা হয়েছে!');
    } catch (error) {
      alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const updatedBusesClean = (list) => list;

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Hind Siliguri', sans-serif" }}>
      <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>🛠️ এডমিন: স্টাফ বাস ও কমিশন রেট ম্যানেজমেন্ট</h3>
      
      {/* স্টাফ সিলেক্ট করার ড্রপডাউন */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
          স্টাফ সিলেক্ট করুন (ইমেইল)
        </label>
        <select 
          value={selectedStaff} 
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        >
          {STAFF_EMAILS.map((email, idx) => (
            <option key={idx} value={email}>{email}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <>
          {/* বর্তমান বাসগুলোর তালিকা ও এডিট করার অপশন */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '15px', color: '#334155', marginBottom: '10px' }}>বরাদ্দকৃত বাস ও রেট তালিকা:</h4>
            {buses.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>এই স্টাফের জন্য এখনো কোনো বাস যোগ করা হয়নি।</p>
            ) : (
              buses.map((bus, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={bus.name} 
                    onChange={(e) => handleBusChange(index, 'name', e.target.value)}
                    style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    placeholder="বাসের নাম"
                  />
                  <input 
                    type="number" 
                    value={bus.rate} 
                    onChange={(e) => handleBusChange(index, 'rate', e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    placeholder="রেট (টাকা)"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteBus(index)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ডিলিট
                  </button>
                </div>
              ))
            )}
          </div>

          {/* নতুন বাস যোগ করার ফর্ম */}
          <form onSubmit={handleAddBus} style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '14px', color: '#1e293b', marginBottom: '10px' }}>➕ নতুন বাস যোগ করুন</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="বাসের নাম (যেমন: হানিফ পরিবহন)" 
                value={newBusName} 
                onChange={(e) => setNewBusName(e.target.value)}
                style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input 
                type="number" 
                placeholder="রেট" 
                value={newBusRate} 
                onChange={(e) => setNewBusRate(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button 
                type="submit" 
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                যোগ করুন
              </button>
            </div>
          </form>

          {/* ফাইনাল সেভ বাটন */}
          <button 
            type="button" 
            onClick={handleSaveToDatabase}
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
          >
            পরিবর্তনগুলো ডেটাবেজে সেভ করুন
          </button>
        </>
      )}
    </div>
  );
}