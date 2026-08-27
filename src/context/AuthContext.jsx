import React, { createContext, useContext, useState, useEffect } from 'react';

// কন্টটেক্সট তৈরি করা
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // ইউজার অবজেক্ট (যেমন: { email, role: 'ADMIN' বা 'STAFF' })
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // এখানে লোকাল স্টোরেজ বা ফায়ারবেস থেকে ইউজারের তথ্য চেক করতে পারেন
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // লগইন ফাংশন
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };

    // লগআউট ফাংশন
    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// কাস্টম হুক ব্যবহার করার জন্য
export const useAuth = () => {
    return useContext(AuthContext);
};