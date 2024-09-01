const User = require('../models/User');

class UserRepository {
  static findByTelegramId(telegramId) {
    return User.findOne({ telegramId });
  }

  static findByEmail(email) {
    return User.findOne({ email });
  }

  static createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  static updateToken(userId, token) {
    return User.findByIdAndUpdate(userId, { token, tokenExpires: Date.now() + 3600000 });
  }
}

module.exports = UserRepository;
