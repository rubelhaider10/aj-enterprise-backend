import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const SalarySheetManagement = () => {
  // ব্রাঞ্চের তালিকা
  const branches = [
    "একতা পরিবহন_আজমপুর",
    "এস আর ট্রাভেলস_আব্দুল্লাহপুর",
    "হানিফ এন্টারপ্রাইজ_আব্দুল্লাহপুর",
    "লাবিব কাউন্টার মালেকা বানু",
    "অন্যান্য ব্রাঞ্চ ১",
    "অন্যান্য ব্রাঞ্চ ২"
  ];

  // বর্তমান মাস স্বয়ংক্রিয়ভাবে বের করার জন্য
  const getCurrentMonth = () => {
    const date = new Date();
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('bn-BD', options); // বাংলায় মাসের নাম দেখানোর জন্য
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "salaries"), (snapshot) => {
        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setSalaryList(list);
    });
    return () => unsubscribe();
  }, []);

  // ফর্মের স্টেট
  const [formData, setFormData] = useState({
    month: getCurrentMonth(),
    staffId: '',
    staffName: '',
    branch: branches[0],
    designation: '',
    basicSalary: '',
    leaveDeduction: 0,
    advanceSalary: 0,
    totalPayable: 0,
    status: 'অপরিশোধ'
  });

  // সমস্ত বেতনের তালিকা সংরক্ষণের জন্য স্টেট
  const [salaryList, setSalaryList] = useState([]);

  // মূল বেতন, ছুটি কর্তন বা অগ্রিম পরিবর্তন হলে মোট প্রদেয় বেতন অটো ক্যালকুলেশন
  useEffect(() => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const deduction = parseFloat(formData.leaveDeduction) || 0;
    const advance = parseFloat(formData.advanceSalary) || 0;
    
    const total = basic - deduction - advance;
    setFormData(prev => ({ ...prev, totalPayable: total > 0 ? total : 0 }));
  }, [formData.basicSalary, formData.leaveDeduction, formData.advanceSalary]);

  // ইনপুট হ্যান্ডলার
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await addDoc(collection(db, "salaries"), formData);

          setFormData({
              month: getCurrentMonth(),
              staffId: '',
              staffName: '',
              branch: branches[0],
              designation: '',
              basicSalary: '',
              leaveDeduction: 0,
              advanceSalary: 0,
              totalPayable: 0,
              status: 'অপরিশোধ'
          });
          alert('বেতন এন্ট্রি সফলভাবে যুক্ত করা হয়েছে!');
      } catch (error) {
          console.error("ডেটা সেভ করতে সমস্যা হয়েছে: ", error);
          alert('ডেটা সেভ করা যায়নি, আবার চেষ্টা করুন।');
      }
  };

  // এন্ট্রি ডিলিট করার হ্যান্ডলার
  const handleDelete = async (id) => {
      if (window.confirm("আপনি কি নিশ্চিতভাবে এই বেতন এন্ট্রিটি মুছে ফেলতে চান?")) {
          try {
              await deleteDoc(doc(db, "salaries", id));
              alert('এন্ট্রি সফলভাবে ডিলিট করা হয়েছে!');
          } catch (error) {
              console.error("ডিলিট করতে সমস্যা হয়েছে: ", error);
              alert('এন্ট্রি ডিলিট করা যায়নি।');
          }
      }
  };

  // ডেটা আপডেট বা এডিট করার হ্যান্ডলার (যেমন: স্ট্যাটাস পরিবর্তন)
  const handleStatusToggle = async (item) => {
      const newStatus = item.status === 'পরিশোধ' ? 'অপরিশোধ' : 'পরিশোধ';
      try {
          const salaryRef = doc(db, "salaries", item.id);
          await updateDoc(salaryRef, { status: newStatus });
      } catch (error) {
          console.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে: ", error);
          alert('স্ট্যাটাস পরিবর্তন করা যায়নি।');
      }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">স্টাফের নতুন বেতন এন্ট্রি ও ব্যবস্থাপনা</h2>

      {/* বেতন এন্ট্রি ফর্ম */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-6 border">
        
        {/* মাস (অটো আপডেট) */}
        <div>
          <label className="block text-sm font-semibold mb-1">মাস</label>
          <input 
            type="text" 
            name="month" 
            value={formData.month} 
            readOnly 
            className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* ব্রাঞ্চ নির্বাচন */}
        <div>
          <label className="block text-sm font-semibold mb-1">ব্রাঞ্চের নাম</label>
          <select 
            name="branch" 
            value={formData.branch} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
          >
            {branches.map((b, index) => (
              <option key={index} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* স্টাফ আইডি */}
        <div>
          <label className="block text-sm font-semibold mb-1">স্টাফ আইডি নং</label>
          <input 
            type="text" 
            name="staffId" 
            value={formData.staffId} 
            onChange={handleChange} 
            placeholder="যেমন: SR-101" 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* স্টাফের নাম */}
        <div>
          <label className="block text-sm font-semibold mb-1">স্টাফের নাম</label>
          <input 
            type="text" 
            name="staffName" 
            value={formData.staffName} 
            onChange={handleChange} 
            placeholder="নাম লিখুন" 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* পদবী */}
        <div>
          <label className="block text-sm font-semibold mb-1">পদবী</label>
          <input 
            type="text" 
            name="designation" 
            value={formData.designation} 
            onChange={handleChange} 
            placeholder="যেমন: ম্যানেজার / ক্যাশিয়ার" 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* মূল বেতন */}
        <div>
          <label className="block text-sm font-semibold mb-1">মূল বেতন (৳)</label>
          <input 
            type="number" 
            name="basicSalary" 
            value={formData.basicSalary} 
            onChange={handleChange} 
            placeholder="০.০০" 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* অবৈতনিক ছুটি কর্তন */}
        <div>
          <label className="block text-sm font-semibold mb-1">অবৈতনিক ছুটি কর্তন (৳)</label>
          <input 
            type="number" 
            name="leaveDeduction" 
            value={formData.leaveDeduction} 
            onChange={handleChange} 
            placeholder="০.০০" 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* অগ্রিম বেতন */}
        <div>
          <label className="block text-sm font-semibold mb-1">অগ্রিম বেতন কর্তন (৳)</label>
          <input 
            type="number" 
            name="advanceSalary" 
            value={formData.advanceSalary} 
            onChange={handleChange} 
            placeholder="০.০০" 
            className="w-full p-2 border rounded"
          />
        </div>

        {/* মোট প্রদেয় বেতন (অটো ক্যালকুলেটেড) */}
        <div>
          <label className="block text-sm font-semibold mb-1">মোট প্রদেয় বেতন (৳)</label>
          <input 
            type="number" 
            name="totalPayable" 
            value={formData.totalPayable} 
            readOnly 
            className="w-full p-2 border rounded bg-gray-100 font-bold text-green-700"
          />
        </div>

        {/* স্ট্যাটাস */}
        <div>
          <label className="block text-sm font-semibold mb-1">স্ট্যাটাস</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
          >
            <option value="অপরিশোধ">অপরিশোধ</option>
            <option value="পরিশোধ">পরিশোধ</option>
          </select>
        </div>

        {/* সাবমিট বাটন */}
        <div className="md:col-span-3 flex justify-end mt-4">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            বেতন এন্ট্রি সেভ করুন
          </button>
        </div>

      </form>

      {/* ব্রাঞ্চভিত্তিক বেতন তালিকা টেবিল */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-700">ব্রাঞ্চভিত্তিক স্টাফ বেতন খাতা</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">মাস</th>
                <th className="border p-2">ব্রাঞ্চ</th>
                <th className="border p-2">আইডি</th>
                <th className="border p-2">নাম</th>
                <th className="border p-2">পদবী</th>
                <th className="border p-2">মূল বেতন</th>
                <th className="border p-2">ছুটি কর্তন</th>
                <th className="border p-2">অগ্রিম</th>
                <th className="border p-2">মোট প্রদেয়</th>
                <th className="border p-2">স্ট্যাটাস</th>
                <th className="border p-2 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {salaryList.length > 0 ? (
                salaryList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2">{item.month}</td>
                    <td className="border p-2 font-medium">{item.branch}</td>
                    <td className="border p-2">{item.staffId}</td>
                    <td className="border p-2">{item.staffName}</td>
                    <td className="border p-2">{item.designation}</td>
                    <td className="border p-2">{item.basicSalary}৳</td>
                    <td className="border p-2 text-red-600">-{item.leaveDeduction}৳</td>
                    <td className="border p-2 text-red-600">-{item.advanceSalary}৳</td>
                    <td className="border p-2 font-bold text-green-600">{item.totalPayable}৳</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs ${item.status === 'পরিশোধ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="border p-2 text-center space-x-2">
                      <button 
                        onClick={() => handleStatusToggle(item)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition"
                      >
                        স্ট্যাটাস বদল
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
                      >
                        ডিলিট
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500">কোনো বেতন এন্ট্রি পাওয়া যায়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SalarySheetManagement;