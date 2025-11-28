import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Paperclip, Image as ImageIcon, Link as LinkIcon, Trash2, Wand2, MapPin } from 'lucide-react';
import { Activity, ActivityType, Attachment, DayPlan } from '../../data/itinerary';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { parseCoordinatesFromUrl } from '../../utils/googleMapsParser';
import LocationPicker from '../map/LocationPicker';

interface ActivityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Activity, targetDayId: string, syncToWallet?: boolean) => void;
    initialData?: Activity;
    availableDays: DayPlan[];
    currentDayId: string;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
    { value: 'flight', label: '飛行' },
    { value: 'transport', label: '交通' },
    { value: 'food', label: '餐飲' },
    { value: 'sightseeing', label: '觀光' },
    { value: 'hotel', label: '住宿' },
    { value: 'conference', label: '會議' },
    { value: 'other', label: '其他' },
];

export default function ActivityFormModal({ isOpen, onClose, onSave, initialData, availableDays, currentDayId }: ActivityFormModalProps) {
    const [formData, setFormData] = useState<Activity>({
        time: '',
        title: '',
        description: '',
        type: 'other',
        location: '',
        tips: '',
        attachments: []
    });
    const [timeValue, setTimeValue] = useState('');
    const [timezoneValue, setTimezoneValue] = useState('(Local)');
    const [selectedDayId, setSelectedDayId] = useState(currentDayId);
    const [syncToWallet, setSyncToWallet] = useState(false);

    // Attachment states
    const [isUploading, setIsUploading] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkLabel, setNewLinkLabel] = useState('');

    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedDayId(currentDayId);
            if (initialData) {
                setFormData({ ...initialData, attachments: initialData.attachments || [] });
                // Parse time string "14:00 (TPE)" -> "14:00" and "(TPE)"
                // Updated regex to support single digit hours "9:00"
                const match = initialData.time.match(/^(\d{1,2}:\d{2})\s*(\(.*\))?$/);
                if (match) {
                    // Ensure HH is padded with 0 if needed (e.g. 9:00 -> 09:00) for input[type="time"]
                    const timePart = match[1];
                    const [hours, minutes] = timePart.split(':');
                    const paddedTime = `${hours.padStart(2, '0')}:${minutes}`;

                    setTimeValue(paddedTime);
                    setTimezoneValue(match[2] || '(Local)');
                } else {
                    setTimeValue(initialData.time);
                    setTimezoneValue('(Local)');
                }
                setSyncToWallet(!!initialData.walletItemId);
            } else {
                setFormData({
                    time: '',
                    title: '',
                    description: '',
                    type: 'other',
                    location: '',
                    tips: '',
                    attachments: [],
                    coordinates: undefined
                });
                setTimeValue('');
                setTimezoneValue('(Local)');
                setSyncToWallet(false);
            }
        }
    }, [initialData, isOpen, currentDayId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullTime = timezoneValue === '(Local)' ? timeValue : `${timeValue} ${timezoneValue} `;
        onSave({ ...formData, time: fullTime }, selectedDayId, syncToWallet);
        onClose();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `trip_images / ${Date.now()}_${file.name} `);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const newAttachment: Attachment = {
                id: Date.now().toString(),
                type: 'image',
                url: url,
                label: file.name
            };

            setFormData(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), newAttachment]
            }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("上傳失敗，請確認網路或權限");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddLink = () => {
        if (!newLinkUrl) return;
        const newAttachment: Attachment = {
            id: Date.now().toString(),
            type: 'link',
            url: newLinkUrl,
            label: newLinkLabel || newLinkUrl
        };
        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), newAttachment]
        }));
        setNewLinkUrl('');
        setNewLinkLabel('');
        setShowLinkInput(false);
    };

    const removeAttachment = (id: string) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter(a => a.id !== id)
        }));
    };

    const generateSmartNotes = () => {
        let notes = '';
        const type = formData.type;
        const title = formData.title.toLowerCase();

        switch (type) {
            case 'flight':
                notes = '記得提前 2-3 小時抵達機場報到。檢查護照效期 (至少 6 個月)。確認托運行李與隨身行李額度。下載航空公司 App 以便隨時查看航班動態。';
                break;
            case 'transport':
                if (title.includes('uber') || title.includes('lyft')) {
                    notes = '確認上車地點與車牌號碼。';
                } else if (title.includes('train') || title.includes('rail')) {
                    notes = '確認月台資訊與發車時間。建議提前 15 分鐘抵達車站。';
                } else {
                    notes = '預留緩衝時間以防塞車。確認票券是否需列印或可使用電子票證。';
                }
                break;
            case 'food':
                notes = '建議提前訂位。美國餐廳通常需支付 15-20% 小費。確認是否有特殊飲食限制 (如過敏)。';
                break;
            case 'sightseeing':
                notes = '確認景點開放時間與休館日。建議穿著舒適好走的鞋子。攜帶水壺與防曬用品。檢查是否需要事先預約門票。';
                break;
            case 'hotel':
                notes = '入住時間 (Check-in) 通常為 15:00，退房時間 (Check-out) 通常為 11:00。準備信用卡以支付押金。確認是否提供免費早餐與 Wi-Fi。';
                break;
            case 'conference':
                notes = '記得攜帶識別證 (Badge) 與名片。確認議程與會議室位置。準備筆記本或平板電腦。';
                break;
            default:
                notes = '確認行程細節與聯絡方式。';
        }

        if (formData.tips && !confirm('原本的備註將被覆蓋，確定要產生新的建議嗎？')) {
            return;
        }

        setFormData(prev => ({ ...prev, tips: notes }));
    };

    const TIMEZONES = [
        { value: '(TPE)', label: '台北 (TPE)' },
        { value: '(SFO)', label: '舊金山 (SFO)' },
        { value: '(SLC)', label: '鹽湖城 (SLC)' },
        { value: '(SAN)', label: '聖地牙哥 (SAN)' },
        { value: '(LAX)', label: '洛杉磯 (LAX)' },
        { value: '(Local)', label: '當地時間' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {initialData ? '編輯行程' : '新增行程'}
                                </h3>
                                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={selectedDayId}
                                        onChange={e => setSelectedDayId(e.target.value)}
                                    >
                                        {availableDays.map(day => (
                                            <option key={day.id} value={day.id}>
                                                {day.date} - {day.cityLabel}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                required
                                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={timeValue}
                                                onChange={e => setTimeValue(e.target.value)}
                                            />
                                            {/* Quick Select Dropdown */}
                                            <select
                                                className="w-24 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50"
                                                onChange={e => {
                                                    if (e.target.value) setTimeValue(e.target.value);
                                                }}
                                                value=""
                                            >
                                                <option value="" disabled>快速選擇</option>
                                                {Array.from({ length: 48 }).map((_, i) => {
                                                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                                                    const m = i % 2 === 0 ? '00' : '30';
                                                    return (
                                                        <option key={i} value={`${h}:${m}`}>
                                                            {`${h}:${m}`}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">時區</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={timezoneValue}
                                            onChange={e => setTimezoneValue(e.target.value)}
                                        >
                                            {TIMEZONES.map(tz => (
                                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as ActivityType })}
                                        >
                                            {ACTIVITY_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">地點 (選填)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.location || ''}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">預估費用 (USD)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.cost || 0}
                                            onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-gray-700">備註/小撇步 (選填)</label>
                                            <button
                                                type="button"
                                                onClick={generateSmartNotes}
                                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors"
                                                title="自動產生建議"
                                            >
                                                <Wand2 size={12} />
                                                <span>AI 建議</span>
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.tips || ''}
                                            onChange={e => setFormData({ ...formData, tips: e.target.value })}
                                            placeholder="例如：記得帶護照、提前訂位..."
                                        />
                                    </div>

                                    {/* ... existing code ... */}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">座標 (Coordinates)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMapPicker(!showMapPicker)}
                                                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors"
                                                >
                                                    <MapPin size={12} />
                                                    <span>{showMapPicker ? '隱藏地圖' : '地圖選點'}</span>
                                                </button>
                                            </div>

                                            {showMapPicker && (
                                                <div className="mb-3 border rounded-xl overflow-hidden shadow-sm">
                                                    <LocationPicker
                                                        initialLat={formData.coordinates?.lat}
                                                        initialLng={formData.coordinates?.lng}
                                                        onLocationSelect={(lat, lng) => {
                                                            setFormData({
                                                                ...formData,
                                                                coordinates: { lat, lng }
                                                            });
                                                        }}
                                                        className="h-[200px] w-full"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="貼上 Google Maps 連結自動抓取..."
                                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    onChange={e => {
                                                        const coords = parseCoordinatesFromUrl(e.target.value);
                                                        if (coords) {
                                                            setFormData({
                                                                ...formData,
                                                                coordinates: coords
                                                            });
                                                            e.target.value = ''; // Clear input after successful parse
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">緯度 (Lat)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={formData.coordinates?.lat || ''}
                                                onChange={e => {
                                                    const lat = parseFloat(e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        coordinates: {
                                                            lng: formData.coordinates?.lng || 0,
                                                            lat: isNaN(lat) ? 0 : lat
                                                        }
                                                    });
                                                }}
                                                placeholder="e.g. 37.7749"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">經度 (Lng)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={formData.coordinates?.lng || ''}
                                                onChange={e => {
                                                    const lng = parseFloat(e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        coordinates: {
                                                            lat: formData.coordinates?.lat || 0,
                                                            lng: isNaN(lng) ? 0 : lng
                                                        }
                                                    });
                                                }}
                                                placeholder="e.g. -122.4194"
                                            />
                                        </div>
                                    </div>
                                    {(formData.cost || 0) > 0 && (
                                        <div className="col-span-2 flex items-center gap-2 mt-1 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <input
                                                type="checkbox"
                                                id="syncWallet"
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                checked={syncToWallet}
                                                onChange={e => setSyncToWallet(e.target.checked)}
                                            />
                                            <label htmlFor="syncWallet" className="text-sm text-indigo-700 font-medium cursor-pointer select-none flex-1">
                                                同步加入旅行錢包 (Budget)
                                            </label>
                                            {formData.walletItemId && (
                                                <span className="text-xs text-indigo-400 bg-white px-2 py-0.5 rounded border border-indigo-100">
                                                    已連結
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Attachments Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Paperclip size={16} />
                                        附件 (圖片/連結)
                                    </label>

                                    <div className="space-y-2 mb-3">
                                        {formData.attachments?.map(att => (
                                            <div key={att.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {att.type === 'image' ? <ImageIcon size={16} className="text-indigo-500" /> : <LinkIcon size={16} className="text-blue-500" />}
                                                    <a href={att.url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 truncate hover:underline">
                                                        {att.label || 'Attachment'}
                                                    </a>
                                                </div>
                                                <button type="button" onClick={() => removeAttachment(att.id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                                        >
                                            {isUploading ? '上傳中...' : <><ImageIcon size={16} /> 上傳圖片</>}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowLinkInput(!showLinkInput)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                                        >
                                            <LinkIcon size={16} /> 加入連結
                                        </button>
                                    </div>

                                    {showLinkInput && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="連結網址 (https://...)"
                                                className="w-full px-3 py-1.5 border rounded text-sm"
                                                value={newLinkUrl}
                                                onChange={e => setNewLinkUrl(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="顯示名稱 (選填)"
                                                    className="flex-1 px-3 py-1.5 border rounded text-sm"
                                                    value={newLinkLabel}
                                                    onChange={e => setNewLinkLabel(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddLink}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                                                >
                                                    加入
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        儲存行程
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
