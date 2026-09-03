import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { messageApi } from '../api/messageApi';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
const [onlineUsers, setOnlineUsers] = useState(new Set());
const [typingUsers, setTypingUsers] = useState(new Set());
const [messageListeners] = useState(new Set());
const [totalUnread, setTotalUnread] = useState(0);
const connectionRef = useRef(null);
const { user } = useAuth();

const refreshUnreadCount = useCallback(async () => {
try {
const res = await messageApi.getConversations();
const total = res.data.filter((c) => (c.unreadCount || 0) > 0).length;
setTotalUnread(total);
} catch {
// sessizce geç
}
}, []);

useEffect(() => {
if (user) refreshUnreadCount();
}, [user, refreshUnreadCount]);

useEffect(() => {
if (!user) return;

const token = localStorage.getItem('accessToken');
if (!token) return;

const connection = new signalR.HubConnectionBuilder()
.withUrl('http://localhost:5292/hubs/chat', {
accessTokenFactory: () => localStorage.getItem('accessToken'),
})
.withAutomaticReconnect()
.build();

connection.on('ReceiveMessage', (message) => {
messageListeners.forEach((listener) => listener(message));
refreshUnreadCount();
});

connection.on('UserOnline', (userId) => {
setOnlineUsers((prev) => new Set(prev).add(userId));
});

connection.on('UserOffline', (userId) => {
setOnlineUsers((prev) => {
const next = new Set(prev);
next.delete(userId);
return next;
});
});

connection.on('OnlineUsersList', (userIds) => {
setOnlineUsers(new Set(userIds));
});

connection.on('UserTyping', (userId) => {
setTypingUsers((prev) => new Set(prev).add(userId));
});

connection.on('UserStoppedTyping', (userId) => {
setTypingUsers((prev) => {
const next = new Set(prev);
next.delete(userId);
return next;
});
});

connection.start().catch(() => {});
connectionRef.current = connection;

return () => {
connection.stop();
};
}, [user?.userId, refreshUnreadCount]);

const sendMessage = useCallback(async (receiverId, content, replyToMessageId = null) => {
if (connectionRef.current?.state === 'Connected') {
await connectionRef.current.invoke('SendMessage', receiverId, content, replyToMessageId);
}
}, []);

const notifyTyping = useCallback((receiverId) => {
if (connectionRef.current?.state === 'Connected') {
connectionRef.current.invoke('Typing', receiverId);
}
}, []);

const notifyStopTyping = useCallback((receiverId) => {
if (connectionRef.current?.state === 'Connected') {
connectionRef.current.invoke('StopTyping', receiverId);
}
}, []);

const subscribeToMessages = useCallback((listener) => {
messageListeners.add(listener);
return () => messageListeners.delete(listener);
}, [messageListeners]);

const isUserOnline = useCallback((userId) => onlineUsers.has(userId), [onlineUsers]);
const isUserTyping = useCallback((userId) => typingUsers.has(userId), [typingUsers]);

return (
<ChatContext.Provider
value={{
sendMessage,
notifyTyping,
notifyStopTyping,
subscribeToMessages,
isUserOnline,
isUserTyping,
totalUnread,
refreshUnreadCount,
}}
>
{children}
</ChatContext.Provider>
);
}

export function useChat() {
return useContext(ChatContext);
}

