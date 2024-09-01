// services/notificationService.js
const NotificationRepository = require('../repositories/notificationRepository');
const GastoService = require('./gastoService');
const { sendMessageToUser } = require('../helpers/telegramResponseHelper');
const cron = require('node-cron');
const moment = require('moment');

class NotificationService {
  static async createNotification(userId, type, message, intervals, frequency, startDate, endDate) {
    const notification = await NotificationRepository.createNotification({
      user: userId,
      type,
      message,
      intervals,
      frequency,
      startDate,
      endDate,
      active: true,
    });

    this.scheduleNotification(notification);
    return notification;
  }

  static async updateNotification(notificationId, updateData) {
    const notification = await NotificationRepository.updateNotification(notificationId, updateData);
    if (notification) {
      this.scheduleNotification(notification); // Reprogramar si se ha actualizado
    }
    return notification;
  }

  static async deleteNotification(notificationId) {
    return NotificationRepository.deleteNotification(notificationId);
  }

  static async getNotificationsByUser(userId) {
    return NotificationRepository.findByUser(userId);
  }

  static scheduleNotification(notification) {
    notification.intervals.forEach((interval) => {
      const [hour, minute] = interval.split(':');
      const cronTime = `${minute} ${hour} * * *`; // Ejemplo: "0 9 * * *" para las 9:00 AM todos los días

      cron.schedule(cronTime, async () => {
        const now = moment();
        const start = moment(notification.startDate);
        const end = notification.endDate ? moment(notification.endDate) : null;

        // Verificar si la notificación está dentro de su periodo activo
        if (now.isAfter(start) && (!end || now.isBefore(end))) {
          await this.sendNotification(notification);
        }
      });
    });
  }

  static async sendNotification(notification) {
    const { user, type, message } = notification;

    if (type === 'text' || type === 'both') {
      await sendMessageToUser(user.toString(), message);
    }

    if (type === 'summary' || type === 'both') {
      const summary = await GastoService.getSummary(user.toString());
      await sendMessageToUser(user.toString(), `${message}\n\n${summary.text}`);
    }
  }

  static async scheduleAllNotifications() {
    const notifications = await NotificationRepository.findActiveNotifications();
    notifications.forEach(this.scheduleNotification.bind(this));
  }
}

module.exports = NotificationService;
