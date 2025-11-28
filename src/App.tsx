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
        return <div className="min-h-screen flex items-center justify-center bg-[var(--paper-bg)] text-gray-500 font-hand text-xl">Loading your memories...</div>;
    }

    console.log("Scrapbook Theme Loaded v3");

    return (
        <div className="min-h-screen pb-12 relative overflow-x-hidden">
            {/* Paper Texture Overlay (Optional extra grain) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-50 mix-blend-multiply" style={{ backgroundImage: 'var(--paper-texture)' }}></div>

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
                    {/* Navigation Tabs - Scrapbook Style */}
                    <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide mb-6 no-scrollbar px-2">
                        {[
                            { id: 'ALL', label: 'All Trips' },
                            { id: 'SF', label: 'San Francisco' },
                            { id: 'SLC', label: 'Salt Lake City' },
                            { id: 'SAN', label: 'San Diego' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={clsx(
                                    "px-5 py-2 whitespace-nowrap text-sm font-bold transition-all relative group",
                                    activeTab === tab.id
                                        ? "text-white transform -rotate-1"
                                        : "text-gray-600 hover:text-gray-900 hover:rotate-1"
                                )}
                            >
                                {/* Ticket Shape Background */}
                                <div className={clsx(
                                    "absolute inset-0 border-2 border-dashed rounded-lg -z-10 transition-all",
                                    activeTab === tab.id
                                        ? "bg-gray-800 border-gray-800 shadow-md"
                                        : "bg-white border-gray-300 group-hover:border-gray-400"
                                )}></div>

                                {/* Holes for ticket look */}
                                <div className={clsx("absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--paper-bg)] border-r border-gray-300", activeTab === tab.id && "border-transparent")}></div>
                                <div className={clsx("absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--paper-bg)] border-l border-gray-300", activeTab === tab.id && "border-transparent")}></div>

                                <span className="font-heading tracking-wide uppercase">{tab.label}</span>
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
                            <TripChecklist isEditing={isEditing} />
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
