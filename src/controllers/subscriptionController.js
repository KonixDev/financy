const SubscriptionService = require("../services/subscriptionService");
const { ACTIONS } = require("../constants/actions.js");
const { MESSAGES } = require("../constants/messages.js");
const { getFrequencyOptions } = require("../helpers/telegramResponseHelper");
const AuthService = require("../services/authService.js");

async function handleAddSubscription(bot, chatId, usersInProcess) {
  usersInProcess[chatId] = { action: ACTIONS.ADD_SUBSCRIPTION };
  await bot.sendMessage(chatId, MESSAGES.ENTER_SUBSCRIPTION_NAME);
}

async function processSubscriptionCreation(bot, chatId, text, usersInProcess) {
  const userProcess = usersInProcess[chatId];

  if (!userProcess.name) {
    userProcess.name = text;
    await bot.sendMessage(chatId, MESSAGES.ENTER_AMOUNT);
  } else if (!userProcess.amount) {
    const amount = parseFloat(text);
    if (isNaN(amount)) {
      await bot.sendMessage(chatId, MESSAGES.INVALID_AMOUNT);
    } else {
      userProcess.amount = amount;
      await bot.sendMessage(chatId, MESSAGES.ENTER_FREQUENCY, getFrequencyOptions());
    }
  } else if (!userProcess.frequency) {
    userProcess.frequency = text;
    await bot.sendMessage(chatId, MESSAGES.ENTER_NEXT_PAYMENT_DATE);
  } else if (!userProcess.nextPaymentDate) {
    const date = new Date(text);
    if (isNaN(date)) {
      await bot.sendMessage(chatId, MESSAGES.INVALID_DATE);
    } else {
      userProcess.nextPaymentDate = date;
      const user = await AuthService.findUserByTelegramId(chatId.toString());
      const subscription = await SubscriptionService.addSubscription(user._id, userProcess);
      
      delete usersInProcess[chatId];
      await bot.sendMessage(chatId, MESSAGES.SUBSCRIPTION_ADDED(subscription.name, subscription.amount));
    }
  }
}

async function handleEditSubscription(bot, chatId, subscriptionId) {
  const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
  usersInProcess[chatId] = { action: ACTIONS.EDIT_SUBSCRIPTION, subscriptionId };
  await bot.sendMessage(chatId, MESSAGES.ENTER_NEW_SUBSCRIPTION_AMOUNT(subscription.name));
}

async function getCurrentSubscriptions(bot, chatId, data){
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  const subscriptions = await SubscriptionService.getSubscriptions(user._id.toString());

  let responseText = "";
  subscriptions.forEach((subscription, index) => {
    responseText += `${index + 1}. ${subscription.name} - ${subscription.amount} - ${subscription.frequency} - ${new Date(subscription.nextPaymentDate).toLocaleDateString()}\n`;
  });

  if (subscriptions.length === 0) {
    responseText = MESSAGES.NO_SUBSCRIPTIONS;
  }

  await bot.sendMessage(chatId, responseText);
}

async function processSubscriptionEdit(bot, chatId, text, usersInProcess) {
  const userProcess = usersInProcess[chatId];
  const { subscriptionId } = userProcess;
  
  if (!userProcess.newAmount) {
    const amount = parseFloat(text);
    if (isNaN(amount)) {
      await bot.sendMessage(chatId, MESSAGES.INVALID_AMOUNT);
    } else {
      userProcess.newAmount = amount;
      await bot.sendMessage(chatId, MESSAGES.ENTER_NEW_NEXT_PAYMENT_DATE);
    }
  } else if (!userProcess.newDate) {
    const date = new Date(text);
    if (isNaN(date)) {
      await bot.sendMessage(chatId, MESSAGES.INVALID_DATE);
    } else {
      userProcess.newDate = date;
      const user = await AuthService.findUserByTelegramId(chatId.toString());
      const updatedSubscription = await SubscriptionService.updateSubscription(subscriptionId, user._id, {
        amount: userProcess.newAmount,
        nextPaymentDate: userProcess.newDate,
      });

      delete usersInProcess[chatId];
      await bot.sendMessage(chatId, MESSAGES.SUBSCRIPTION_UPDATED(updatedSubscription.name, updatedSubscription.amount));
    }
  }
}

async function handleDeleteSubscription(bot, chatId, subscriptionId) {
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  await SubscriptionService.deleteSubscription(subscriptionId, user._id);
  await bot.sendMessage(chatId, MESSAGES.SUBSCRIPTION_DELETED);
}

module.exports = {
  handleAddSubscription,
  processSubscriptionCreation,
  handleEditSubscription,
  processSubscriptionEdit,
  handleDeleteSubscription,
  getCurrentSubscriptions
};
