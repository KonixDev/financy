const { MESSAGES } = require('../constants/messages.js');
const CategoryRepository = require('../repositories/categoryRepository.js');

class CategoryService {
  static async processCategoryCreation(bot, chatId, text, usersInProcess) {
    const name = text.trim();
    if (!name) {
      await bot.sendMessage(chatId, MESSAGES.EMPTY_CATEGORY_NAME);
    } else {
      await CategoryRepository.createCategory({ name });
      await bot.sendMessage(chatId, MESSAGES.CATEGORY_CREATED(name));
      delete usersInProcess[chatId];
    }
  }
  static async getAllCategories() {
    return CategoryRepository.getAllCategories();
  }
}

module.exports = CategoryService;
