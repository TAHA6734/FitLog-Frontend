import axiosClient from './axiosClient';

export const messageApi = {
getConversations: () => axiosClient.get('/Message/conversations'),
getRequest:()=>axiosClient.get('/Message/requests'),
pin:(conversationId) => axiosClient.post(`/Message/${conversationId}/pin`),
unpin:(conversationId) => axiosClient.delete(`/Message/${conversationId}/pin`),
acceptRequest:(conversationId) => axiosClient.post(`/Message/${conversationId}/accept-request`),
getMessages: (conversationId, page = 1, pageSize = 30) =>
axiosClient.get(`/Message/${conversationId}?page=${page}&pageSize=${pageSize}`),
markAsRead: (conversationId) => axiosClient.post(`/Message/${conversationId}/mark-read`),
react: (messageId, emoji) => axiosClient.post(`/Message/${messageId}/react`, JSON.stringify(emoji), {
headers: { 'Content-Type': 'application/json' },
}),
removeReaction: (messageId) => axiosClient.delete(`/Message/${messageId}/react`),
deleteMessage: (messageId, forEveryone) =>
axiosClient.delete(`/Message/${messageId}?forEveryone=${forEveryone}`),
sendVoice: (receiverId, audioBlob, replyToMessageId) => {
const formData = new FormData();
formData.append('Voice', audioBlob, 'voice-message.webm');
if (replyToMessageId) formData.append('ReplyToMessageId', replyToMessageId);
return axiosClient.post(`/Message/send-voice/${receiverId}`, formData, {
headers: { 'Content-Type': 'multipart/form-data' },
});
},

};




