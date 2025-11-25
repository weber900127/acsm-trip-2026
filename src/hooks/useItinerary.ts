import { useState, useEffect } from 'react';
import { DayPlan, Activity, itineraryData as defaultData } from '../data/itinerary';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useItinerary() {
    const [itinerary, setItinerary] = useState<DayPlan[]>(defaultData);
    const [loading, setLoading] = useState(true);

    // Use different document for dev vs prod to prevent overwriting production data
    const DOC_ID = import.meta.env.DEV ? "dev" : "main";

    // Subscribe to Firestore updates
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "trips", DOC_ID), (docSnap) => {
            if (docSnap.exists()) {
                setItinerary(docSnap.data().days as DayPlan[]);
            } else {
                // First time initialization: upload default data
                setDoc(doc(db, "trips", DOC_ID), { days: defaultData });
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // Helper to save changes to Firestore
    const saveToFirestore = async (newItinerary: DayPlan[]) => {
        try {
            await setDoc(doc(db, "trips", DOC_ID), { days: newItinerary });
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("儲存失敗，請檢查網路連線");
        }
    };

    // Helper to sort activities by time
    const sortActivities = (activities: Activity[]) => {
        return [...activities].sort((a, b) => {
            // Extract HH:mm from "HH:mm (TZ)" or just "HH:mm"
            const timeA = a.time.split(' ')[0];
            const timeB = b.time.split(' ')[0];
            return timeA.localeCompare(timeB);
        });
    };

    const addActivity = (dayId: string, activity: Activity) => {
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities, activity];
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });
        saveToFirestore(newItinerary);
    };

    const removeActivity = (dayId: string, index: number) => {
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities];
                newActivities.splice(index, 1);
                return { ...day, activities: newActivities };
            }
            return day;
        });
        saveToFirestore(newItinerary);
    };

    const updateActivity = (dayId: string, index: number, updatedActivity: Activity) => {
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities];
                newActivities[index] = updatedActivity;
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });
        saveToFirestore(newItinerary);
    };

    const moveActivity = (fromDayId: string, toDayId: string, activity: Activity, index?: number) => {
        const newItinerary = itinerary.map(day => {
            if (day.id === fromDayId) {
                // Remove from source
                const newActivities = [...day.activities];
                // If index is provided, remove at index. If not (adding new), nothing to remove.
                if (typeof index === 'number') {
                    newActivities.splice(index, 1);
                }
                return { ...day, activities: newActivities };
            }
            if (day.id === toDayId) {
                // Add to destination
                const newActivities = [...day.activities, activity];
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });
        saveToFirestore(newItinerary);
    };

    // Deprecated - kept for backwards compatibility but does nothing (auto-sorting is now enforced)
    const reorderActivity = (_dayId: string, _index: number, _direction: 'up' | 'down') => {
        console.warn('reorderActivity is deprecated. Activities are now automatically sorted by time.');
    };

    const resetItinerary = () => {
        if (confirm('確定要重置所有行程嗎？這將會覆蓋雲端上的資料。')) {
            saveToFirestore(defaultData);
        }
    };

    const exportItinerary = () => {
        const dataStr = JSON.stringify(itinerary, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `acsm-trip-itinerary-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importItinerary = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const parsed = JSON.parse(result);
                if (Array.isArray(parsed)) {
                    saveToFirestore(parsed);
                    alert('行程匯入成功並已同步至雲端！');
                } else {
                    alert('檔案格式錯誤：內容必須是行程陣列。');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('匯入失敗：檔案格式無效。');
            }
        };
        reader.readAsText(file);
    };

    return {
        itinerary,
        loading,
        addActivity,
        removeActivity,
        updateActivity,
        reorderActivity,
        moveActivity,
        resetItinerary,
        exportItinerary,
        importItinerary
    };
}
