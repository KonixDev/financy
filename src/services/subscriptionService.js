const Subscription = require("../models/Suscripcion");

class SubscriptionService {
  static async addSubscription(userId, subscriptionData) {
    const subscription = new Subscription({ ...subscriptionData, user: userId });
    return subscription.save();
  }

  static async getSubscriptionById(subscriptionId) {
    return Subscription.findById(subscriptionId);
  }

  static async getSubscriptions(userId) {
    return Subscription.find({ user: userId }).sort({ nextPaymentDate: 1 });
  }

  static async updateSubscription(subscriptionId, userId, updateData) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new Error("Subscription not found");

    if (subscription.user._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    Object.assign(subscription, updateData);
    return subscription.save();
  }

  static async deleteSubscription(subscriptionId, userId) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new Error("Subscription not found");

    if (subscription.user._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    return subscription.remove();
  }
}

module.exports = SubscriptionService;
