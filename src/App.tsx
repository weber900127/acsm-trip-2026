import { useState } from 'react';
import Header from './components/layout/Header';
import DayCard from './components/itinerary/DayCard';
import TripChecklist from './components/checklist/TripChecklist';
import ActivityFormModal from './components/itinerary/ActivityFormModal';
import WalletModal from './components/wallet/WalletModal';
import AIChatWidget from './components/ai/AIChatWidget';
import WeatherCard from './components/weather/WeatherCard';
import AdminManager from './components/auth/AdminManager';
import { useItinerary } from './hooks/useItinerary';
import { useWallet } from './hooks/useWallet';
import { useAuth } from './hooks/useAuth';
import { Activity } from './data/itinerary';
import { CITY_WEATHER } from './data/weather';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function App() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'SF' | 'SLC' | 'SAN' | 'LA'>('ALL');
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({ 'day1': true });
    const [isEditing, setIsEditing] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false);

    // Auth State
    const { user, login, logout, loading: authLoading, isUserAdmin, adminList } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingActivity, setEditingActivity] = useState<{ dayId: string, index: number, activity: Activity } | null>(null);

    const {
        itinerary,
        addActivity,
        updateActivity,
        removeActivity,
        moveActivity,
        exportItinerary,
        importItinerary
    } = useItinerary();

    const {
        walletItems,
        addWalletItem,
        updateWalletItem,
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
    const handleSaveActivity = (activity: Activity, targetDayId: string, syncToWallet?: boolean) => {
        const activityWithUser = {
            ...activity,
            modifiedBy: user?.displayName || 'Anonymous',
            modifiedAt: new Date().toISOString()
        };

        // Handle Wallet Sync
        if (syncToWallet && (activity.cost || 0) > 0) {
            let walletCategory: any = 'other';
            switch (activity.type) {
                case 'flight': walletCategory = 'flight'; break;
                case 'transport': walletCategory = 'transport'; break;
                case 'food': walletCategory = 'food'; break;
                case 'hotel': walletCategory = 'hotel'; break;
                case 'sightseeing': walletCategory = 'ticket'; break;
                default: walletCategory = 'other';
            }

            const walletItemData = {
                category: walletCategory,
                title: activity.title,
                reference: '',
                details: `${activity.time}`,
                cost: activity.cost
            };

            if (activity.walletItemId) {
                updateWalletItem(activity.walletItemId, walletItemData);
            } else {
                const newWalletId = addWalletItem(walletItemData);
                activityWithUser.walletItemId = newWalletId;
            }
        }

        if (editingActivity) {
            if (editingActivity.dayId === targetDayId) {
                // Update in place
                updateActivity(editingActivity.dayId, editingActivity.index, activityWithUser);
            } else {
                // Move to different day
                moveActivity(editingActivity.dayId, targetDayId, activityWithUser, editingActivity.index);
            }
        } else {
            // Add new
            addActivity(targetDayId, activityWithUser);
        }
        setIsModalOpen(false);
        setEditingActivity(null);
    };

    const handleEditActivity = (dayId: string, index: number, activity: Activity) => {
        setEditingActivity({ dayId, index, activity });
        setIsModalOpen(true);
    };

    const handleDeleteActivity = (dayId: string, index: number) => {
        if (confirm('確定要刪除這個行程嗎？')) {
            removeActivity(dayId, index);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-sunset-animated pb-12 font-sans text-gray-900 relative overflow-x-hidden">
            {/* Background Overlay for better text contrast - Force Rebuild */}
            <div className="fixed inset-0 bg-white/30 pointer-events-none z-0"></div>

            <div className="relative z-10">
                <Header
                    isEditing={isEditing}
                    onToggleEdit={() => setIsEditing(!isEditing)}
                    onExport={exportItinerary}
                    onImport={importItinerary}
                    onOpenWallet={() => setIsWalletOpen(true)}
                    onOpenSettings={() => setIsAdminManagerOpen(true)}
                    user={user}
                    isAdmin={isUserAdmin}
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
                            <div className="space-y-6">
                                {filteredItinerary.map((day) => (
                                    <DayCard
                                        key={day.id}
                                        day={day}
                                        isExpanded={!!expandedDays[day.id]}
                                        onToggle={() => toggleDay(day.id)}
                                        isEditing={isEditing}
                                        onAddActivity={() => {
                                            setEditingActivity({ dayId: day.id, index: -1, activity: {} as Activity });
                                            setIsModalOpen(true);
                                        }}
                                        onUpdateActivity={(index, activity) => handleEditActivity(day.id, index, activity)}
                                        onRemoveActivity={(index) => handleDeleteActivity(day.id, index)}
                                    />
                                ))}
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

                {/* Modals */}
                <ActivityFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingActivity(null);
                    }}
                    onSave={handleSaveActivity}
                    initialData={editingActivity?.activity}
                    availableDays={itinerary}
                    currentDayId={editingActivity?.dayId || itinerary[0]?.id}
                />

                <WalletModal
                    isOpen={isWalletOpen}
                    onClose={() => setIsWalletOpen(false)}
                    items={walletItems}
                    onAdd={addWalletItem}
                    onRemove={removeWalletItem}
                    onUpdate={updateWalletItem}
                    totalCost={totalTripCost}
                />

                {/* AI Assistant */}
                <AIChatWidget itinerary={itinerary} />

                <AdminManager
                    isOpen={isAdminManagerOpen}
                    onClose={() => setIsAdminManagerOpen(false)}
                    currentAdmins={adminList}
                    currentUserEmail={user?.email}
                />
            </div>
        </div>
    );
}

export default App;
