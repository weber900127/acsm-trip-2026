import { useState, useEffect } from 'react';
import { DayPlan, Activity, itineraryData as defaultData } from '../data/itinerary';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useItinerary() {
    const [itinerary, setItinerary] = useState<DayPlan[]>(defaultData);
    const [loading, setLoading] = useState(true);
    const [unassignedActivities, setUnassignedActivities] = useState<Activity[]>([]);

    // History State
    const [past, setPast] = useState<{ days: DayPlan[], unassigned: Activity[] }[]>([]);

    // Use different document for dev vs prod to prevent overwriting production data
    const DOC_ID = import.meta.env.DEV ? "dev" : "main";

    // Subscribe to Firestore updates
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "trips", DOC_ID), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setItinerary(data.days as DayPlan[]);
                setUnassignedActivities((data.unassigned as Activity[]) || []);
            } else {
                // First time initialization: upload default data
                setDoc(doc(db, "trips", DOC_ID), { days: defaultData, unassigned: [] });
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // Helper to save changes to Firestore
    const saveToFirestore = async (newItinerary: DayPlan[], newUnassigned: Activity[]) => {
        try {
            await setDoc(doc(db, "trips", DOC_ID), { days: newItinerary, unassigned: newUnassigned });
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("儲存失敗，請檢查網路連線");
        }
    };

    // History Helper
    const saveToHistory = () => {
        setPast(prev => [...prev, { days: itinerary, unassigned: unassignedActivities }]);
    };

    const undo = () => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setPast(newPast);
        // Optimistic update
        setItinerary(previous.days);
        setUnassignedActivities(previous.unassigned);
        // Sync to Firestore
        saveToFirestore(previous.days, previous.unassigned);
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
        saveToHistory();
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities, activity];
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });
        saveToFirestore(newItinerary, unassignedActivities);
    };

    const removeActivity = (dayId: string, index: number) => {
        saveToHistory();
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities];
                newActivities.splice(index, 1);
                return { ...day, activities: newActivities };
            }
            return day;
        });
        saveToFirestore(newItinerary, unassignedActivities);
    };

    const updateActivity = (dayId: string, index: number, updatedActivity: Activity) => {
        saveToHistory();
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities];
                newActivities[index] = updatedActivity;
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });
        saveToFirestore(newItinerary, unassignedActivities);
    };

    const moveActivity = (fromDayId: string, toDayId: string, activity: Activity, index?: number) => {
        saveToHistory();
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
        saveToFirestore(newItinerary, unassignedActivities);
    };

    // Idea Pool Operations
    const addToIdeaPool = (activity: Activity) => {
        saveToHistory();
        const newUnassigned = [...unassignedActivities, activity];
        saveToFirestore(itinerary, newUnassigned);
    };

    const removeFromIdeaPool = (index: number) => {
        saveToHistory();
        const newUnassigned = [...unassignedActivities];
        newUnassigned.splice(index, 1);
        saveToFirestore(itinerary, newUnassigned);
    };

    const moveFromPoolToDay = (poolIndex: number, dayId: string) => {
        saveToHistory();
        const activity = unassignedActivities[poolIndex];
        const newUnassigned = [...unassignedActivities];
        newUnassigned.splice(poolIndex, 1);

        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                const newActivities = [...day.activities, activity];
                return { ...day, activities: sortActivities(newActivities) };
            }
            return day;
        });

        saveToFirestore(newItinerary, newUnassigned);
    };

    const updateDayInfo = (dayId: string, title: string, summary: string) => {
        saveToHistory();
        const newItinerary = itinerary.map(day => {
            if (day.id === dayId) {
                return { ...day, title, summary };
            }
            return day;
        });
        saveToFirestore(newItinerary, unassignedActivities);
    };

    // Deprecated - kept for backwards compatibility but does nothing (auto-sorting is now enforced)
    const reorderActivity = (_dayId: string, _index: number, _direction: 'up' | 'down') => {
        console.warn('reorderActivity is deprecated. Activities are now automatically sorted by time.');
    };

    const resetItinerary = () => {
        if (confirm('確定要重置所有行程嗎？這將會覆蓋雲端上的資料。')) {
            saveToHistory();
            saveToFirestore(defaultData, []);
        }
    };

    const exportItinerary = () => {
        const dataStr = JSON.stringify({ days: itinerary, unassigned: unassignedActivities }, null, 2);
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

    const exportItineraryText = () => {
        let text = `🇺🇸 ACSM 2026 Trip Itinerary\n\n`;

        itinerary.forEach(day => {
            text += `📅 ${day.date} - ${day.title}\n`;
            if (day.summary) text += `📝 ${day.summary}\n`;

            if (day.activities.length === 0) {
                text += `   (No activities)\n`;
            } else {
                day.activities.forEach(act => {
                    text += `   ⏰ ${act.time} ${act.title}\n`;
                    if (act.location) text += `      📍 ${act.location}\n`;
                    if (act.tips) text += `      💡 ${act.tips}\n`;
                });
            }
            text += `\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            alert('行程已複製到剪貼簿！可以去 Line 分享囉 📋');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('複製失敗，請手動選取複製');
        });
    };

    const importItinerary = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const parsed = JSON.parse(result);

                saveToHistory();
                // Handle legacy format (array only) or new format (object with days/unassigned)
                if (Array.isArray(parsed)) {
                    saveToFirestore(parsed, []);
                    alert('行程匯入成功並已同步至雲端！');
                } else if (parsed.days && Array.isArray(parsed.days)) {
                    saveToFirestore(parsed.days, parsed.unassigned || []);
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
        unassignedActivities,
        loading,
        addActivity,
        removeActivity,
        updateActivity,
        reorderActivity,
        moveActivity,
        addToIdeaPool,
        removeFromIdeaPool,
        moveFromPoolToDay,
        resetItinerary,
        exportItinerary,
        exportItineraryText,
        importItinerary,
        updateDayInfo,
        undo,
        canUndo: past.length > 0
    };
}
