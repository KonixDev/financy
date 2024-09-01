// repositories/CategoryRepository.js
const { default: mongoose } = require('mongoose');
const Category = require('../models/Categoria');

class CategoryRepository {
  static async createCategory(CategoryData) {
    const Category = new Category(CategoryData);
    return Category.save();
  }

  static async findById(id) {
    return Category.findById(id);
  }

  static async updateCategory(id, updateData) {
    return Category.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteCategory(id) {
    return Category.findByIdAndRemove(id);
  }

  static async getAllCategories() {
    return Category.find({});
  }
}

module.exports = CategoryRepository;
