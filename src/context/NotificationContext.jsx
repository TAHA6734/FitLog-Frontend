import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notificationApi';
import { playAchievementSound } from '../utils/achievementSound';

const NotificationContext = createContext(null);

const TYPE_LABELS = {
like: '❤️ Beğeni',
comment: '💬 Yorum',
follow: '👤 Takip',
mention: '📢 Etiketleme',
message: '✉️ Mesaj',
achievement: '🏆 Başarım',
};


export function NotificationProvider({ children }) {
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const connectionRef = useRef(null);
const seenNotificationIds = useRef(new Set());
const { user } = useAuth();

// Geçmiş bildirimleri ve okunmamış sayısını çek

// Geçmiş bildirimleri ve okunmamış sayısını çek
const loadNotifications = useCallback(async () => {
try {
const [listRes, countRes] = await Promise.all([
notificationApi.getAll(),
notificationApi.getUnreadCount(),
]);
setNotifications(listRes.data);
setUnreadCount(countRes.data.count);
} catch {
// sessizce geç
}
}, []);


useEffect(() => {
if (!user) return;

loadNotifications();

const token = localStorage.getItem('accessToken');
if (!token) return;

const connection = new signalR.HubConnectionBuilder()
.withUrl('https://localhost:7203/hubs/notifications', {
accessTokenFactory: () => localStorage.getItem('accessToken'),
})
.withAutomaticReconnect()
.build();

connection.on('ReceiveNotification', (data) => {
setNotifications((prev) => {
const existingIndex = prev.findIndex((n) => n.id === data.id);
if (existingIndex !== -1) {
const updated = [...prev];
const [item] = updated.splice(existingIndex, 1);
return [{ ...item, ...data, isRead: false }, ...updated];
}
return [{ ...data, isRead: false }, ...prev];
});


if (!seenNotificationIds.current.has(data.id)) {
seenNotificationIds.current.add(data.id);
setUnreadCount((prev) => prev + 1);
}

if (data.type === 'achievement') {
playAchievementSound();
toast.success(data.message, {
description: TYPE_LABELS[data.type] || 'Bildirim',
duration: 6000,
style: {
background: 'linear-gradient(135deg, #fbbf24, #dc2626)',
color: '#0f172a',
fontWeight: 600,
border: '1px solid #fcd34d',
},
});
} else {
toast(data.message, {
description: TYPE_LABELS[data.type] || 'Bildirim',
});
}
});


connection.start().catch(() => {});
connectionRef.current = connection;

return () => {
connection.stop();
};
}, [user?.userId]);

const markAllAsRead = async () => {
if (unreadCount === 0) return;

setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
setUnreadCount(0);

try {
await notificationApi.markAllAsRead();
} catch {
// sessizce geç
}
};

return (
<NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, refreshNotifications: loadNotifications }}>
{children}
</NotificationContext.Provider>
);
}

export function useNotifications() {
return useContext(NotificationContext);
}



