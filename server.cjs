const express = require('express');
const cors = require('cors');
const { initializeApp, getApps } = require('firebase-admin/app');
const { cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ফায়ারবেস অ্যাডমিন এসডিকে ইনিশিয়ালাইজেশন (Modular Way)
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !privateKey) {
    console.warn(
      'Firebase Admin environment variables are incomplete. ' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

// Admin email whitelist.
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

// টেস্ট রুট
app.get('/', (req, res) => {
  res.send('AJ Enterprise API Server is Running!');
});

// Bearer token verify করে শুধু authenticated admin-কে অনুমতি দেওয়া
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication token দেওয়া হয়নি।'
      });
    }

    const idToken = authHeader.substring(7).trim();

    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token।'
      });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const email = String(decodedToken.email || '').toLowerCase();
    const adminEmails = getAdminEmails();

    const hasAdminClaim =
      decodedToken.admin === true ||
      decodedToken.role === 'ADMIN' ||
      decodedToken.role === 'admin';

    const isWhitelistedAdmin =
      email && adminEmails.includes(email);

    if (!hasAdminClaim && !isWhitelistedAdmin) {
      return res.status(403).json({
        success: false,
        error: 'এই কাজটি করার জন্য Admin permission প্রয়োজন।'
      });
    }

    req.adminUser = decodedToken;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);

    return res.status(401).json({
      success: false,
      error: 'Admin authentication ব্যর্থ হয়েছে। আবার লগইন করুন।'
    });
  }
};

// 🔒 অ্যাডমিন দ্বারা স্টাফের পাসওয়ার্ড আপডেট করার রুট
app.post('/api/admin/reset-password', verifyAdmin, async (req, res) => {
  const identifier = String(
    req.body?.identifier || req.body?.email || req.body?.uid || ''
  ).trim();

  const newPassword = String(req.body?.newPassword || '');

  if (!identifier || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'স্টাফের email/UID এবং নতুন পাসওয়ার্ড দেওয়া আবশ্যক!'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!'
    });
  }

  try {
    let userRecord;
    const auth = getAuth();

    if (identifier.includes('@')) {
      userRecord = await auth.getUserByEmail(
        identifier.toLowerCase()
      );
    } else {
      userRecord = await auth.getUser(identifier);
    }

    if (
      req.adminUser?.uid &&
      userRecord.uid === req.adminUser.uid
    ) {
      return res.status(400).json({
        success: false,
        error: 'অ্যাডমিন অ্যাকাউন্টের পাসওয়ার্ড এই রুট দিয়ে পরিবর্তন করা যাবে না।'
      });
    }

    await auth.updateUser(userRecord.uid, {
      password: newPassword
    });

    try {
      const db = getFirestore();
      await db.collection('staff').doc(userRecord.email.toLowerCase()).set(
        {
          uid: userRecord.uid,
          email: userRecord.email.toLowerCase()
        },
        { merge: true }
      );
    } catch (firestoreError) {
      console.warn(
        'Staff UID metadata update skipped:',
        firestoreError?.message || firestoreError
      );
    }

    return res.json({
      success: true,
      message: 'স্টাফের পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!'
    });
  } catch (error) {
    console.error('Password update error:', error);

    let message = error?.message || 'পাসওয়ার্ড আপডেট করা যায়নি।';

    if (error?.code === 'auth/user-not-found') {
      message = 'এই ইমেইল/UID দিয়ে Firebase Auth-এ কোনো স্টাফ পাওয়া যায়নি।';
    }

    return res.status(500).json({
      success: false,
      error: message
    });
  }
});

// 🔒 অ্যাডমিন দ্বারা স্টাফের Firebase Auth account স্থায়ীভাবে মুছে ফেলা
app.post('/api/admin/delete-user', verifyAdmin, async (req, res) => {
  const identifier = String(req.body?.identifier || req.body?.email || req.body?.uid || '').trim();
  if (!identifier) return res.status(400).json({ success: false, error: 'স্টাফের email/UID দেওয়া আবশ্যক!' });

  try {
    const auth = getAuth();
    const userRecord = identifier.includes('@')
      ? await auth.getUserByEmail(identifier.toLowerCase())
      : await auth.getUser(identifier);

    if (req.adminUser?.uid && userRecord.uid === req.adminUser.uid) {
      return res.status(400).json({ success: false, error: 'অ্যাডমিন নিজের account delete করতে পারবেন না।' });
    }

    await auth.deleteUser(userRecord.uid);
    return res.json({ success: true, message: 'Firebase Auth account সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('User delete error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'স্টাফ account delete করা যায়নি।' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});