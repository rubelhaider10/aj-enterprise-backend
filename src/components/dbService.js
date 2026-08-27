import { db, auth } from '../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword as createAuthUser } from 'firebase/auth';
import { doc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';

// হেল্পার ফাংশন: ব্যাকএন্ড API-এর বেস ইউআরএল নিরাপদে পাওয়ার জন্য
const getApiBaseUrl = () => {
  const configuredApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL : '';
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, '');
  }
  // লোকাল ডেভেলপমেন্টের জন্য ডিফল্ট ব্যাকএন্ড পোর্ট
  return 'http://localhost:5000';
};

// রিয়েল-টাইম লিসেনার বা সাবস্ক্রিপশন ফাংশনসমূহ
export const subscribeBooths = (callback) => {
  return onSnapshot(collection(db, "booths"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeSales = (callback) => {
  return onSnapshot(collection(db, "sales"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeExpenses = (callback) => {
  return onSnapshot(collection(db, "expenses"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeSalaries = (callback) => {
  return onSnapshot(collection(db, "salaries"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeStaff = (callback) => {
  return onSnapshot(collection(db, "staff"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};
export const subscribeStaffs = subscribeStaff;

export const subscribeCounters = (callback) => {
  return onSnapshot(collection(db, "counters"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const addCounterService = async (counterData) => {
  return await addDoc(collection(db, "counters"), counterData);
};
export const saveCounterService = addCounterService;

export const updateCounterService = async (id, updatedFields) => {
  await updateDoc(doc(db, "counters", id), updatedFields);
};

export const renameCounterReferencesService = async (oldName, newName) => {
  const oldValue = String(oldName || '').trim();
  const newValue = String(newName || '').trim();
  if (!oldValue || !newValue || oldValue === newValue) return;

  const collectionRules = [
    { name: 'staff', fields: ['branch'] },
    { name: 'booths', fields: ['counterName'] },
    { name: 'expenses', fields: ['counterName', 'branch', 'counter'] },
    { name: 'sales', fields: ['counterName', 'branch', 'counter'] },
    { name: 'salaries', fields: ['branch'] }
  ];

  const updates = [];
  for (const rule of collectionRules) {
    const snapshot = await getDocs(collection(db, rule.name));
    snapshot.docs.forEach((item) => {
      const data = item.data() || {};
      const patch = {};
      rule.fields.forEach((field) => {
        if (typeof data[field] === 'string' && data[field].trim() === oldValue) {
          patch[field] = newValue;
        }
      });
      if (Object.keys(patch).length) updates.push({ ref: item.ref, patch });
    });
  }

  for (let i = 0; i < updates.length; i += 450) {
    const batch = writeBatch(db);
    updates.slice(i, i + 450).forEach(({ ref, patch }) => batch.update(ref, patch));
    await batch.commit();
  }
};

export const setCounterDeletedStatus = async (id, isDeleted) => {
  await updateDoc(doc(db, "counters", id), { isDeleted });
};

export const permanentDeleteCounterService = async (id) => {
  await deleteDoc(doc(db, "counters", id));
};

export const createStaffService = async ({
  newName,
  newEmail,
  newPassword,
  newBuses,
  buses,
  newBranch,
  category
}) => {
  let secondaryApp = null;

  try {
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail || !newPassword) {
      return { success: false, error: 'ইমেইল ও পাসওয়ার্ড আবশ্যক।' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' };
    }

    secondaryApp = initializeApp(auth.app.options, "SecondaryAppForStaffCreation");
    const secondaryAuth = getAuth(secondaryApp);

    const credential = await createAuthUser(
      secondaryAuth,
      cleanEmail,
      newPassword
    );
    const createdUser = credential.user;

    const busSource = newBuses ?? buses ?? '';
    const busesArray = Array.isArray(busSource)
      ? busSource.map(b => String(b).trim()).filter(Boolean)
      : String(busSource)
          .split(',')
          .map(b => b.trim())
          .filter(Boolean);

    await setDoc(doc(db, "staff", cleanEmail), {
      name: newName,
      email: cleanEmail,
      uid: createdUser.uid,
      branch: newBranch,
      category: category || 'counter',
      buses: busesArray,
      role: 'STAFF',
      canExpense: true,
      basicSalary: 15000,
      advanceSalary: 0,
      isDeleted: false
    }, { merge: true });

    return { success: true, uid: createdUser.uid };
  } catch (error) {
    console.error('createStaffService error:', error);
    return {
      success: false,
      error: error?.message || 'স্টাফ তৈরি করা যায়নি।'
    };
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch (err) {
        console.warn('Secondary Firebase app cleanup failed:', err);
      }
    }
  }
};

export const updateStaffService = async (email, updateData) => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const staffRef = doc(db, "staff", cleanEmail);
    await updateDoc(staffRef, updateData);
  } catch (error) {
    const q = query(collection(db, "staff"), where("email", "==", cleanEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "staff", docId), updateData);
    } else {
      throw new Error("স্টাফ ডাটাবেজে পাওয়া যায়নি!");
    }
  }
};

export const setStaffDeletedStatus = async (email, isDeleted) => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await setDoc(doc(db, "staff", cleanEmail), { isDeleted }, { merge: true });
    return;
  } catch (error) {
    const q = query(collection(db, "staff"), where("email", "==", cleanEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, { isDeleted });
      return;
    }
    throw error;
  }
};

export const permanentDeleteStaffService = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('স্টাফের ইমেইল পাওয়া যায়নি।');

  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('অ্যাডমিন হিসেবে লগইন করা নেই।');

  const apiBaseUrl = getApiBaseUrl();

  const idToken = await currentUser.getIdToken();
  const response = await fetch(`${apiBaseUrl}/api/admin/delete-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ identifier: cleanEmail })
  });
  const rawText = await response.text();
  let data = {};
  try { data = rawText ? JSON.parse(rawText) : {}; } catch {}
  if (!response.ok || data.success !== true) {
    throw new Error(data.error || data.message || `Auth user delete failed (${response.status})`);
  }

  try {
    await deleteDoc(doc(db, 'staff', cleanEmail));
  } catch (error) {
    const q = query(collection(db, 'staff'), where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) await deleteDoc(snapshot.docs[0].ref);
    else throw error;
  }
};

export const changeStaffPasswordService = async (identifier, newPassword) => {
  try {
    const cleanIdentifier = String(identifier || '').trim();
    const cleanPassword = String(newPassword || '');

    if (!cleanIdentifier) {
      return { success: false, error: 'স্টাফের ইমেইল/UID পাওয়া যায়নি।' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' };
    }

    const apiBaseUrl = getApiBaseUrl();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        error: 'অ্যাডমিন হিসেবে লগইন করা নেই।'
      };
    }

    const idToken = await currentUser.getIdToken();

    const response = await fetch(
      `${apiBaseUrl}/api/admin/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          newPassword: cleanPassword
        })
      }
    );

    const rawText = await response.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.error ||
          data.message ||
          `সার্ভার Error (${response.status})`
      };
    }

    return {
      success: data.success === true,
      message: data.message || '',
      error: data.error || ''
    };
  } catch (error) {
    console.error('Password API Call Error:', error);

    return {
      success: false,
      error: error?.message || 'সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি।'
    };
  }
};

export const addBoothService = async (boothData) => {
  await addDoc(collection(db, "booths"), boothData);
};

export const updateBoothRentService = async (id, rent) => {
  await updateDoc(doc(db, "booths", id), { rent: Number(rent) });
};

export const setBoothDeletedStatus = async (id, isDeleted) => {
  await updateDoc(doc(db, "booths", id), { isDeleted });
};

export const permanentDeleteBoothService = async (id) => {
  await deleteDoc(doc(db, "booths", id));
};

export const addExpenseService = async (expenseData) => {
  await addDoc(collection(db, "expenses"), expenseData);
};

export const setExpenseDeletedStatus = async (id, isDeleted) => {
  await updateDoc(doc(db, "expenses", id), { isDeleted });
};

export const permanentDeleteExpenseService = async (id) => {
  await deleteDoc(doc(db, "expenses", id));
};

export const addSalaryService = async (salaryData) => {
  await addDoc(collection(db, "salaries"), salaryData);
};

export const setSalaryDeletedStatus = async (id, isDeleted) => {
  await updateDoc(doc(db, "salaries", id), { isDeleted });
};

export const permanentDeleteSalaryService = async (id) => {
  await deleteDoc(doc(db, "salaries", id));
};

export const addSaleService = async (saleData) => {
  await addDoc(collection(db, "sales"), saleData);
};
export const addSalesService = addSaleService;

export const setSaleDeletedStatus = async (id, isDeleted) => {
  await updateDoc(doc(db, "sales", id), { isDeleted });
};
export const setSalesDeletedStatus = setSaleDeletedStatus;

export const updateSaleService = async (id, updatedFields) => {
  await updateDoc(doc(db, "sales", id), updatedFields);
};
export const updateSalesService = updateSaleService;

export const permanentDeleteSaleService = async (id) => {
  await deleteDoc(doc(db, "sales", id));
};
export const permanentDeleteSalesService = permanentDeleteSaleService;