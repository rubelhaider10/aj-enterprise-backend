import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// আপনার ফায়ারবেস কনফিগারেশন (আপনার প্রজেক্টের আসল ডাটা এখানে থাকবে)
const firebaseConfig = {
  apiKey: "AIzaSyCrjBZXCFifpNFfCrAihmJT1BGtTOIbzXM",
  authDomain: "aj-enterprise.firebaseapp.com",
  projectId: "aj-enterprise",
  storageBucket: "aj-enterprise.firebasestorage.app",
  messagingSenderId: "818010130106",
  appId: "1:818010130106:web:74932c3a936a66cc5b6483"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// আবশ্যिकভাবে firebaseConfig সহ এগুলো এক্সপোর্ট করতে হবে
export { app, auth, db, firebaseConfig };