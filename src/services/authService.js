const UserRepository = require('../repositories/userRepository');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../constants/config');

class AuthService {
  static async findUserByTelegramId(telegramId) {
    return UserRepository.findByTelegramId(telegramId);
  }

  static async generateToken(userId) {
    return JWT.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
  }

  static async updateUserToken(userId, token) {
    return UserRepository.updateToken(userId, token);
  }

  static async processRegistration(bot, chatId, text, usersInRegistration) {
    let userRegistration = usersInRegistration[chatId];

    if (!userRegistration.name) {
      userRegistration.name = text;
      await bot.sendMessage(chatId, MESSAGES.ENTER_EMAIL);
    } else if (!userRegistration.email) {
      userRegistration.email = text;
      const existingUser = await UserRepository.findByEmail(text);
      if (existingUser) {
        await bot.sendMessage(chatId, MESSAGES.EMAIL_EXISTS);
        delete usersInRegistration[chatId];
      } else {
        await bot.sendMessage(chatId, MESSAGES.ENTER_PASSWORD);
      }
    } else if (!userRegistration.password) {
      userRegistration.password = await bcrypt.hash(text, 10);
      await UserRepository.createUser({
        name: userRegistration.name,
        email: userRegistration.email,
        password: userRegistration.password,
        telegramId: chatId.toString(),
      });
      await bot.sendMessage(chatId, MESSAGES.REGISTRATION_COMPLETE);
      delete usersInRegistration[chatId];
    }
  }
}

module.exports = AuthService;
