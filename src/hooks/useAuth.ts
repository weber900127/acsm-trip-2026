import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../data/admins';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [adminList, setAdminList] = useState<string[]>([]);

    // 1. Monitor Auth State
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (!user) {
                setIsUserAdmin(false);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    // 2. Monitor Admin List from Firestore
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "trips", "settings"), (docSnap) => {
            if (docSnap.exists()) {
                const admins = docSnap.data().adminEmails as string[];
                setAdminList(admins);
            } else {
                // Initialize with hardcoded admins if not exists
                setDoc(doc(db, "trips", "settings"), { adminEmails: ADMIN_EMAILS });
                setAdminList(ADMIN_EMAILS);
            }
        }, (error) => {
            console.error("Failed to sync admin list:", error);
            // Fallback to hardcoded list on error
            setAdminList(ADMIN_EMAILS);
        });

        return () => unsub();
    }, []);

    // 3. Check if current user is admin
    useEffect(() => {
        if (user && adminList.length > 0) {
            setIsUserAdmin(adminList.includes(user.email || ''));
            setLoading(false);
        } else if (user) {
            // User logged in but admin list not loaded yet or empty
            setIsUserAdmin(false);
            // Don't set loading false here, wait for admin list
        }
    }, [user, adminList]);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("登入失敗，請重試");
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return { user, isUserAdmin, adminList, loading, login, logout };
}
