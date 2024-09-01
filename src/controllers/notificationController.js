const NotificationService = require('../services/notificationService');
const { MESSAGES } = require('../constants/messages');
const AuthService = require('../services/authService');

async function handleSetNotification(bot, chatId, type, message, intervals, frequency, startDate, endDate) {
  const chat = chatId.toString();
  const userId = await AuthService.findUserByTelegramId(chat);
  await NotificationService.createNotification(userId._id.toString(), type, message, intervals, frequency, startDate, endDate);
  await bot.sendMessage(chatId, MESSAGES.NOTIFICATION_SET);
}

async function handleGetNotifications(bot, chatId) {
  const chat = chatId.toString();
  const userId = await AuthService.findUserByTelegramId(chat);
  const notifications = await NotificationService.getNotificationsByUser(userId._id.toString());
  let notificationText = MESSAGES.YOUR_NOTIFICATIONS;
  notifications.forEach((notification, index) => {
    notificationText += `\n${index + 1}. ${notification._id}\n ${notification.message} - Horarios: ${notification.intervals.join(', ')}.\nTipo: ${notification.type}. \nFrecuencia: ${notification.frequency}`;
  });
  await bot.sendMessage(chatId, notificationText);
}

async function handleDeleteNotification(bot, chatId, notificationId) {
  await NotificationService.deleteNotification(notificationId);
  await bot.sendMessage(chatId, MESSAGES.NOTIFICATION_DELETED);
}

module.exports = {
  handleSetNotification,
  handleGetNotifications,
  handleDeleteNotification,
};
