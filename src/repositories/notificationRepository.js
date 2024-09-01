// repositories/notificationRepository.js
const Notification = require("../models/Notification");

class NotificationRepository {
  static createNotification(notificationData) {
    const notification = new Notification(notificationData);
    return notification.save();
  }

  static findByUser(userId) {
    return Notification.find({ user: userId, active: true });
  }

  static updateNotification(id, updateData) {
    return Notification.findByIdAndUpdate(id, updateData, { new: true });
  }

  static deleteNotification(id) {
    return Notification.findByIdAndRemove(id);
  }

  static findActiveNotifications() {
    const now = new Date();
    return Notification.find({
      active: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    });
  }
}

module.exports = NotificationRepository;
