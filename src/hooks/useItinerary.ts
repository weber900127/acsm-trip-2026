import { useState, useEffect } from 'react';
import { DayPlan, Activity, itineraryData as defaultData } from '../data/itinerary';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useItinerary() {
    const [itinerary, setItinerary] = useState<DayPlan[]>(defaultData);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firestore updates
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "trips", "main"), (docSnap) => {
            if (docSnap.exists()) {
                setItinerary(docSnap.data().days as DayPlan[]);
            } else {
                // First time initialization: upload default data
                setDoc(doc(db, "trips", "main"), { days: defaultData });
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
            await setDoc(doc(db, "trips", "main"), { days: newItinerary });
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("儲存失敗，請檢查網路連線");
        }
    };

    const addActivity = (dayId: string, activity: Activity) => {
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                return { ...day, activities: [...day.activities, activity] };
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
                return { ...day, activities: newActivities };
            }
            return day;
        });
        saveToFirestore(newItinerary);
    };

    const reorderActivity = (dayId: string, index: number, direction: 'up' | 'down') => {
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities];
                if (direction === 'up' && index > 0) {
                    [newActivities[index - 1], newActivities[index]] = [newActivities[index], newActivities[index - 1]];
                } else if (direction === 'down' && index < newActivities.length - 1) {
                    [newActivities[index + 1], newActivities[index]] = [newActivities[index], newActivities[index + 1]];
                }
                return { ...day, activities: newActivities };
            }
            return day;
        });
        saveToFirestore(newItinerary);
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
        resetItinerary,
        exportItinerary,
        importItinerary
    };
}
