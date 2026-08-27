import AdminPanel from "./components/AdminPanel";
import LoginForm from "./components/LoginForm";
import DashboardHeader from './components/DashboardHeader';
import StaffDashboard from './components/StaffDashboard';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from 'firebase/auth';

// AuthContext তৈরি করা
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Google Sheet Web App URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyAVtB7CTRZOBZcKKVpSGqKaZNa-uZkpSmrHwQYxOzP0JGOriOiL_dBsbctPXT_6w3U/exec";

// যারা টিকিট বিক্রি করেন তাদের ইমেইলের তালিকা
const TICKET_SELLING_STAFF = [
  'anwar@aj.com',
  'manam@aj.com',
  'nasim@aj.com',
  'toufik@aj.com',
  'jahid@aj.com',
  'asif@aj.com',
  'misuk@aj.com'
];

// কাউন্টার ভিত্তিক স্টাফ এবং বাস ম্যাপিং
const STAFF_COUNTER_MAPPING = {
  'jahid@aj.com': 'হানিফ এন্টারপ্রাইজ-আবদুল্লাহপুর',
  'anwar@aj.com': 'একতা পরিবহন-আজমপুর',
  'manam@aj.com': 'একতা পরিবহন-আজমপুর',
  'nasim@aj.com': 'একতা পরিবহন-আজমপুর',
  'toufik@aj.com': 'একতা পরিবহন-আজমপুর',
  'asif@aj.com': 'এস আর ট্রাভেলস-আবদুল্লাহপুর',
  'misuk@aj.com': 'ইমাদ কাউন্টার মালেকা বানু'
};

const sendToGoogleSheet = async (data) => {
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Google Sheet Sync Error:', error);
  }
};

const INITIAL_STAFF_DATA = {
  'admin@aj.com': { email: 'admin@aj.com', name: 'জুয়েল মৃধা', role: 'ADMIN', category: 'সাধারণ', canExpense: true, buses: [] },

  // একতা পরিবহন-আজমপুর
  'anwar@aj.com': { email: 'anwar@aj.com', code: 'AKT-26-001', name: 'মোঃ আনোয়ার', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['একতা কাউন্টার আজমপুর', 'একতা ট্রান্সপোর্ট-আনোয়ার'] },
  'milon@aj.com': { email: 'milon@aj.com', code: 'AKT-26-002', name: 'মোঃ মিলন', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'momin@aj.com': { email: 'momin@aj.com', code: 'AKT-26-003', name: 'মোঃ মোমিন', institution: 'একতা পরিবহন-আজমপুর', designation: 'কলার বয়', salary: '৳11000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'ramzan@aj.com': { email: 'ramzan@aj.com', code: 'AKT-26-004', name: 'মোঃ রমজান', institution: 'একতা পরিবহন-আজমপুর', designation: 'কলার বয়', salary: '৳11000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'robiul@aj.com': { email: 'robiul@aj.com', code: 'AKT-26-005', name: 'মোঃ রবিউল', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳11000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'manam@aj.com': { email: 'manam@aj.com', code: 'AKT-26-006', name: 'মোঃ মানাম', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳10000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['শাহ্‌ ফতেহ আলী পরিবহন-মানাম', 'অন্যান্য পরিবহন-মানাম', 'একতা কাউন্টার আজমপুর'] },
  'nasim@aj.com': { email: 'nasim@aj.com', code: 'AKT-26-007', name: 'মোঃ নাসিম', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳10000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর', 'শ্যামলী এন আর পরিবহন-নাসিম', 'নাবিল পরিবহন-নাসিম', 'অন্যান্য পরিবহন-নাসিম', 'একতা কাউন্টার আজমপুর'] },
  'sourav@aj.com': { email: 'sourav@aj.com', code: 'AKT-26-008', name: 'মোঃ সৌরভ', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳9000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'rased@aj.com': { email: 'rased@aj.com', code: 'AKT-26-009', name: 'মোঃ রাসেদ', institution: 'একতা পরিবহন-আজমপুর', designation: 'কলার বয়', salary: '৳13000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'sojib@aj.com': { email: 'sojib@aj.com', code: 'AKT-26-011', name: 'মোঃ সজিব', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার মাস্টার', salary: '৳12000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['একতা কাউন্টার আজমপুর'] },
  'toufik@aj.com': { email: 'toufik@aj.com', code: 'AKT-26-010', name: 'মোঃ তৌফীক', institution: 'একতা পরিবহন-আজমপুর', designation: 'কাউন্টার ম্যানেজার', salary: '', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['লাবিব কাউন্টার মালেকাবানু', 'দেশ ট্রাভেলস-তৌফীক', 'অন্যান্য পরিবহন-তৌফীক', 'একতা কাউন্টার আজমপুর'] },

  // হানিফ এন্টারপ্রাইজ-আবদুল্লাহপুর
  'jahid@aj.com': { email: 'jahid@aj.com', code: 'HNF-26-001', name: 'মোঃ জাহিদ হাসান', institution: 'হানিফ এন্টারপ্রাইজ-আবদুল্লাহপুর', designation: 'কাউন্টার ম্যানেজার', salary: '৳15000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['হানিফ কাউন্টার', 'হানিফ কক্সবাজার-জাহিদ', 'হানিফ উত্তরবঙ্গ-জাহিদ', 'ইউনিটি পরিবহন-জাহিদ', 'অন্যান্য পরিবহন-জাহিদ'] },
  'moni@aj.com': { email: 'moni@aj.com', code: 'HNF-26-002', name: 'মোঃ মনি', institution: 'হানিফ এন্টারপ্রাইজ-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳15000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['হানিফ কাউন্টার'] },
  'sakib@aj.com': { email: 'sakib@aj.com', code: 'HNF-26-003', name: 'মোঃ সাকিব', institution: 'হানিফ এন্টারপ্রাইজ-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳10000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['হানিফ কাউন্টার'] },

  // ইমাদ কাউন্টার মালেকা বানু
  'misuk@aj.com': { email: 'misuk@aj.com', code: 'IMS-26-001', name: 'মোঃ মিশুক', institution: 'ইমাদ কাউন্টার মালেকা বানু', designation: 'কাউন্টার ম্যানেজার', salary: '৳20000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['হানিফ কাউন্টার', 'শ্যামলী এস এস মিশুক', 'ইমাদ পরিবহন-মিশুক', 'সারা এক্সপ্রেস-মিশুক', 'পূর্বাশা পরিবহন-মিশুক', 'অন্যান্য পরিবহন-মিশুক'] },
  'fahim@aj.com': { email: 'fahim@aj.com', code: 'IMS-26-002', name: 'মোঃ ফাহিম', institution: 'ইমাদ কাউন্টার মালেকা বানু', designation: 'কাউন্টার মাস্টার', salary: '৳12000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['ইমাদ পরিবহন-মিশুক'] },

  // এস আর ট্রাভেলস-আবদুল্লাহপুর
  'asif@aj.com': { email: 'asif@aj.com', code: 'SR-26-001', name: 'মোঃ আসিফুর রাহমান', institution: 'এস আর ট্রাভেলস-আবদুল্লাহপুর', designation: 'কাউন্টার ম্যানেজার', salary: '৳21000', role: 'STAFF', category: 'টিকেট বিক্রেতা', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর', 'দেশ ট্রাভেলস-আসিফ', 'নাবিল পরিবহন-আসিফ', 'শ্যামলী এন আর পরিবহন-আসিফ', 'সি লাইন-আসিফ', 'সাকুরা পরিবহন-আসিফ', 'অন্যান্য পরিবহন-আসিফ'] },
  'monir@aj.com': { email: 'monir@aj.com', code: 'SR-26-002', name: 'মোঃ মনির হোসেন', institution: 'এস আর ট্রাভেলস-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর'] },
  'shariful@aj.com': { email: 'shariful@aj.com', code: 'SR-26-003', name: 'মোঃ শরিফুল ইসলাম', institution: 'এস আর ট্রাভেলস-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর'] },
  'asif_jr@aj.com': { email: 'asif_jr@aj.com', code: 'SR-26-004', name: 'মোঃ আসিফ (জুনিয়র)', institution: 'এস আর ট্রাভেলস-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর'] },
  'helal@aj.com': { email: 'helal@aj.com', code: 'SR-26-005', name: 'মোঃ হেলাল', institution: 'এস আর ট্রাভেলস-আবদুল্লাহপুর', designation: 'কাউন্টার মাস্টার', salary: '৳14000', role: 'STAFF', category: 'সাধারণ', canExpense: true, buses: ['এস আর কাউন্টার আবদুল্লাহপুর'] },
};

const EXPENSE_CATEGORIES = [
  'মোবাইল বিল',
  'স্থায়ী খরচ',
  'ইউটিলিটি',
  'স্টেশনরি',
  'আপ্যায়ন',
  'মেরামত ও রক্ষণাবেক্ষণ',
  'অন্যান্য',
  'অনুদান'
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
const CURRENT_MONTH_STR = `${currentYear}-${currentMonthNum}`;
const TODAY_DATE = now.toISOString().split('T')[0];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const engMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = engMonths[parseInt(month, 10) - 1] || month;
  const shortYear = year.slice(-2);
  return `${monthName}-${shortYear}`;
};

const normalizeTransport = (t) => {
  if (!t) return 'অন্যান্য পরিবহন';
  return t.replace(/\s*-\s*/g, '-').trim();
};

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [staffDataMap, setStaffDataMap] = useState(INITIAL_STAFF_DATA);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (authUser && authUser.email) {
      const userEmail = authUser.email.toLowerCase().trim();
      const userInfo = staffDataMap[userEmail] || { 
        email: userEmail,
        name: userEmail.split('@')[0], 
        role: 'STAFF', 
        category: 'সাধারণ',
        canExpense: true, 
        buses: INITIAL_STAFF_DATA[userEmail]?.buses || ['অন্যান্য পরিবহন'] 
      };
      setCurrentUser({ 
        ...userInfo, 
        id: userEmail, 
        canExpense: true,
        buses: userInfo.buses && userInfo.buses.length > 0 ? userInfo.buses : (INITIAL_STAFF_DATA[userEmail]?.buses || ['অন্যান্য পরিবহন'])
      });
    } else {
      setCurrentUser(null);
    }
  }, [authUser, staffDataMap]);

  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
      const fetchedStaff = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const email = (data.email || doc.id).toLowerCase().trim();
        fetchedStaff[email] = data;
      });
      setStaffDataMap(prev => {
        const merged = { ...INITIAL_STAFF_DATA };
        Object.keys(fetchedStaff).forEach(k => {
          merged[k] = {
            ...merged[k],
            ...fetchedStaff[k],
            buses: (fetchedStaff[k].buses && fetchedStaff[k].buses.length > 0) 
              ? fetchedStaff[k].buses 
              : (INITIAL_STAFF_DATA[k]?.buses || ['অন্যান্য পরিবহন'])
          };
        });
        return merged;
      });
    });

    return () => unsubStaff();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, authUser, staffDataMap, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function MainApp() {
  const { currentUser, staffDataMap, logout } = useAuth();
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  const [filterMode, setFilterMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_STR);
  const [startDate, setStartDate] = useState(`${CURRENT_MONTH_STR}-01`);
  const [endDate, setEndDate] = useState(TODAY_DATE);
  const [selectedStaff, setSelectedStaff] = useState('all');

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTransport, setEditTransport] = useState('');
  const [editTickets, setEditTickets] = useState('');
  const [editTicketType, setEditTicketType] = useState('AC');
  const [editCommissionType, setEditCommissionType] = useState('fixed');
  const [editRate, setEditRate] = useState('');
  
  const [showReport, setShowReport] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
    });

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
    });

    return () => {
      unsubSales();
      unsubExpenses();
    };
  }, []);

  const API_URL = import.meta.env.VITE_API_URL;
  const resetStaffPassword = async (identifier, newPassword) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Admin হিসেবে লগইন করা নেই।');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${API_URL}/api/admin/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      identifier,
      newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Password update failed.');
  }

  return data;
};

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.trim().toLowerCase(),
      passwordInput
    );
  } catch (error) {
    alert('লগইন ত্রুটি: ইমেইল বা পাসওয়ার্ড সঠিক নয়!');
  }
};

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPasswordInput !== confirmPasswordInput) {
      return alert('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একরকম হয়নি!');
    }
    const user = auth.currentUser;
    if (user && oldPasswordInput && newPasswordInput) {
      try {
        const credential = EmailAuthProvider.credential(user.email, oldPasswordInput);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPasswordInput);
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setOldPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setShowPasswordModal(false);
      } catch (error) {
        alert('পাসওয়ার্ড পরিবর্তন করা যায়নি: ' + error.message);
      }
    }
  };

  const handleDeleteSale = async (id) => {
    if (currentUser?.role !== 'ADMIN') {
      return alert('শুধুমাত্র অ্যাডমিন হিসাব মুছতে পারবেন!');
    }
    if (window.confirm('আপনি কি এই বিক্রির হিসাবটি মুছে ফেলতে চান?')) {
      await deleteDoc(doc(db, "sales", id));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (currentUser?.role !== 'ADMIN') {
      return alert('শুধুমাত্র অ্যাডমিন খরচ মুছতে পারবেন!');
    }
    if (window.confirm('আপনি কি এই খরচের হিসাবটি মুছে ফেলতে চান?')) {
      await deleteDoc(doc(db, "expenses", id));
    }
  };

  const handleOpenEditSale = (sale) => {
    if (currentUser?.role !== 'ADMIN') return;
    setEditingSale(sale);
    setEditDate(sale.date);
    setEditTransport(sale.transport);
    setEditTickets(sale.tickets);
    setEditTicketType(sale.ticketType || 'AC');
    setEditCommissionType(sale.commissionType || sale.rateType || 'fixed');
    setEditRate(sale.rate);
    setShowEditModal(true);
  };

  const handleUpdateSale = async (e) => {
    e.preventDefault();
    if (!editTransport || !editTickets || !editRate || !editDate) {
      return alert('সবগুলো ঘর পূরণ করুন');
    }
    const t = Number(editTickets);
    const r = Number(editRate);

    try {
      await updateDoc(doc(db, "sales", editingSale.id), {
        date: editDate,
        transport: editTransport,
        tickets: t,
        ticketType: editTicketType,
        commissionType: editCommissionType,
        rateType: editCommissionType,
        rate: r,
        total: t * r
      });
      setShowEditModal(false);
      setEditingSale(null);
      alert('হিসাব সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      alert('আপডেট করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const filterByDateOrMonth = (itemDate) => {
    if (!itemDate) return false;
    if (filterMode === 'statement') {
      return itemDate >= startDate && itemDate <= endDate;
    }
    return filterMode === 'daily' ? itemDate === selectedDate : itemDate.startsWith(selectedMonth);
  };

  const filteredSales = sales.filter(item => {
    const matchTime = filterByDateOrMonth(item.date);
    const matchStaff = currentUser?.role === 'ADMIN' ? (selectedStaff === 'all' || item.staffId === selectedStaff) : (item.staffId === currentUser?.id || item.staffId === currentUser?.email);
    return matchTime && matchStaff;
  });

  const filteredExpenses = expenses.filter(item => {
    const matchTime = filterByDateOrMonth(item.date);
    const matchStaff = currentUser?.role === 'ADMIN' ? (selectedStaff === 'all' || item.staffId === selectedStaff) : (item.staffId === currentUser?.id || item.staffId === currentUser?.email);
    return matchTime && matchStaff;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return (a.transport || '').localeCompare(b.transport || '', 'bn', { sensitivity: 'base' });
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return (a.category || '').localeCompare(b.category || '', 'bn', { sensitivity: 'base' });
  });

  const busWiseMonthlyMap = {};
  sortedSales.forEach(sale => {
    const rawTransport = sale.transport || 'অন্যান্য পরিবহন';
    const transportKey = normalizeTransport(rawTransport);
    const typeLabel = sale.ticketType || 'AC';
    const saleRate = Number(sale.rate) || 0;
    const rawCommType = sale.commissionType || sale.rateType || 'fixed';
    const isPercent = rawCommType === 'percent' || rawCommType === 'percentage';
    const commTypeNormalized = isPercent ? 'percent' : 'fixed';

    const combinedKey = `${transportKey}_${typeLabel}_${saleRate}_${commTypeNormalized}`;
    const rateDisplay = isPercent ? `${saleRate.toLocaleString('en-IN')}%` : `${saleRate.toLocaleString('en-IN')} টাকা`;

    if (!busWiseMonthlyMap[combinedKey]) {
      busWiseMonthlyMap[combinedKey] = {
        transport: transportKey,
        ticketType: typeLabel,
        staffName: sale.staffName || 'অজানা স্টাফ',
        earliestDate: sale.date || '',
        rateDisplay: rateDisplay,
        totalTickets: 0,
        totalCommission: 0
      };
    } else {
      if (sale.date && (!busWiseMonthlyMap[combinedKey].earliestDate || sale.date < busWiseMonthlyMap[combinedKey].earliestDate)) {
        busWiseMonthlyMap[combinedKey].earliestDate = sale.date;
      }
    }
    busWiseMonthlyMap[combinedKey].totalTickets += Number(sale.tickets) || 0;
    busWiseMonthlyMap[combinedKey].totalCommission += Number(sale.total) || 0;
  });

  const sortedBusWiseMonthlySummary = Object.values(busWiseMonthlyMap).sort((a, b) => {
    const transportCompare = (a.transport || '').localeCompare(b.transport || '', 'bn', { sensitivity: 'base' });
    if (transportCompare !== 0) {
      return transportCompare;
    }
    const typeCompare = (a.ticketType || '').localeCompare(b.ticketType || '', 'bn', { sensitivity: 'base' });
    if (typeCompare !== 0) {
      return typeCompare;
    }
    const dateA = a.earliestDate ? new Date(a.earliestDate).getTime() : 0;
    const dateB = b.earliestDate ? new Date(b.earliestDate).getTime() : 0;
    return dateA - dateB;
  });

  const monthlySummaryMap = {};
  sortedSales.forEach(sale => {
    const rawCommType = sale.commissionType || sale.rateType || 'fixed';
    const isPercent = rawCommType === 'percent' || rawCommType === 'percentage';
    const key = `${sale.staffId || sale.staffName}_${normalizeTransport(sale.transport)}_${sale.ticketType || 'AC'}_${sale.rate || 0}_${isPercent ? 'percent' : 'fixed'}_${sale.date}`;
    if (!monthlySummaryMap[key]) {
      monthlySummaryMap[key] = {
        staffName: sale.staffName || 'অজানা স্টাফ',
        transport: normalizeTransport(sale.transport),
        ticketType: sale.ticketType || 'AC',
        commissionType: isPercent ? 'percent' : 'fixed',
        rate: Number(sale.rate) || 0,
        date: sale.date,
        totalTickets: 0,
        totalCommission: 0
      };
    }
    monthlySummaryMap[key].totalTickets += Number(sale.tickets);
    monthlySummaryMap[key].totalCommission += Number(sale.total);
  });
  
  const sortedMonthlySummary = Object.values(monthlySummaryMap).sort((a, b) => {
    const transportCompare = (a.transport || '').localeCompare(b.transport || '', 'bn', { sensitivity: 'base' });
    if (transportCompare !== 0) {
      return transportCompare;
    }
    const typeCompare = (a.ticketType || '').localeCompare(b.ticketType || '', 'bn', { sensitivity: 'base' });
    if (typeCompare !== 0) {
      return typeCompare;
    }
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  const totalTicketsAll = sortedMonthlySummary.reduce((sum, item) => sum + item.totalTickets, 0);
  const totalCommissionAll = sortedMonthlySummary.reduce((sum, item) => sum + item.totalCommission, 0);

  const totalCommission = sortedSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalExpense = sortedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalTicketsCount = sortedSales.reduce((acc, curr) => acc + Number(curr.tickets), 0);

  const downloadPDF = () => {
    const staffText = selectedStaff === 'all' ? 'সকল স্টাফ (সবাই)' : (staffDataMap[selectedStaff]?.name || selectedStaff);
    const periodText = filterMode === 'daily' 
      ? `তারিখ: ${formatDate(selectedDate)}` 
      : filterMode === 'monthly' 
      ? `মাস: ${formatMonth(selectedMonth)}` 
      : `সময়কাল: ${formatDate(startDate)} হতে ${formatDate(endDate)}`;

    const busWisePdfRows = filterMode === 'monthly' ? sortedBusWiseMonthlySummary.map(item => `
      <tr style="border-bottom: 1px solid #1D3557;">
        <td style="padding: 8px; font-weight: 600; color: #F8FAFC;">${item.transport} (${item.ticketType}) - ${formatMonth(selectedMonth)}</td>
        <td style="padding: 8px; color: #3B82F6; font-weight: bold;">${item.rateDisplay}</td>
        <td style="padding: 8px; color: #10B981; font-weight: bold;">${item.totalTickets.toLocaleString('en-IN')} টি</td>
        <td style="padding: 8px; color: #10B981; font-weight: bold;">৳ ${item.totalCommission.toLocaleString('en-IN')}</td>
      </tr>
    `).join('') : '';

    const busWisePdfSection = filterMode === 'monthly' ? `
      <h3 style="font-size: 15px; margin: 20px 0 8px; color: #F8FAFC; border-bottom: 2px solid #1D3557; padding-bottom: 6px;">
        🚌 প্রতিটা কাউন্টার ও বাসের মাসিক মোট হিসাব (${formatMonth(selectedMonth)})
      </h3>
      <table>
        <thead>
          <tr>
            <th>কাউন্টার / বাস ও ধরন</th>
            <th>কমিশন এর পরিমাণ</th>
            <th>মোট টিকেট</th>
            <th>মোট কমিশন (টাকা)</th>
          </tr>
        </thead>
        <tbody>
          ${busWisePdfRows || '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #94A3B8;">কোনো তথ্য নেই</td></tr>'}
        </tbody>
      </table>
    ` : '';

    const incomeRows = sortedSales.length === 0 
      ? `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94A3B8;">কোনো ইনকাম তথ্য পাওয়া যায়নি</td></tr>`
      : sortedSales.map((s) => {
        const rawCommType = s.commissionType || s.rateType || 'fixed';
        const isPercent = rawCommType === 'percent' || rawCommType === 'percentage';
        return `
        <tr style="border-bottom: 1px solid #1D3557;">
          <td style="padding: 10px; color: #94A3B8;">${formatDate(s.date)}</td>
          <td style="padding: 10px; font-weight: 600; color: #F8FAFC;">${s.staffName}</td>
          <td style="padding: 10px; color: #CBD5E1;">টিকিট বিক্রি: ${normalizeTransport(s.transport)} [${s.ticketType || 'AC'}] - ${Number(s.tickets).toLocaleString('en-IN')} টি (রেট: ${Number(s.rate).toLocaleString('en-IN')}${isPercent ? '%' : ' টাকা'})</td>
          <td style="padding: 10px; color: #CBD5E1;">${Number(s.tickets).toLocaleString('en-IN')} টি</td>
          <td style="padding: 10px; color: #10B981; font-weight: bold;">৳ ${Number(s.total).toLocaleString('en-IN')}</td>
        </tr>
      `;}).join('');

    const expenseRows = sortedExpenses.length === 0 
      ? `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94A3B8;">কোনো খরচের তথ্য পাওয়া যায়নি</td></tr>`
      : sortedExpenses.map((e) => `
        <tr style="border-bottom: 1px solid #1D3557;">
          <td style="padding: 10px; color: #94A3B8;">${formatDate(e.date)}</td>
          <td style="padding: 10px; font-weight: 600; color: #F8FAFC;">${e.staffName}</td>
          <td style="padding: 10px; color: #CBD5E1;">[${e.category}] ${e.description}</td>
          <td style="padding: 10px; color: #EF4444; font-weight: bold;">৳ ${Number(e.amount).toLocaleString('en-IN')}</td>
        </tr>
      `).join('');

    const printWindow = window.open('', '', 'width=900,height=700');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AJ Enterprise Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
          body { font-family: 'Hind Siliguri', Arial, sans-serif; padding: 30px; color: #F8FAFC; background: #050B14; line-height: 1.5; }
          .header { background: #0A1422; color: #F8FAFC; padding: 20px 25px; border-radius: 12px; border: 1px solid #1D3557; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; }
          .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
          .header p { margin: 4px 0 0; font-size: 13px; color: #94A3B8; font-weight: 500; }
          .cards { display: flex; gap: 15px; margin-bottom: 25px; }
          .card { flex: 1; padding: 15px; border-radius: 10px; border: 1px solid #1D3557; background: #0D1B2A; }
          .card-title { font-size: 12px; color: #94A3B8; font-weight: 600; text-transform: uppercase; }
          .card-value { font-size: 18px; font-weight: 700; margin-top: 6px; }
          .green { border-left: 4px solid #10B981; }
          .red { border-left: 4px solid #EF4444; }
          .blue { border-left: 4px solid #2563EB; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; margin-bottom: 25px; background: #0A1422; border-radius: 10px; overflow: hidden; border: 1px solid #1D3557; }
          th { background: #12243A; border-bottom: 2px solid #1D3557; text-align: left; padding: 10px; color: #F8FAFC; }
          td { padding: 8px 10px; border-bottom: 1px solid #1D3557; color: #F8FAFC; }
          .summary-box { background: #0A1422; border: 1px solid #1D3557; padding: 15px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #F8FAFC; margin-top: 25px; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px dashed #1D3557; padding-top: 15px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>AJ Enterprise</h2>
            <p>${periodText} &nbsp;|&nbsp; ম্যানেজার: ${currentUser.role === 'ADMIN' ? staffText : currentUser.name}</p>
          </div>
          <img src="https://i.postimg.cc/9MnZNrQ6/AJ-Enterprise-LOGO.png" style="height: 45px; object-fit: contain;" />
        </div>
        
        <div class="cards">
          <div class="card green"><div class="card-title">মোট টিকেট বিক্রি</div><div class="card-value" style="color: #10B981;">${totalTicketsCount.toLocaleString('en-IN')} টি</div></div>
          <div class="card green"><div class="card-title">মোট কমিশন ইনকাম</div><div class="card-value" style="color: #10B981;">৳ ${totalCommission.toLocaleString('en-IN')}</div></div>
          <div class="card red"><div class="card-title">অফিস খরচ</div><div class="card-value" style="color: #EF4444;">৳ ${totalExpense.toLocaleString('en-IN')}</div></div>
          <div class="card blue"><div class="card-title">নিট ক্যাশ</div><div class="card-value" style="color: #3B82F6;">৳ ${(totalCommission - totalExpense).toLocaleString('en-IN')}</div></div>
        </div>

        ${busWisePdfSection}

        <h3 style="font-size: 16px; margin: 25px 0 10px; color: #10B981; border-bottom: 2px solid #1D3557; padding-bottom: 8px;">
          📈 ১. ইনকাম এর বিবরণী (সেলস ট্রানজ্যাকশন)
        </h3>
        <table>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>স্টাফ নাম</th>
              <th>বিবরণ</th>
              <th>টিকেট</th>
              <th>ইনকাম (জমা)</th>
            </tr>
          </thead>
          <tbody>
            ${incomeRows}
          </tbody>
        </table>

        <h3 style="font-size: 16px; margin: 25px 0 10px; color: #EF4444; border-bottom: 2px solid #1D3557; padding-bottom: 8px;">
          📉 ২. খরচ এর বিবরণী (এক্সপেন্স ট্রানজ্যাকশন)
        </h3>
        <table>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>স্টাফ নাম</th>
              <th>বিবরণ / খাত</th>
              <th>খরচ</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows}
          </tbody>
        </table>

        <div class="summary-box">
          <b>সর্বমোট সারসংক্ষেপ (${periodText}):</b><br/><br/>
          * মোট টিকেট বিক্রি: <b style="color: #10B981;">${totalTicketsCount.toLocaleString('en-IN')} টি</b><br/>
          * মোট কমিশন ইনকাম: <b style="color: #10B981;">৳ ${totalCommission.toLocaleString('en-IN')}</b><br/>
          * মোট অফিস খরচ: <b style="color: #EF4444;">৳ ${totalExpense.toLocaleString('en-IN')}</b><br/>
          * নিট ক্যাশ ব্যালেন্স: <b style="color: #3B82F6;">৳ ${(totalCommission - totalExpense).toLocaleString('en-IN')}</b>
        </div>

        <div class="footer">AJ Enterprise Management System Generated Report</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); }</script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!currentUser) {
    return (
      <LoginForm 
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Hind Siliguri', sans-serif", backgroundColor: '#050B14', minHeight: '100vh', padding: '28px', color: '#F8FAFC' }}>
      <div style={{ maxWidth: '1650px', margin: '0 auto' }}>
        
        <h1 style={{ background: 'linear-gradient(135deg, #0A1422 0%, #12243A 100%)', color: '#F8FAFC', padding: '16px', marginBottom: '24px', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center', fontSize: '20px', border: '1px solid #1D3557', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>AJ Enterprise (এজে এন্টারপ্রাইজ)</h1>

        <DashboardHeader 
          currentUser={currentUser}
          isOnline={isOnline}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          setShowPasswordModal={setShowPasswordModal}
          handleLogout={logout}
          staffDataMap={staffDataMap}
          ticketSellingStaff={TICKET_SELLING_STAFF}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '28px 0' }}>
          <div style={{ backgroundColor: '#0D1B2A', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', border: '1px solid #1D3557', borderLeft: '5px solid #F59E0B' }}>
            <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>মোট টিকেট বিক্রি</span>
            <h2 style={{ margin: '10px 0 0', color: '#F59E0B', fontSize: '24px', fontWeight: '700' }}>{totalTicketsCount.toLocaleString('en-IN')} টি</h2>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', border: '1px solid #1D3557', borderLeft: '5px solid #10B981' }}>
            <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>মোট কমিশন ইনকাম</span>
            <h2 style={{ margin: '10px 0 0', color: '#10B981', fontSize: '24px', fontWeight: '700' }}>৳ {totalCommission.toLocaleString('en-IN')}</h2>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', border: '1px solid #1D3557', borderLeft: '5px solid #EF4444' }}>
            <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>অফিস খরচ</span>
            <h2 style={{ margin: '10px 0 0', color: '#EF4444', fontSize: '24px', fontWeight: '700' }}>৳ {totalExpense.toLocaleString('en-IN')}</h2>
          </div>
          <div style={{ backgroundColor: '#0D1B2A', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', border: '1px solid #1D3557', borderLeft: '5px solid #2563EB' }}>
            <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>নিট ক্যাশ</span>
            <h2 style={{ margin: '10px 0 0', color: '#3B82F6', fontSize: '24px', fontWeight: '700' }}>৳ {(totalCommission - totalExpense).toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: currentUser?.role === 'ADMIN' ? '1fr' : '1fr 2fr', gap: '28px', alignItems: 'start' }}>
          
          {currentUser?.role !== 'ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <StaffDashboard currentUser={currentUser} staffDataMap={staffDataMap} sendToGoogleSheet={sendToGoogleSheet} />
            </div>
          )}

          <div style={{ background: '#0D1B2A', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #1D3557', color: '#F8FAFC' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1D3557', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#F8FAFC', fontWeight: '700' }}>📋 সেলস ও রিপোর্ট সামারি ({filterMode === 'monthly' ? `মাস: ${formatMonth(selectedMonth)}` : filterMode === 'daily' ? `তারিখ: ${formatDate(selectedDate)}` : `সময়কাল: ${formatDate(startDate)} হতে ${formatDate(endDate)}`})</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={downloadPDF} style={{ padding: '8px 16px', background: '#12243A', color: '#F8FAFC', border: '1px solid #1D3557', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🖨️ প্রিন্ট / PDF</button>
                <button onClick={() => setShowReport(!showReport)} style={{ padding: '8px 16px', background: '#12243A', color: '#94A3B8', border: '1px solid #1D3557', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>{showReport ? 'রিপোর্ট লুকান' : 'রিপোর্ট দেখুন'}</button>
              </div>
            </div>

            {showReport && (
              <div>
                {filterMode === 'monthly' && (
                  <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontSize: '15px', color: '#3B82F6', marginBottom: '10px' }}>🚌 প্রতিটা কাউন্টার ও বাসের মাসিক মোট হিসাব ({formatMonth(selectedMonth)})</h4>
                    <div style={{ overflowX: 'auto', background: '#0A1422', borderRadius: '12px', padding: '12px', border: '1px solid #1D3557' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#F8FAFC' }}>
                        <thead>
                          <tr style={{ background: '#12243A', color: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #1D3557' }}>
                            <th style={{ padding: '10px' }}>কাউন্টার / বাস ও ধরন</th>
                            <th style={{ padding: '10px' }}>কমিশন এর পরিমাণ</th>
                            <th style={{ padding: '10px' }}>মোট টিকেট</th>
                            <th style={{ padding: '10px' }}>মোট কমিশন (টাকা)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedBusWiseMonthlySummary.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#94A3B8' }}>কোনো তথ্য পাওয়া যায়নি</td></tr>
                          ) : (
                            sortedBusWiseMonthlySummary.map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #1D3557' }}>
                                <td style={{ padding: '10px', fontWeight: '600', color: '#F8FAFC' }}>{item.transport} ({item.ticketType})</td>
                                <td style={{ padding: '10px', color: '#3B82F6', fontWeight: 'bold' }}>{item.rateDisplay}</td>
                                <td style={{ padding: '10px', color: '#10B981', fontWeight: 'bold' }}>{item.totalTickets.toLocaleString('en-IN')} টি</td>
                                <td style={{ padding: '10px', color: '#10B981', fontWeight: 'bold' }}>৳ {item.totalCommission.toLocaleString('en-IN')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '18px', color: '#F8FAFC', marginBottom: '20px', borderLeft: '4px solid #2563EB', paddingLeft: '10px' }}>
                    📜 বিস্তারিত ট্রানজ্যাকশন ও স্টেটমেন্ট
                  </h3>

                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '16px', color: '#10B981', marginBottom: '12px' }}>🟢 ১. ইনকাম এর টেবিল (সেলস ট্রানজ্যাকশন)</h4>
                    <div style={{ overflowX: 'auto', background: '#0A1422', borderRadius: '12px', padding: '12px', border: '1px solid #1D3557' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', color: '#F8FAFC' }}>
                        <thead>
                          <tr style={{ background: '#12243A', color: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #1D3557' }}>
                            <th style={{ padding: '12px' }}>তারিখ</th>
                            <th style={{ padding: '12px' }}>স্টাফ নাম</th>
                            <th style={{ padding: '12px' }}>বিবরণ / বাস</th>
                            <th style={{ padding: '12px' }}>টিকেট</th>
                            <th style={{ padding: '12px' }}>ইনকাম (জমা)</th>
                            {currentUser?.role === 'ADMIN' && <th style={{ padding: '12px', textAlign: 'right' }}>অ্যাকশন</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSales.length === 0 ? (
                            <tr><td colSpan={currentUser?.role === 'ADMIN' ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>কোনো ইনকাম বা বিক্রির তথ্য পাওয়া যায়নি</td></tr>
                          ) : (
                            sortedSales.map((s) => {
                              const rawCommType = s.commissionType || s.rateType || 'fixed';
                              const isPercent = rawCommType === 'percent' || rawCommType === 'percentage';
                              return (
                              <tr key={s.id} style={{ borderBottom: '1px solid #1D3557', color: '#F8FAFC' }}>
                                <td style={{ padding: '12px', color: '#94A3B8' }}>{formatDate(s.date)}</td>
                                <td style={{ padding: '12px', fontWeight: '600', color: '#F8FAFC' }}>{s.staffName}</td>
                                <td style={{ padding: '12px', color: '#CBD5E1' }}>টিকিট বিক্রি: {normalizeTransport(s.transport)} [{s.ticketType || 'AC'}] - {Number(s.tickets).toLocaleString('en-IN')} টি (রেট: {Number(s.rate).toLocaleString('en-IN')}{isPercent ? '%' : ' টাকা'})</td>
                                <td style={{ padding: '12px', color: '#CBD5E1' }}>{Number(s.tickets).toLocaleString('en-IN')} টি</td>
                                <td style={{ padding: '12px', color: '#10B981', fontWeight: 'bold' }}>৳ {Number(s.total).toLocaleString('en-IN')}</td>
                                {currentUser?.role === 'ADMIN' && (
                                  <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <button onClick={() => handleOpenEditSale(s)} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', fontSize: '13px', fontWeight: '600' }}>এডিট</button>
                                    <button onClick={() => handleDeleteSale(s.id)} style={{ padding: '5px 12px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>ডিলিট</button>
                                  </td>
                                )}
                              </tr>
                            );})
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '16px', color: '#EF4444', marginBottom: '12px' }}>🔴 ২. খরচ এর টেবিল (এক্সপেন্স ট্রানজ্যাকশন)</h4>
                    <div style={{ overflowX: 'auto', background: '#0A1422', borderRadius: '12px', padding: '12px', border: '1px solid #1D3557' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', color: '#F8FAFC' }}>
                        <thead>
                          <tr style={{ background: '#12243A', color: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #1D3557' }}>
                            <th style={{ padding: '12px' }}>তারিখ</th>
                            <th style={{ padding: '12px' }}>স্টাফ নাম</th>
                            <th style={{ padding: '12px' }}>বিবরণ / খাত</th>
                            <th style={{ padding: '12px' }}>খরচ</th>
                            {currentUser?.role === 'ADMIN' && <th style={{ padding: '12px', textAlign: 'right' }}>অ্যাকশন</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedExpenses.length === 0 ? (
                            <tr><td colSpan={currentUser?.role === 'ADMIN' ? 5 : 4} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>কোনো খরচের তথ্য পাওয়া যায়নি</td></tr>
                          ) : (
                            sortedExpenses.map((e) => (
                              <tr key={e.id} style={{ borderBottom: '1px solid #1D3557', color: '#F8FAFC' }}>
                                <td style={{ padding: '12px', color: '#94A3B8' }}>{formatDate(e.date)}</td>
                                <td style={{ padding: '12px', fontWeight: '600', color: '#F8FAFC' }}>{e.staffName}</td>
                                <td style={{ padding: '12px', color: '#CBD5E1' }}>[{e.category}] {e.description}</td>
                                <td style={{ padding: '12px', color: '#EF4444', fontWeight: 'bold' }}>৳ {Number(e.amount).toLocaleString('en-IN')}</td>
                                {currentUser?.role === 'ADMIN' && (
                                  <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <button onClick={() => handleDeleteExpense(e.id)} style={{ padding: '5px 12px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>ডিলিট</button>
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>

        {currentUser?.role === 'ADMIN' && (
          <div style={{ marginTop: '35px', background: '#0D1B2A', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #1D3557', color: '#F8FAFC' }}>
            <AdminPanel 
              staffDataMap={staffDataMap} 
              sales={filteredSales} 
              expenses={filteredExpenses} 
              filterMode={filterMode} 
              selectedMonth={selectedMonth} 
              selectedDate={selectedDate}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}

        {showEditModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(5, 11, 20, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#0D1B2A', padding: '30px', borderRadius: '20px', width: '400px', border: '1px solid #1D3557', color: '#F8FAFC' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '19px', color: '#F8FAFC', fontWeight: '700' }}>✏️ বিক্রির হিসাব এডিট করুন</h3>
              <form onSubmit={handleUpdateSale} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>তারিখ</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>পরিবহন / কাউন্টার</label>
                  <input type="text" value={editTransport} onChange={e => setEditTransport(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>বাসের ধরন</label>
                    <select value={editTicketType} onChange={e => setEditTicketType(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }}>
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>রেট টাইপ</label>
                    <select value={editCommissionType} onChange={e => setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }}>
                      <option value="fixed">টাকা</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>বিক্রিত টিকেট সংখ্যা</label>
                  <input type="number" value={editTickets} onChange={e => setEditTickets(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>কমিশন রেট</label>
                  <input type="number" value={editRate} onChange={e => setEditRate(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '10px 16px', background: '#12243A', color: '#94A3B8', border: '1px solid #1D3557', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>বাতিল</button>
                  <button type="submit" style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>আপডেট করুন</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(5, 11, 20, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#0D1B2A', padding: '30px', borderRadius: '20px', width: '380px', border: '1px solid #1D3557', color: '#F8FAFC' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '19px', color: '#F8FAFC', fontWeight: '700' }}>🔐 পাসওয়ার্ড পরিবর্তন</h3>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>পুরনো পাসওয়ার্ড</label>
                  <input type="password" placeholder="পুরনো পাসওয়ার্ড দিন" value={oldPasswordInput} onChange={e => setOldPasswordInput(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>নতুন পাসওয়ার্ড</label>
                  <input type="password" placeholder="নতুন পাসওয়ার্ড দিন" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>কনফার্ম নতুন পাসওয়ার্ড</label>
                  <input type="password" placeholder="আবার নতুন পাসওয়ার্ড দিন" value={confirmPasswordInput} onChange={e => setConfirmPasswordInput(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #1D3557', boxSizing: 'border-box', background: '#0A1422', color: '#F8FAFC', fontSize: '14px', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowPasswordModal(false)} style={{ padding: '10px 16px', background: '#12243A', color: '#94A3B8', border: '1px solid #1D3557', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>বাতিল,</button>
                  <button type="submit" style={{ padding: '10px 18px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>পরিবর্তন করুন</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}