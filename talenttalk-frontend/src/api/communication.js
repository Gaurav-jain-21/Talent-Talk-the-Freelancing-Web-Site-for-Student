import api from './axios'

export const sendEmail = (data) => api.post('/email/send', data)
export const sendMessage = (data) => api.post('/message/send', data)
export const getConversation = (userId1, userId2) =>
  api.get(`/message/conversation/${userId1}/${userId2}`)
export const getUnreadMessages = (receiverId) =>
  api.get(`/message/unread/${receiverId}`)
export const markAsRead = (messageId) =>
  api.patch(`/message/${messageId}/read`)