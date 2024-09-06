// services/notificationService.js
const NotificationRepository = require('../repositories/notificationRepository');
const GastoService = require('./gastoService');
const { sendMessageToUser } = require('../helpers/telegramResponseHelper');
const cron = require('node-cron');
const moment = require('moment-timezone');

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

  static async scheduleNotification(notification) {
    await notification.intervals.forEach((interval) => {
      const [hour, minute] = interval.split(':');

      // Obtener la hora ajustada a la zona horaria de Buenos Aires
      let nowInBuenosAires = moment().tz('America/Argentina/Buenos_Aires');
      let scheduledTime = nowInBuenosAires.clone().hour(hour).minute(minute);

      let cronTime = `${scheduledTime.minute()} ${scheduledTime.hour()} * * *`; // "0 9 * * *" para las 9:00 AM de Buenos Aires
      console.log(`Programando notificación para ${notification.user} a las ${scheduledTime.format('HH:mm')}`);
      console.log(cronTime);
      console.log({scheduledTime});
      // Programar la tarea cron
      cron.schedule(cronTime, async () => {
        console.log(`Ejecutando notificación para ${notification.user} a las ${scheduledTime.format('HH:mm')}`);
        console.log(cronTime);
        const now = moment().tz('America/Argentina/Buenos_Aires');
        const start = moment(notification.startDate).tz('America/Argentina/Buenos_Aires');
        const end = notification.endDate ? moment(notification.endDate).tz('America/Argentina/Buenos_Aires') : null;

        // Verificar si la notificación está dentro del periodo activo
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
    return notifications.forEach(this.scheduleNotification.bind(this));
  }
}

module.exports = NotificationService;
