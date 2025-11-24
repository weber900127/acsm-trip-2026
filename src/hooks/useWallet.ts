import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type WalletCategory = 'flight' | 'hotel' | 'ticket' | 'insurance' | 'other';

export interface WalletItem {
    id: string;
    category: WalletCategory;
    title: string;
    reference: string;
    details: string;
    cost?: number;
}

const DEFAULT_WALLET_ITEMS: WalletItem[] = [
    {
        id: '1',
        category: 'flight',
        title: '星宇航空 JX012 (TPE-SFO)',
        reference: 'PNR: ABC12345',
        details: '2026/05/20 23:40 出發, 經濟艙',
        cost: 1200
    },
    {
        id: '2',
        category: 'hotel',
        title: 'San Francisco Marriott Marquis',
        reference: 'Conf: #8829102',
        details: '5/20 - 5/25 (5 Nights)',
        cost: 1500
    }
];

export function useWallet() {
    const [walletItems, setWalletItems] = useState<WalletItem[]>(DEFAULT_WALLET_ITEMS);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firestore updates
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "trips", "wallet"), (docSnap) => {
            if (docSnap.exists()) {
                setWalletItems(docSnap.data().items as WalletItem[]);
            } else {
                // First time initialization
                setDoc(doc(db, "trips", "wallet"), { items: DEFAULT_WALLET_ITEMS });
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const saveToFirestore = async (newItems: WalletItem[]) => {
        try {
            await setDoc(doc(db, "trips", "wallet"), { items: newItems });
        } catch (error) {
            console.error("Error saving wallet to Firestore:", error);
            alert("儲存失敗，請檢查網路連線");
        }
    };

    const addWalletItem = (item: Omit<WalletItem, 'id'>) => {
        const newItem = { ...item, id: crypto.randomUUID() };
        const newItems = [...walletItems, newItem];
        saveToFirestore(newItems);
    };

    const removeWalletItem = (id: string) => {
        const newItems = walletItems.filter(item => item.id !== id);
        saveToFirestore(newItems);
    };

    const updateWalletItem = (id: string, updatedItem: Omit<WalletItem, 'id'>) => {
        const newItems = walletItems.map(item =>
            item.id === id ? { ...item, ...updatedItem } : item
        );
        saveToFirestore(newItems);
    };

    const getTotalCost = () => {
        return walletItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    };

    return {
        walletItems,
        loading,
        addWalletItem,
        removeWalletItem,
        updateWalletItem,
        getTotalCost
    };
}
