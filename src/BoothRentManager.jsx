import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where 
} from 'firebase/firestore';

export default function BoothRentManager() {
  const [rents, setRents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('August 26');
  const [isEditing, setIsEditing] = useState(null);
  
  // ফর্ম স্টেট (রেফারেন্স পিডিএফ অনুযায়ী)
  const [formData, setFormData] = useState({
    month: 'August 26',
    boothNo: '',
    companyName: '',
    monthlyRent: '',
    status: 'বাকি আছে',
    collectionDate: '',
    remarks: ''
  });

  const rentsCollectionRef = collection(db, 'boothRents');

  // ডেটা ফেচ করা
  const fetchRents = async () => {
    try {
      const data = await getDocs(rentsCollectionRef);
      setRents(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching booth rents: ", error);
    }
  };

  useEffect(() => {
    fetchRents();
  }, []);

  // সেভ বা আপডেট হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const rentDoc = doc(db, 'boothRents', isEditing);
        await updateDoc(rentDoc, formData);
        setIsEditing(null);
      } else {
        await addDoc(rentsCollectionRef, formData);
      }
      setFormData({
        month: selectedMonth,
        boothNo: '',
        companyName: '',
        monthlyRent: '',
        status: 'বাকি আছে',
        collectionDate: '',
        remarks: ''
      });
      fetchRents();
    } catch (error) {
      console.error("Error saving rent data: ", error);
    }
  };

  // এডিট করার জন্য ডেটা লোড করা
  const handleEdit = (rent) => {
    setIsEditing(rent.id);
    setFormData(rent);
  };

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই রেকর্ডটি ডিলিট করতে চান?')) {
      await deleteDoc(doc(db, 'boothRents', id));
      fetchRents();
    }
  };

  // মোট ভাড়া আয় হিসাব
  const totalRentIncome = rents
    .filter(r => r.month === selectedMonth)
    .reduce((sum, item) => sum + Number(item.monthlyRent || 0), 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">বুথ ভাড়া ব্যবস্থাপনা (একতা পরিবহন, আজমপুর)[cite: 20]</h2>
      
      {/* মাস সিলেকশন */}
      <div className="mb-4">
        <label className="font-semibold mr-2">মাসের নাম:</label>
        <input 
          type="text" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)} 
          className="border p-2 rounded"
        />
      </div>

      {/* ফর্ম */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded border">
        <input 
          type="text" placeholder="বুথ নং (যেমন: বুথ নং ০ঃ ০১)" value={formData.boothNo} 
          onChange={(e) => setFormData({...formData, boothNo: e.target.value})} className="border p-2 rounded" required 
        />
        <input 
          type="text" placeholder="ভাড়াটিয়া/কোম্পানির নাম" value={formData.companyName} 
          onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="border p-2 rounded" required 
        />
        <input 
          type="number" placeholder="মাসিক ভাড়া (টাকা)" value={formData.monthlyRent} 
          onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className="border p-2 rounded" required 
        />
        <select 
          value={formData.status} 
          onChange={(e) => setFormData({...formData, status: e.target.value})} className="border p-2 rounded"
        >
          <option value="বাকি আছে">বাকি আছে[cite: 20]</option>
          <option value="পরিশোধিত">পরিশোধিত</option>
        </select>
        <input 
          type="date" value={formData.collectionDate} 
          onChange={(e) => setFormData({...formData, collectionDate: e.target.value})} className="border p-2 rounded" 
        />
        <input 
          type="text" placeholder="মন্তব্য" value={formData.remarks} 
          onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="border p-2 rounded" 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded col-span-full font-semibold">
          {isEditing ? 'বুথ ভাড়া আপডেট করুন' : 'নতুন বুথ ভাড়া যোগ করুন'}
        </button>
      </form>

      {/* টেবিল */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">বুথ নং</th>
              <th className="border p-2">ভাড়াটিয়া/কোম্পানির নাম</th>
              <th className="border p-2">মাসিক ভাড়া (টাকা)</th>
              <th className="border p-2">আদায়ের অবস্থা</th>
              <th className="border p-2">আদায়ের তারিখ</th>
              <th className="border p-2">মন্তব্য</th>
              <th className="border p-2">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {rents.filter(r => r.month === selectedMonth).map((rent) => (
              <tr key={rent.id} className="hover:bg-gray-50">
                <td className="border p-2">{rent.boothNo}</td>
                <td className="border p-2">{rent.companyName}</td>
                <td className="border p-2">৳{rent.monthlyRent}</td>
                <td className="border p-2">{rent.status}</td>
                <td className="border p-2">{rent.collectionDate}</td>
                <td className="border p-2">{rent.remarks}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleEdit(rent)} className="bg-yellow-500 text-white px-2 py-1 rounded">এডিট</button>
                  <button onClick={() => handleDelete(rent.id)} className="bg-red-600 text-white px-2 py-1 rounded">ডিলিট</button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td colSpan="2" className="border p-2 text-right">মোট ভাড়া আয়ঃ[cite: 20]</td>
              <td colSpan="5" className="border p-2 text-blue-600">৳{totalRentIncome}[cite: 20]</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}