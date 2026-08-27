import React, { useState, useEffect } from 'react';
import BranchManager from './admin/BranchManager';
import StaffBusManagement from './admin/StaffBusManagement';
import CounterAccounts from './admin/CounterAccounts';
import SalarySheet from './admin/SalarySheet';
import Countersheetdetails from './admin/Countersheetdetails';
import RecycleBin from './admin/RecycleBin';
import { 
  subscribeBooths, 
  subscribeSales, 
  subscribeExpenses, 
  subscribeSalaries, 
  subscribeCounters,
  createStaffService, 
  updateStaffService, 
  setStaffDeletedStatus, 
  permanentDeleteStaffService, 
  addBoothService, 
  updateBoothRentService, 
  setBoothDeletedStatus, 
  permanentDeleteBoothService, 
  addExpenseService, 
  setExpenseDeletedStatus, 
  permanentDeleteExpenseService, 
  addSalaryService, 
  setSalaryDeletedStatus, 
  permanentDeleteSalaryService,
  setSaleDeletedStatus,
  permanentDeleteSaleService,
  addCounterService,
  updateCounterService,
  setCounterDeletedStatus,
  permanentDeleteCounterService,
  changeStaffPasswordService
} from './dbService';

const INITIAL_COUNTERS = [
  "হানিফ এন্টারপ্রাইজ-আব্দুল্লাহপুর",
  "একতা পরিবহন-আজমপুর",
  "এস আর ট্রাভেলস-আব্দুল্লাহপুর", 
  "ইমাদ কাউন্টার মালেকা বানু"
];

const getErrorMessage = (error, fallback = 'অজানা একটি সমস্যা হয়েছে।') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || error.error || error.details || error.statusText || fallback;
};

export default function AdminPanel({ staffDataMap = {} }) {
  const [activeTab, setActiveTab] = useState('staff');

  const [isAddingCounter, setIsAddingCounter] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
  const [isAddingBooth, setIsAddingBooth] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [counters, setCounters] = useState([]);
  const [newDynamicCounterInput, setNewDynamicCounterInput] = useState('');
  const [editingCounterId, setEditingCounterId] = useState(null);
  const [editedCounterName, setEditedCounterName] = useState('');
  const [isCounterSectionOpen, setIsCounterSectionOpen] = useState(false);
  const [isSalaryTableOpen, setIsSalaryTableOpen] = useState(false);

  const [booths, setBooths] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    const unsubCounters = subscribeCounters(setCounters);
    const unsubBooths = subscribeBooths(setBooths);
    const unsubSales = subscribeSales(setSales);
    const unsubExpenses = subscribeExpenses(setExpenses);
    const unsubSalaries = subscribeSalaries(setSalaries);

    return () => {
      unsubCounters();
      unsubBooths();
      unsubSales();
      unsubExpenses();
      unsubSalaries();
    };
  }, []);

  const activeCountersList = counters
    .filter(c => !c.isDeleted)
    .map(c => c.name || c.counterName || c);

  const countersList = activeCountersList.length > 0 ? activeCountersList : INITIAL_COUNTERS;

  const handleAddNewCounter = async () => {
    if (isAddingCounter) return;
    if (!newDynamicCounterInput.trim()) return alert('দয়া করে কাউন্টারের নাম লিখুন!');
    if (countersList.some(c => c.trim().toLowerCase() === newDynamicCounterInput.trim().toLowerCase())) {
      return alert('এই কাউন্টারটি ইতিমধ্যে তালিকায় রয়েছে!');
    }
    setIsAddingCounter(true);
    try {
      await addCounterService({
        name: newDynamicCounterInput.trim(),
        isDeleted: false
      });
      setNewDynamicCounterInput('');
      alert('নতুন কাউন্টার সফলভাবে ফায়ারবেসে যুক্ত করা হয়েছে!');
    } catch (error) {
      alert('কাউন্টার যুক্ত করতে সমস্যা: ' + getErrorMessage(error));
    } finally {
      setIsAddingCounter(false);
    }
  };

  const handleDeleteCounter = async (counterObjOrName) => {
    const counterName = typeof counterObjOrName === 'object' ? counterObjOrName.name : counterObjOrName;
    const targetObj = counters.find(c => (c.name || c) === counterName);

    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${counterName}" কাউন্টারটি রিসাইকেল বিনে পাঠাতে চান?`)) {
      try {
        if (targetObj && targetObj.id) {
          await setCounterDeletedStatus(targetObj.id, true);
        } else {
          const found = counters.find(c => c.name === counterName);
          if (found) await setCounterDeletedStatus(found.id, true);
        }
        alert('কাউন্টারটি রিসাইকেল বিনে পাঠানো হয়েছে!');
      } catch (error) {
        alert('রিসাইকেল বিনে পাঠাতে সমস্যা: ' + getErrorMessage(error));
      }
    }
  };

  const handleRestoreCounter = async (counterObj) => {
    try {
      await setCounterDeletedStatus(counterObj.id, false);
      alert('কাউন্টারটি সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (error) {
      alert('রিস্টোর করতে সমস্যা: ' + getErrorMessage(error));
    }
  };

  const handlePermanentDeleteCounter = async (counterObj) => {
    if (!window.confirm(`⚠️ সতর্কবাণী: "${counterObj.name}" কাউন্টারটি চিরতরে মুছে ফেলতে চান?`)) return;
    try {
      await permanentDeleteCounterService(counterObj.id);
      alert('কাউন্টারটি চিরতরে ডিলিট করা হয়েছে!');
    } catch (error) {
      alert('চিরতরে ডিলিট করতে সমস্যা: ' + getErrorMessage(error));
    }
  };

  const handleEditCounterClick = (counterObj) => {
    setEditingCounterId(counterObj.id);
    setEditedCounterName(counterObj.name);
  };

  const handleSaveCounterEdit = async (counterId) => {
    if (!editedCounterName.trim()) return alert('কাউন্টারের নাম খালি রাখা যাবে না!');
    if (countersList.some(c => c !== editedCounterName && c.trim().toLowerCase() === editedCounterName.trim().toLowerCase())) {
      return alert('এই নামের কাউন্টার ইতিমধ্যে তালিকায় রয়েছে!');
    }

    try {
      await updateCounterService(counterId, { name: editedCounterName.trim() });
      setEditingCounterId(null);
      setEditedCounterName('');
      alert('কাউন্টারের তথ্য সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      alert('আপডেট করতে সমস্যা: ' + getErrorMessage(error));
    }
  };

  const ALL_REPORT_COUNTERS = [
    ...countersList,
    "অনির্দিষ্ট/অন্যান্য কাউন্টার"
  ];

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCategory, setNewCategory] = useState('counter');
  const [newBuses, setNewBuses] = useState('');
  const [newBranch, setNewBranch] = useState(countersList[0] || '');
  
  const [selectedStaffEmail, setSelectedStaffEmail] = useState('');
  const [editCategory, setEditCategory] = useState('counter');
  const [editBuses, setEditBuses] = useState('');
  const [editBasicSalary, setEditBasicSalary] = useState('');
  const [editAdvanceSalary, setEditAdvanceSalary] = useState('');
  const [editBranch, setEditBranch] = useState(countersList[0] || '');
  const [editPassword, setEditPassword] = useState('');

  const [newCounter, setNewCounter] = useState(countersList[0] || '');
  const [newBoothNo, setNewBoothNo] = useState('');
  const [newTenant, setNewTenant] = useState('');
  const [newRent, setNewRent] = useState('');

  const [expenseCounter, setExpenseCounter] = useState(countersList[0] || '');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [openCounters, setOpenCounters] = useState({});

  const toggleCounterAccordion = (counterName) => {
    setOpenCounters(prev => ({
      ...prev,
      [counterName]: !prev[counterName]
    }));
  };

  const getCurrentMonthString = () => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  useEffect(() => {
    if (!countersList || countersList.length === 0) return;

    const firstCounter = countersList[0];

    setNewBranch(prev => prev && countersList.includes(prev) ? prev : firstCounter);
    setEditBranch(prev => prev && countersList.includes(prev) ? prev : firstCounter);
    setNewCounter(prev => prev && countersList.includes(prev) ? prev : firstCounter);
    setExpenseCounter(prev => prev && countersList.includes(prev) ? prev : firstCounter);

    setSalaryForm(prev => ({
      ...prev,
      branch: prev.branch && countersList.includes(prev.branch)
        ? prev.branch
        : firstCounter
    }));
  }, [countersList.join('|')]);
  
  const [salaryForm, setSalaryForm] = useState({
    month: getCurrentMonthString(),
    staffName: '',
    branch: countersList[0] || '',
    staffId: '',
    designation: '',
    transportName: 'একতা ট্রান্সপোর্ট',
    basicSalary: '',
    daysInMonth: '31',
    absentDays: '0', 
    unpaidLeaveDeduction: '0', 
    advanceSalary: '0',
    totalPayable: '', 
    paymentStatus: 'অপরিশোধ'
  });

  const generateMonthOptions = () => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); 
    const currentFullYear = currentDate.getFullYear();
    const options = [];

    for (let i = -6; i <= 6; i++) {
      let d = new Date(currentFullYear, currentMonthIndex + i, 1);
      let mName = months[d.getMonth()];
      let yShort = d.getFullYear().toString().slice(-2);
      options.push(`${mName} ${yShort}`);
    }
    return options;
  };

  const formatDateToCustom = (dateString) => {
    if (!dateString) return '';
    let d;
    if (dateString && typeof dateString.toDate === 'function') {
      d = dateString.toDate();
    } else {
      d = new Date(dateString);
    }
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const matchMonth = (dateVal, targetMonthStr) => {
    if (!dateVal || !targetMonthStr) return false;
    
    let d;
    if (dateVal && typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    } else if (typeof dateVal === 'string' && dateVal.includes('-') && dateVal.split('-')[0].length === 2) {
      const parts = dateVal.split('-');
      const day = parts[0];
      const mStr = parts[1].toUpperCase();
      const yr = parts[2];
      const monthMapNum = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'};
      d = new Date(`20${yr}-${monthMapNum[mStr] || '01'}-${day}`);
    } else {
      d = new Date(dateVal);
    }

    if (!d || isNaN(d.getTime())) return false;

    const parts = targetMonthStr.split(' ');
    if (parts.length < 2) return false;
    const targetFullMonth = parts[0].toUpperCase();
    const targetYear = parts[1];

    const monthMap = {
      'JANUARY': 0, 'FEBRUARY': 1, 'MARCH': 2, 'APRIL': 3,
      'MAY': 4, 'JUNE': 5, 'JULY': 6, 'AUGUST': 7,
      'SEPTEMBER': 8, 'OCTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11
    };

    const targetMonthIndex = monthMap[targetFullMonth];
    if (targetMonthIndex === undefined) return false;

    return d.getMonth() === targetMonthIndex && String(d.getFullYear()).slice(-2) === targetYear;
  };

  useEffect(() => {
    if (selectedStaffEmail && staffDataMap?.[selectedStaffEmail]) {
      const staff = staffDataMap[selectedStaffEmail];
      setEditCategory(staff.category || 'counter');
      setEditBuses(staff.buses ? staff.buses.join(', ') : '');
      setEditBasicSalary(staff.basicsalary !== undefined ? staff.basicsalary : (staff.basicSalary || '15000'));
      setEditAdvanceSalary(staff.advancesalary !== undefined ? staff.advancesalary : (staff.advanceSalary || '0'));
      setEditBranch(staff.branch || countersList[0]);
      setEditPassword('');
    }
  }, [selectedStaffEmail]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (isAddingStaff) return;

    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    const password = newPassword;
    const branch = newBranch.trim();
    const category = newCategory.trim().toLowerCase();

    if (!name || !email || !password || !branch) {
      return alert('দয়া করে সবগুলো প্রয়োজনীয় ঘর পূরণ করুন!');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert('দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন!');
    }

    if (password.length < 6) {
      return alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
    }

    if (category === 'counter' && !newBuses.trim()) {
      return alert('কাউন্টার স্টাফের জন্য বাসের তালিকা দিন!');
    }

    const busesArray =
      category === 'counter'
        ? [...new Set(
            newBuses
              .split(',')
              .map(bus => bus.trim())
              .filter(Boolean)
          )]
        : [];

    if (!countersList.includes(branch)) {
      return alert('নির্বাচিত কাউন্টারটি বর্তমানে সক্রিয় তালিকায় নেই!');
    }

    const existingActiveStaff = Object.keys(staffDataMap || {}).some(
      staffEmail => staffEmail.trim().toLowerCase() === email
    );

    if (existingActiveStaff) {
      return alert('এই ইমেইল দিয়ে একজন স্টাফ ইতিমধ্যে নিবন্ধিত আছে!');
    }

    setIsAddingStaff(true);

    try {
      const result = await createStaffService({
        newName: name,
        newEmail: email,
        newPassword: password,
        newBranch: branch,
        category,
        buses: busesArray,
        isDeleted: false
      });

      if (result?.success) {
        alert('✅ নতুন স্টাফ সফলভাবে যুক্ত করা হয়েছে!');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewBuses('');
        setNewCategory('counter');
        setNewBranch(countersList[0] || '');
      } else {
        alert('স্টাফ যুক্ত করতে সমস্যা: ' + getErrorMessage(result, 'স্টাফ তৈরি করা যায়নি।'));
      }
    } catch (error) {
      alert('স্টাফ যুক্ত করতে সমস্যা: ' + getErrorMessage(error, 'Firebase থেকে স্টাফ তৈরি করা যায়নি।'));
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (isUpdatingStaff) return;

    if (!selectedStaffEmail) {
      return alert('দয়া করে একজন স্টাফ সিলেক্ট করুন!');
    }

    setIsUpdatingStaff(true);

    try {
      const busesArray =
        editCategory.toLowerCase() === 'counter' && editBuses
          ? editBuses
              .split(',')
              .map((b) => b.trim())
              .filter(Boolean)
          : [];

      await updateStaffService(selectedStaffEmail, {
        branch: editBranch,
        category: editCategory.toLowerCase(),
        buses: busesArray,
        basicSalary: Number(editBasicSalary) || 0,
        advanceSalary: Number(editAdvanceSalary) || 0
      });

      const newPassword = String(editPassword || '').trim();

      if (!newPassword) {
        alert('স্টাফের তথ্য সফলভাবে আপডেট করা হয়েছে!');
        return;
      }

      if (newPassword.length < 6) {
        alert('স্টাফের তথ্য আপডেট হয়েছে, কিন্তু পাসওয়ার্ড পরিবর্তন হয়নি।\n\nকমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।');
        return;
      }

      setIsChangingPassword(true);

      const pwdResult = await changeStaffPasswordService(
        selectedStaffEmail,
        newPassword
      );

      if (pwdResult?.success === true) {
        alert('স্টাফের তথ্য ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
        setEditPassword('');
      } else {
        const message = getErrorMessage(pwdResult, 'পাসওয়ার্ড পরিবর্তন করা যায়নি।');
        alert('স্টাফের তথ্য আপডেট হয়েছে,\n\nকিন্তু পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে:\n' + message);
      }
    } catch (error) {
      alert('স্টাফের তথ্য আপডেট করতে সমস্যা হয়েছে:\n' + getErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
      setIsUpdatingStaff(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaffEmail) return alert('দয়া করে মুছে ফেলার জন্য একজন স্টাফ সিলেক্ট করুন!');
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${selectedStaffEmail} কে রিসাইকেল বিনে পাঠাতে চান?`)) return;
    try {
      await setStaffDeletedStatus(selectedStaffEmail, true);
      alert('স্টাফ রিসাইকেল বিনে পাঠানো হয়েছে!');
      setSelectedStaffEmail('');
      setEditBuses('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreStaff = async (email) => {
    try {
      await setStaffDeletedStatus(email, false);
      alert('স্টাফ সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermanentDeleteStaff = async (email) => {
    if (!window.confirm(`⚠️ সতর্কবাণী: ${email} স্টাফটিকে ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান? এটি আর ফেরানো যাবে না!`)) return;
    try {
      await permanentDeleteStaffService(email);
      alert('স্টাফ সফলভাবে চিরতরে ডিলিট করা হয়েছে!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreBooth = async (id) => {
    try {
      await setBoothDeletedStatus(id, false);
      alert('বুথ সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (e) {}
  };

  const handlePermanentDeleteBooth = async (id) => {
    if (!window.confirm('এই বুথটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      await permanentDeleteBoothService(id);
      alert('বুথ চিরতরে ডিলিট করা হয়েছে!');
    } catch (e) {}
  };

  const handleRestoreExpense = async (id) => {
    try {
      await setExpenseDeletedStatus(id, false);
      alert('খরচ সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (e) {}
  };

  const handlePermanentDeleteExpense = async (id) => {
    if (!window.confirm('এই খরচের রেকর্ডটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      await permanentDeleteExpenseService(id);
      alert('খরচ চিরতরে ডিলিট করা হয়েছে!');
    } catch (e) {}
  };

  const handleRestoreSalary = async (id) => {
    try {
      await setSalaryDeletedStatus(id, false);
      alert('বেতনের রেকর্ড পুনরুদ্ধার করা হয়েছে!');
    } catch (e) {}
  };

  const handlePermanentDeleteSalary = async (id) => {
    if (!window.confirm('এই বেতনের রেকর্ডটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      await permanentDeleteSalaryService(id);
      alert('বেতনের রেকর্ড চিরতরে ডিলিট করা হয়েছে!');
    } catch (e) {}
  };

  const handleRestoreSale = async (id) => {
    try {
      await setSaleDeletedStatus(id, false);
      alert('বিক্রয়ের রেকর্ড সফলভাবে পুনরুদ্ধার করা হয়েছে!');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermanentDeleteSale = async (id) => {
    if (!window.confirm('এই বিক্রয়ের রেকর্ডটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      await permanentDeleteSaleService(id);
      alert('বিক্রয়ের রেকর্ড চিরতরে ডিলিট করা হয়েছে!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddBooth = async (e) => {
    e.preventDefault();
    if (isAddingBooth) return;
    if (!newBoothNo || !newTenant || !newRent) return alert('সকল ঘর পূরণ করুন!');
    setIsAddingBooth(true);
    try {
      await addBoothService({
        counterName: newCounter,
        boothNo: newBoothNo,
        tenantName: newTenant,
        rent: Number(newRent),
        isDeleted: false
      });
      alert('নতুন বুথ ও ভাড়া যুক্ত হয়েছে!');
      setNewBoothNo(''); setNewTenant(''); setNewRent('');
    } catch (error) {
      alert('বুথ যুক্ত করতে সমস্যা: ' + getErrorMessage(error));
    } finally {
      setIsAddingBooth(false);
    }
  };

  const handleRentChange = async (id, newRentValue) => {
    try {
      await updateBoothRentService(id, Number(newRentValue));
    } catch (error) {
      console.error("ভাড়া আপডেট করতে সমস্যা:", error);
    }
  };

  const handleDeleteBooth = async (id) => {
    if (window.confirm('এই বুথ ভাড়া তালিকাটি রিসাইকেল বিনে পাঠাতে চান?')) {
      try {
        await setBoothDeletedStatus(id, true);
      } catch (error) {}
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (isAddingExpense) return;
    if (!expenseTitle || !expenseAmount || !expenseDate || !expenseCounter) return alert('সকল ঘর পূরণ করুন!');
    setIsAddingExpense(true);
    try {
      const formattedDate = formatDateToCustom(expenseDate);
      await addExpenseService({
        counterName: expenseCounter,
        title: expenseTitle,
        description: expenseTitle,
        amount: Number(expenseAmount) || 0,
        date: formattedDate,
        addedBy: 'admin',
        expenseType: 'admin',
        isDeleted: false
      });
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      alert('খরচ সফলভাবে যুক্ত করা হয়েছে!');
    } catch (error) {
      alert('খরচ যোগ করতে সমস্যা: ' + getErrorMessage(error));
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('এই খরচের রেকর্ডটি রিসাইকেল বিনে পাঠাতে চান?')) {
      try {
        await setExpenseDeletedStatus(id, true);
      } catch (error) {}
    }
  };

  const calculateSalaryDetails = (basic, daysInMonth, absentDays, advance) => {
    const b = Number(basic) || 0;
    const dim = Number(daysInMonth) || 30;
    const ad = Number(absentDays) || 0;
    const adv = Number(advance) || 0;

    const perDaySalary = dim > 0 ? b / dim : 0;
    const deduction = Number((ad * perDaySalary).toFixed(2));
    const total = Number((b - deduction - adv).toFixed(2));

    return { deduction, total };
  };

  const handleSalaryInputChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...salaryForm, [name]: value };

    if (['basicSalary', 'daysInMonth', 'absentDays', 'advanceSalary'].includes(name)) {
      const { deduction, total } = calculateSalaryDetails(
        updatedForm.basicSalary,
        updatedForm.daysInMonth,
        updatedForm.absentDays,
        updatedForm.advanceSalary
      );
      updatedForm.unpaidLeaveDeduction = deduction;
      updatedForm.totalPayable = total;
    }

    setSalaryForm(updatedForm);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (isSavingSalary) return;
    if (!salaryForm.staffName || !salaryForm.staffId || !salaryForm.basicSalary) {
      return alert('দয়া করে প্রয়োজনীয় ঘরগুলো পূরণ করুন!');
    }
    setIsSavingSalary(true);
    try {
      await addSalaryService({
        ...salaryForm,
        basicSalary: Number(salaryForm.basicSalary) || 0,
        absentDays: Number(salaryForm.absentDays) || 0,
        unpaidLeaveDeduction: Number(salaryForm.unpaidLeaveDeduction) || 0,
        advanceSalary: Number(salaryForm.advanceSalary) || 0,
        totalPayable: Number(salaryForm.totalPayable) || 0,
        isDeleted: false
      });
      alert('বেতনের রেকর্ড সফলভাবে সেভ করা হয়েছে!');
      setSalaryForm({
        month: selectedMonth,
        staffName: '',
        branch: countersList[0] || '',
        staffId: '',
        designation: '',
        transportName: 'একতা ট্রান্সপোর্ট',
        basicSalary: '',
        daysInMonth: '31',
        absentDays: '0',
        unpaidLeaveDeduction: '0',
        advanceSalary: '0',
        totalPayable: '',
        paymentStatus: 'অপরিশোধ'
      });
    } catch (error) {
      alert('বেতন সেভ করতে সমস্যা: ' + getErrorMessage(error));
    } finally {
      setIsSavingSalary(false);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (window.confirm('এই বেতনের রেকর্ডটি রিসাইকেল বিনে পাঠাতে চান?')) {
      try {
        await setSalaryDeletedStatus(id, true);
      } catch (error) {}
    }
  };

  const activeStaffs = Object.keys(staffDataMap || {}).filter(email => {
    if (email === 'admin@aj.com') return false;
    const staff = staffDataMap[email];
    if (!staff || staff.isDeleted) return false;
    return staff.name || staff.category || email.includes('@');
  });

  const trashedStaffs = Object.keys(staffDataMap || {}).filter(email => {
    if (email === 'admin@aj.com') return false;
    const staff = staffDataMap[email];
    if (!staff || !staff.isDeleted) return false;
    return staff.name || staff.category || email.includes('@');
  });

  const activeBooths = booths.filter(item => !item.isDeleted);
  const trashedBooths = booths.filter(item => item.isDeleted);

  const activeSales = sales.filter(item => !item.isDeleted);
  const trashedSales = sales.filter(item => item.isDeleted);

  const activeExpenses = expenses.filter(item => !item.isDeleted);
  const trashedExpenses = expenses.filter(item => item.isDeleted);

  const activeSalaries = salaries.filter(item => !item.isDeleted);
  const trashedSalaries = salaries.filter(item => item.isDeleted);

  const trashedCounters = counters.filter(c => c.isDeleted);

  // সুনির্দিষ্ট ও কেস-ইনসেন্সিটিভ কাউন্টার ম্যাপিং ফাংশন
  const getMappedCounterName = (s) => {
    if (!s) return "অনির্দিষ্ট/অন্যান্য কাউন্টার";

    const staffEmail = (s.staffId || s.email || s.sellerEmail || s.addedBy || s.staffEmail || '').trim().toLowerCase();
    
    if (staffEmail && staffDataMap) {
      const matchedKey = Object.keys(staffDataMap).find(k => k.toLowerCase() === staffEmail);
      if (matchedKey && staffDataMap[matchedKey]?.branch) {
        const branch = staffDataMap[matchedKey].branch.trim();
        
        const exactMatch = countersList.find(c => c.trim().toLowerCase() === branch.toLowerCase());
        if (exactMatch) return exactMatch;

        for (const c of countersList) {
          if (c.toLowerCase().includes(branch.toLowerCase()) || branch.toLowerCase().includes(c.toLowerCase())) {
            return c;
          }
        }
      }
    }

    const rawCounter = (s.counterName || s.branch || s.counter || s.transportName || s.transport || '').trim();
    if (rawCounter) {
      const exactMatch = countersList.find(c => c.trim().toLowerCase() === rawCounter.toLowerCase());
      if (exactMatch) return exactMatch;

      for (const c of countersList) {
        if (c.toLowerCase().includes(rawCounter.toLowerCase()) || rawCounter.toLowerCase().includes(c.toLowerCase())) {
          return c;
        }
      }
    }

    return "অনির্দিষ্ট/অন্যান্য কাউন্টার"; 
  };

  const currentMonthSales = activeSales.filter(item => {
    if (!matchMonth(item.date || item.timestamp, selectedMonth)) return false;
    const seller = (item.staffId || item.addedBy || item.sellerEmail || item.email || item.staffEmail || '').toLowerCase();
    if (seller === 'admin@aj.com') return false; 
    return true;
  });

  const currentMonthExpenses = activeExpenses.filter(item => matchMonth(item.date, selectedMonth));
  const currentMonthSalaries = activeSalaries.filter(item => item.month === selectedMonth);

  const totalTicketsIncome = currentMonthSales.reduce((sum, item) => {
    const val = Number(item.amount || item.totalFare || item.fare || item.price || item.ticketPrice || item.cost || item.total || 0);
    return sum + val;
  }, 0);

  const totalRent = activeBooths.reduce((sum, item) => sum + (Number(item.rent) || 0), 0);
  const totalExpense = currentMonthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalSalariesExpense = currentMonthSalaries.reduce((sum, item) => sum + (Number(item.totalPayable) || 0), 0);
  
  const netIncome = totalTicketsIncome + totalRent - totalExpense - totalSalariesExpense;

  const globalAdminExp = (currentMonthExpenses || []).filter(e => e.expenseType === 'admin').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const globalBranchExp = (currentMonthExpenses || []).filter(e => e.expenseType === 'branch' || !e.expenseType).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handlePrintCounterReport = (counterName, rawCounterSales, counterBooths, adminExpenses, branchExpenses, counterSalaries, counterNet, monthStr) => {
    const counterSales = (rawCounterSales || []).filter(s => {
      const tName = s.transportName || s.transport || s.busName || s.bus || '';
      return !/রাসেদ|rashed/i.test(tName);
    });

    const transportMap = {};
    counterSales.forEach(s => {
      const tName = s.transportName || s.transport || s.busName || s.bus || 'অন্যান্য';
      const fare = Number(s.amount || s.totalFare || s.fare || s.price || s.ticketPrice || s.cost || s.total || 0);
      const tickets = Number(s.ticketCount || s.quantity || s.count || s.tickets || 1);
      
      if (!transportMap[tName]) {
        transportMap[tName] = { count: 0, amount: 0 };
      }
      transportMap[tName].count += tickets;
      transportMap[tName].amount += fare;
    });

    const transportEntries = Object.keys(transportMap).map(tName => ({
      tName,
      count: transportMap[tName].count,
      amount: transportMap[tName].amount
    }));

    const extractName = (str) => {
      if (!str) return '';
      const cleanStr = str.trim();
      if (/আনোয়ার|অনোর/i.test(cleanStr)) return 'আনোয়ার';
      if (/নাসিম/i.test(cleanStr)) return 'নাসিম';
      if (/তৌফিক|তৌফীক/i.test(cleanStr)) return 'তৌফিক';
      if (/মানাম/i.test(cleanStr)) return 'মানাম';
      
      const parts = cleanStr.split(/[-–—]/);
      if (parts.length > 1) {
        return parts[parts.length - 1].trim();
      }
      return cleanStr;
    };

    transportEntries.sort((a, b) => {
      const nameA = extractName(a.tName);
      const nameB = extractName(b.tName);
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB, 'bn');
      }
      return a.tName.localeCompare(b.tName, 'bn');
    });

    const totalCounterRent = (counterBooths || []).reduce((sum, b) => sum + (Number(b.rent) || 0), 0);
    const totalCounterSalesAmount = transportEntries.reduce((sum, item) => sum + item.amount, 0);
    const grandTotalIncome = totalCounterSalesAmount + totalCounterRent;

    const totalAdminExp = (adminExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalBranchExp = (branchExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const totalSalaryExp = (counterSalaries || []).reduce((sum, s) => sum + (Number(s.totalPayable) || 0), 0);
    const grandTotalExpense = totalSalaryExp + totalAdminExp + totalBranchExp;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <title>${counterName} - আর্থিক রিপোর্ট (${monthStr})</title>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: 'Hind Siliguri', sans-serif; padding: 8px; color: #0f172a; background: #fff; margin: 0; font-size: 13px; }
            .container { max-width: 100%; margin: 0 auto; border: 2px solid #0f172a; padding: 12px; border-radius: 6px; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 8px; }
            .logo-area { display: flex; align-items: center; gap: 8px; }
            .company-logo { width: 45px; height: 45px; object-fit: contain; border-radius: 4px; }
            .company-info h1 { margin: 0; font-size: 18px; color: #1e3a8a; font-weight: 700; }
            .company-info p { margin: 1px 0; font-size: 11px; color: #334155; font-weight: 500; }
            .report-badge span { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; border: 1px solid #bae6fd; }
            .sub-header { background: #f1f5f9; text-align: center; font-weight: 700; padding: 5px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px; margin-bottom: 6px; color: #1e293b; }
            .counter-title { background: #0284c7; color: #fff; text-align: center; font-weight: 700; padding: 6px; font-size: 14px; margin-bottom: 6px; border-radius: 4px; }
            .section-title { background: #1e293b; color: #fff; text-align: center; font-weight: 700; padding: 5px; font-size: 12px; margin-top: 10px; border-radius: 4px 4px 0 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 0; font-size: 12px; }
            th, td { border: 1px solid #94a3b8; padding: 3px 6px; text-align: left; }
            th { background: #334155; color: #fff; text-align: center; font-weight: 700; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: 700; background: #f8fafc; color: #0f172a; font-size: 12.5px; }
            .net-box { background: #0284c7; color: #fff; text-align: center; font-weight: 700; padding: 8px; font-size: 14px; margin-top: 12px; border-radius: 4px; }
            .footer-note { text-align: center; margin-top: 10px; font-size: 10px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 6px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-area">
                <img src="https://i.postimg.cc/9MnZNrQ6/AJ-Enterprise-LOGO.png" alt="AJ Enterprise Logo" class="company-logo" />
                <div class="company-info">
                  <h1>এজে এন্টারপ্রাইজ</h1>
                  <p>ঠিকানা: লতিফ ম্যানশন, আব্দুল্লাহপুর, উত্তারা, ঢাকা-১২৩০</p>
                </div>
              </div>
              <div class="report-badge">
                <span>আর্থিক বিবরণী রিপোর্ট</span>
              </div>
            </div>
            
            <div class="sub-header">মাসের নাম: ${monthStr}</div>
            <div class="counter-title">${counterName}</div>
            
            <div class="section-title">টিকেট বিক্রয় ও কমিশন আয় বিবরণী</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">ক্রমিক</th>
                  <th>আয়ের খাত / পরিবহনের নাম</th>
                  <th class="text-center" style="width: 22%;">বিক্রিত টিকেট</th>
                  <th class="text-right" style="width: 28%;">আয়ের পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                ${transportEntries.length === 0 ? `
                  <tr>
                    <td class="text-center">১</td>
                    <td>কোনো টিকেট বিক্রির সঠিক তথ্য নেই</td>
                    <td class="text-center">০</td>
                    <td class="text-right">৳০</td>
                  </tr>
                ` : transportEntries.map((item, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${item.tName}</td>
                    <td class="text-center">${item.count}</td>
                    <td class="text-right">৳${item.amount.toLocaleString('bn-BD')}</td>
                  </tr>
                `).join('')}
                
                <tr class="total-row">
                  <td colspan="3" class="text-right">মোট টিকেট কমিশন আয়:</td>
                  <td class="text-right">৳${totalCounterSalesAmount.toLocaleString('bn-BD')}</td>
                </tr>
              </tbody>
            </table>

            <div class="section-title" style="background: #047857; margin-top: 10px;">দোকান ও বুথ ভাড়া বাবদ আয়</div>
            <table>
              <thead>
                <tr>
                  <th style="background: #065f46;">আয়ের খাত</th>
                  <th class="text-right" style="width: 35%; background: #065f46;">পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>দোকান ও বুথ ভাড়া বাবদ মোট আয়</td>
                  <td class="text-right">৳${totalCounterRent.toLocaleString('bn-BD')}</td>
                </tr>
              </tbody>
            </table>

            <div style="background: #e2e8f0; padding: 6px 10px; margin-top: 6px; border-radius: 4px; font-weight: 700; text-align: right; font-size: 13px; border: 1px solid #cbd5e1;">
              সর্বমোট আয় (টিকেট কমিশন + বুথ ভাড়া): ৳${grandTotalIncome.toLocaleString('bn-BD')}
            </div>

            <div class="section-title" style="background: #b91c1c; margin-top: 10px;">ব্যয়ের বিবরণী</div>
            <table>
              <thead>
                <tr>
                  <th style="background: #991b1b;">খরচের খাত</th>
                  <th class="text-right" style="width: 35%; background: #991b1b;">খরচের পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>স্টাফ মাসিক বেতন</td>
                  <td class="text-right">৳${totalSalaryExp.toLocaleString('bn-BD')}</td>
                </tr>
                <tr>
                  <td>মোট এডমিন খরচ</td>
                  <td class="text-right">৳${totalAdminExp.toLocaleString('bn-BD')}</td>
                </tr>
                <tr>
                  <td>মোট ব্রাঞ্চ খরচ (টোটাল)</td>
                  <td class="text-right">৳${totalBranchExp.toLocaleString('bn-BD')}</td>
                </tr>
                <tr class="total-row">
                  <td class="text-right">সর্বমোট খরচ:</td>
                  <td class="text-right">৳${grandTotalExpense.toLocaleString('bn-BD')}</td>
                </tr>
              </tbody>
            </table>

            <div class="net-box">
              এই মাসের নীট জমা: ৳${(counterNet || 0).toLocaleString('bn-BD')}
            </div>

            <div class="footer-note">
              সফটওয়্যার দ্বারা স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত রিপোর্ট • ${monthStr}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      alert('পপআপ ব্লকার অন করা থাকতে পারে। দয়া করে ব্রাউজার পপআপ অনুমতি দিন।');
    }
  };

  const handleDownloadSummaryPDF = () => {
    const element = document.getElementById('economic-summary-box');
    const executePdfDownload = (el) => {
      const options = {
        margin:       10,
        filename:     `economic-summary-${selectedMonth}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().from(el).set(options).save();
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => executePdfDownload(element);
      document.body.appendChild(script);
    } else {
      executePdfDownload(element);
    }
  };

  const handleAutoLoadPreviousMonthSalaries = async () => {
    const prevMonth = prompt("কোন মাসের ডাটা কপি করতে চান? যেমন: (July 26)");
    if (!prevMonth) return;
    const targetMonth = prompt("নতুন কোন মাসের জন্য শিট তৈরি করতে চান? যেমন: (August 26)", selectedMonth);
    if (!targetMonth) return;

    const prevRecords = activeSalaries.filter(s => s.month === prevMonth);
    if (prevRecords.length === 0) {
      return alert(`${prevMonth} এ কোনো বেতনের রেকর্ড পাওয়া যায়নি!`);
    }

    if (!window.confirm(`${prevMonth} এর ${prevRecords.length} জন স্টাফের ডাটা দিয়ে ${targetMonth} মাসের শিট তৈরি করতে চান?`)) return;

    try {
      for (let rec of prevRecords) {
        await addSalaryService({
          month: targetMonth,
          staffName: rec.staffName || '',
          branch: countersList.includes(rec.branch) ? rec.branch : countersList[0],
          staffId: rec.staffId || '',
          designation: rec.designation || '',
          transportName: 'একতা ট্রান্সপোর্ট',
          basicSalary: Number(rec.basicSalary) || 0,
          daysInMonth: rec.daysInMonth || '31',
          absentDays: '0',
          unpaidLeaveDeduction: '0',
          advanceSalary: Number(rec.advanceSalary) || 0,
          totalPayable: Number(rec.basicSalary) || 0,
          paymentStatus: 'অপরিশোধ',
          isDeleted: false
        });
      }
      setSelectedMonth(targetMonth);
      setSalaryForm(prev => ({ ...prev, month: targetMonth }));
      alert(`${targetMonth} এর জন্য সফলভাবে স্টাফদের বেতন শিট জেনারেট করা হয়েছে!`);
    } catch (error) {
      alert('অটো-লোড করতে সমস্যা: ' + getErrorMessage(error));
    }
  };

  const totalTrashedCount = trashedCounters.length + trashedStaffs.length + trashedSales.length + trashedBooths.length + trashedExpenses.length + trashedSalaries.length;

  return (
    <div className="layout-wrap" style={{ backgroundColor: '#0f172a', padding: '20px', minHeight: '100vh', fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
      <div className="layout" aria-label="Magazine wireframe" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER REGION */}
        <div className="region region--header" style={{ gridColumn: 'span 12', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="region__tag"><img src="https://i.postimg.cc/9MnZNrQ6/AJ-Enterprise-LOGO.png" alt="AJ Enterprise Logo" style={{ height: '45px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '8px' }} /></span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>এজে এন্টারপ্রাইজ - এডমিন প্যানেল</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>মাস: {selectedMonth}</span>
            <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600' }}>অবশিষ্ট জমা: {(netIncome || 0).toLocaleString('bn-BD')} ৳</span>
          </div>
        </div>

        {/* NAV REGION */}
        <div className="region region--nav" style={{ gridColumn: 'span 12', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="region__tag" style={{ backgroundColor: '#334155', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '10px' }}>নির্ধারণ করুন</span>
          
          <button
            onClick={() => setActiveTab('staff')}
            style={{ padding: '8px 16px', backgroundColor: activeTab === 'staff' ? '#2563eb' : '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            ১. স্টাফ ও ব্রাঞ্চ ম্যানেজমেন্ট
          </button>

          <button
            onClick={() => setActiveTab('booth')}
            style={{ padding: '8px 16px', backgroundColor: activeTab === 'booth' ? '#2563eb' : '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            ২. বুথ ও খরচ হিসাব
          </button>

          <button
            onClick={() => setActiveTab('salary')}
            style={{ padding: '8px 16px', backgroundColor: activeTab === 'salary' ? '#2563eb' : '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            ৩. স্টাফ বেতন শিট
          </button>

          <button
            onClick={() => setActiveTab('counterReport')}
            style={{ padding: '8px 16px', backgroundColor: activeTab === 'counterReport' ? '#2563eb' : '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            ৪. কাউন্টারের বিস্তারিত হিসাব
          </button>

          <button
            onClick={() => setActiveTab('recycle')}
            style={{ padding: '8px 16px', backgroundColor: activeTab === 'recycle' ? '#dc2626' : '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', marginLeft: 'auto' }}
          >
            ৫. রিসাইকেল বিন ({totalTrashedCount})
          </button>
        </div>

        {/* LEFT-SIDE REGION */}
        <div className="region region--left" style={{ gridColumn: 'span 3', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>সক্রিয় কাউন্টারসমূহ</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {countersList.map((c, idx) => (
              <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', fontWeight: '500', color: '#38bdf8' }}>
                📍 {c}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN REGION */}
        <div className="region region--main" style={{ gridColumn: 'span 9', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span className="region__tag" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>MAIN CONTENT ({activeTab.toUpperCase()})</span>
          </div>

          {/* ১. স্টাফ ও বাস ম্যানেজমেন্ট ট্যাব */}
          {activeTab === 'staff' && (
            <>
              <BranchManager />
              <StaffBusManagement
                activeTab={activeTab}
                handleAddStaff={handleAddStaff}
                newName={newName}
                setNewName={setNewName}
                newEmail={newEmail}
                setNewEmail={setNewEmail}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                newBranch={newBranch}
                setNewBranch={setNewBranch}
                countersList={countersList}
                newBuses={newBuses}
                setNewBuses={setNewBuses}
                isAddingStaff={isAddingStaff}
                selectedStaffEmail={selectedStaffEmail}
                setSelectedStaffEmail={setSelectedStaffEmail}
                activeStaffs={activeStaffs}
                staffDataMap={staffDataMap}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                editBranch={editBranch}
                setEditBranch={setEditBranch}
                editBasicSalary={editBasicSalary}
                setEditBasicSalary={setEditBasicSalary}
                editAdvanceSalary={editAdvanceSalary}
                setEditAdvanceSalary={setEditAdvanceSalary}
                editPassword={editPassword}
                setEditPassword={setEditPassword}
                editBuses={editBuses}
                setEditBuses={setEditBuses}
                handleUpdateStaff={handleUpdateStaff}
                isUpdatingStaff={isUpdatingStaff}
                isChangingPassword={isChangingPassword}
                handleDeleteStaff={handleDeleteStaff}
              />
            </>
          )}

          {/* ২. বুথ ও খরচ হিসাব ট্যাব */}
          {activeTab === 'booth' && (
            <CounterAccounts
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              generateMonthOptions={generateMonthOptions}
              newCounter={newCounter}
              setNewCounter={setNewCounter}
              newBoothNo={newBoothNo}
              setNewBoothNo={setNewBoothNo}
              newTenant={newTenant}
              setNewTenant={setNewTenant}
              newRent={newRent}
              setNewRent={setNewRent}
              handleAddBooth={handleAddBooth}
              isAddingBooth={isAddingBooth}
              countersList={countersList}
              activeTab={activeTab}
              newDynamicCounterInput={newDynamicCounterInput}
              setNewDynamicCounterInput={setNewDynamicCounterInput}
              handleAddNewCounter={handleAddNewCounter}
              isAddingCounter={isAddingCounter}
              counters={counters}
              editingCounterId={editingCounterId}
              editedCounterName={editedCounterName}
              setEditedCounterName={setEditedCounterName}
              handleSaveCounterEdit={handleSaveCounterEdit}
              setEditingCounterId={setEditingCounterId}
              handleEditCounterClick={handleEditCounterClick}
              handleDeleteCounter={handleDeleteCounter}
            />
          )}

          {/* ৩. স্টাফ বেতন শিট ট্যাব */}
          {activeTab === 'salary' && (
            <SalarySheet
              activeTab={activeTab}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              generateMonthOptions={generateMonthOptions}
              handleAutoLoadPreviousMonthSalaries={handleAutoLoadPreviousMonthSalaries}
              salaryForm={salaryForm}
              setSalaryForm={setSalaryForm}
              staffDataMap={staffDataMap}
              activeStaffs={activeStaffs}
              countersList={countersList}
              calculateSalaryDetails={calculateSalaryDetails}
              handleSalaryInputChange={handleSalaryInputChange}
              handleSaveSalary={handleSaveSalary}
              isSavingSalary={isSavingSalary}
              isSalaryTableOpen={isSalaryTableOpen}
              setIsSalaryTableOpen={setIsSalaryTableOpen}
              activeSalaries={activeSalaries}
              ALL_REPORT_COUNTERS={ALL_REPORT_COUNTERS}
              handleDeleteSalary={handleDeleteSalary}
            />
          )}

          {/* ৪. কাউন্টারের বিস্তারিত হিসাব ট্যাব */}
          {activeTab === 'counterReport' && (
            <Countersheetdetails
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              generateMonthOptions={generateMonthOptions}
              ALL_REPORT_COUNTERS={ALL_REPORT_COUNTERS}
              currentMonthSales={currentMonthSales}
              activeBooths={activeBooths}
              currentMonthExpenses={currentMonthExpenses}
              currentMonthSalaries={currentMonthSalaries}
              getMappedCounterName={getMappedCounterName}
              openCounters={openCounters}
              toggleCounterAccordion={toggleCounterAccordion}
              handleRentChange={handleRentChange}
              handleDeleteBooth={handleDeleteBooth}
              handleDeleteExpense={handleDeleteExpense}
              totalTicketsIncome={totalTicketsIncome}
              totalRent={totalRent}
              netIncome={netIncome}
              globalAdminExp={globalAdminExp}
              globalBranchExp={globalBranchExp}
              totalSalariesExpense={totalSalariesExpense}
              handleDownloadSummaryPDF={handleDownloadSummaryPDF}
              handlePrintCounterReport={handlePrintCounterReport}
              expenseCounter={expenseCounter}
              setExpenseCounter={setExpenseCounter}
              expenseTitle={expenseTitle}
              setExpenseTitle={setExpenseTitle}
              expenseAmount={expenseAmount}
              setExpenseAmount={setExpenseAmount}
              expenseDate={expenseDate}
              setExpenseDate={setExpenseDate}
              handleAddExpense={handleAddExpense}
              isAddingExpense={isAddingExpense}
              countersList={countersList}
            />
          )}

          {/* ৫. রিসাইকেল বিন ট্যাব */}
          {activeTab === 'recycle' && (
            <RecycleBin
              activeTab={activeTab}
              trashedCounters={trashedCounters}
              handleRestoreCounter={handleRestoreCounter}
              handlePermanentDeleteCounter={handlePermanentDeleteCounter}
              trashedStaffs={trashedStaffs}
              staffDataMap={staffDataMap}
              handleRestoreStaff={handleRestoreStaff}
              handlePermanentDeleteStaff={handlePermanentDeleteStaff}
              trashedSales={trashedSales}
              formatDateToCustom={formatDateToCustom}
              handleRestoreSale={handleRestoreSale}
              handlePermanentDeleteSale={handlePermanentDeleteSale}
              trashedBooths={trashedBooths}
              handleRestoreBooth={handleRestoreBooth}
              handlePermanentDeleteBooth={handlePermanentDeleteBooth}
              trashedExpenses={trashedExpenses}
              handleRestoreExpense={handleRestoreExpense}
              handlePermanentDeleteExpense={handlePermanentDeleteExpense}
              trashedSalaries={trashedSalaries}
              handleRestoreSalary={handleRestoreSalary}
              handlePermanentDeleteSalary={handlePermanentDeleteSalary}
            />
          )}
        </div>

        {/* FOOTER REGION */}
        <div className="region region--footer" style={{ gridColumn: 'span 12', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="region__tag" style={{ backgroundColor: '#334155', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}></span>
            <span>এজে এন্টারপ্রাইজ ম্যানেজমেন্ট সিস্টেম</span>
          </div>
          <div>এজে এন্টারপ্রাইজ সর্বস্বত্ব সংরক্ষিত © 2026</div>
        </div>

      </div>
    </div>
  );
}