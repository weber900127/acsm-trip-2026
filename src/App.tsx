import { useState } from 'react';
import Header from './components/layout/Header';
import DayCard from './components/itinerary/DayCard';
import TripChecklist from './components/checklist/TripChecklist';
import ActivityFormModal from './components/itinerary/ActivityFormModal';
import WalletModal from './components/wallet/WalletModal';
import WeatherCard from './components/weather/WeatherCard';
import { useItinerary } from './hooks/useItinerary';
import { useWallet } from './hooks/useWallet';
import { useAuth } from './hooks/useAuth';
import { Activity } from './data/itinerary';
import { CITY_WEATHER } from './data/weather';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function App() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'SF' | 'SLC' | 'SAN' | 'LA'>('ALL');
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({ 'day1': true });
    const [isEditing, setIsEditing] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);

    // Auth State
    const { user, login, logout, loading: authLoading } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
    const [editingActivityData, setEditingActivityData] = useState<Activity | undefined>(undefined);

    const {
        itinerary,
        addActivity,
        updateActivity,
        removeActivity,
        reorderActivity,
        exportItinerary,
        importItinerary
    } = useItinerary();

    const {
        walletItems,
        addWalletItem,
        removeWalletItem,
        getTotalCost: getWalletCost
    } = useWallet();

    const toggleDay = (dayId: string) => {
        setExpandedDays(prev => ({
            ...prev,
            [dayId]: !prev[dayId]
        }));
    };

    const filteredItinerary = activeTab === 'ALL'
        ? itinerary
        : itinerary.filter(day => day.city === activeTab || (activeTab === 'LA' && day.city === 'LA'));

    // Calculate Total Trip Cost
    const totalItineraryCost = itinerary.reduce((sum, day) => {
        return sum + day.activities.reduce((dSum, act) => dSum + (act.cost || 0), 0);
    }, 0);
    const totalTripCost = totalItineraryCost + getWalletCost();

    // Handlers
    const handleAddClick = (dayId: string) => {
        setEditingDayId(dayId);
        setEditingActivityIndex(null);
        setEditingActivityData(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (dayId: string, index: number, activity: Activity) => {
        setEditingDayId(dayId);
        setEditingActivityIndex(index);
        setEditingActivityData(activity);
        setIsModalOpen(true);
    };

    const handleSaveActivity = (activity: Activity) => {
        const activityWithUser = {
            ...activity,
            modifiedBy: user?.displayName || user?.email || 'Anonymous',
            modifiedAt: new Date().toISOString()
        };

        if (editingDayId) {
            if (editingActivityIndex !== null) {
                updateActivity(editingDayId, editingActivityIndex, activityWithUser);
            } else {
                addActivity(editingDayId, activityWithUser);
            }
        }
        setIsModalOpen(false);
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
            <Header
                isEditing={isEditing}
                onToggleEdit={() => setIsEditing(!isEditing)}
                onExport={exportItinerary}
                onImport={importItinerary}
                onOpenWallet={() => setIsWalletOpen(true)}
                user={user}
                onLogin={login}
                onLogout={logout}
            />

            <main className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-4 no-scrollbar">
                    {[
                        { id: 'ALL', label: '全部行程' },
                        { id: 'SF', label: '舊金山 (5/20-25)' },
                        { id: 'SLC', label: '鹽湖城 (5/25-30)' },
                        { id: 'SAN', label: '聖地亞哥 (5/30-6/4)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm border",
                                activeTab === tab.id
                                    ? "bg-white text-indigo-600 ring-2 ring-indigo-500 border-transparent z-10"
                                    : "bg-white/80 text-gray-600 hover:bg-white border-transparent hover:border-gray-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Weather Card */}
                <AnimatePresence mode="wait">
                    {activeTab !== 'ALL' && CITY_WEATHER[activeTab] && (
                        <WeatherCard
                            key={activeTab}
                            city={activeTab}
                            info={CITY_WEATHER[activeTab]}
                        />
                    )}
                </AnimatePresence>

                {/* Auth Guard: Only show content if logged in */}
                {!user ? (
                    <div className="bg-white rounded-2xl p-8 shadow-sm text-center mt-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">請先登入</h2>
                        <p className="text-gray-500 mb-6">為了保護行程資料，請使用 Google 帳號登入後查看。</p>
                        <button
                            onClick={login}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            使用 Google 登入
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Itinerary List */}
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredItinerary.map((day) => (
                                    <motion.div
                                        key={day.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <DayCard
                                            day={day}
                                            isExpanded={!!expandedDays[day.id]}
                                            onToggle={() => toggleDay(day.id)}
                                            isEditing={isEditing}
                                            onAddActivity={() => handleAddClick(day.id)}
                                            onUpdateActivity={(idx, act) => handleEditClick(day.id, idx, act)}
                                            onRemoveActivity={(idx) => removeActivity(day.id, idx)}
                                            onReorderActivity={(idx, dir) => reorderActivity(day.id, idx, dir)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Checklist Section */}
                        <TripChecklist />
                    </>
                )}

                {/* Footer Note */}
                <div className="mt-12 text-center text-xs text-gray-400 pb-8">
                    <p>行程時間僅供參考，請以當時實際航班與交通狀況為準。</p>
                    <p className="mt-2">Created for 2026 ACSM Trip</p>
                </div>

            </main>

            <ActivityFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveActivity}
                initialData={editingActivityData}
            />

            <WalletModal
                isOpen={isWalletOpen}
                onClose={() => setIsWalletOpen(false)}
                items={walletItems}
                onAdd={addWalletItem}
                onRemove={removeWalletItem}
                totalCost={totalTripCost}
            />
        </div>
    );
}

export default App;
