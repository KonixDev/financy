const TelegramBot = require("node-telegram-bot-api");
const { handleStart, handleCallbackQuery, handleMessage } = require('../controllers/telegramController.js');
const { TELEGRAM_TOKEN } = require('../constants/config');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.on('callback_query', (query) => handleCallbackQuery(bot, query));
bot.on('message', (msg) => handleMessage(bot, msg));

async function sendMessageToUser(chatId, message) {
    await bot.sendMessage(chatId, message);
}

module.exports = {
    bot,
    sendMessageToUser
};
