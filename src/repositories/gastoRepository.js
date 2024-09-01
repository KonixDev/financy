// repositories/gastoRepository.js
const { default: mongoose } = require("mongoose");
const Gasto = require("../models/Gasto");

class GastoRepository {
  static async findByUser(userId) {
    return Gasto.find({ user: userId }).populate("category user", "name");
  }

  static findByUserAndCategoryWithinDateRange(userId, categoriaId, startDate, endDate) {
    return Gasto.find({
      user: userId,
      category: categoriaId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 }); 
  }

  static async createGasto(gastoData) {
    const gasto = new Gasto(gastoData);
    return gasto.save();
  }

  static async findById(id) {
    return Gasto.findById(id).populate("category user", "name");
  }

  static async updateGasto(id, updateData) {
    return Gasto.findByIdAndUpdate(id, updateData, { new: true }).populate(
      "category user",
      "name"
    )
  }

  static async deleteGasto(id) {
    return Gasto.findByIdAndDelete(id);
  }

  static async exportGastosByUser(userId) {
    return Gasto.find({ user: userId });
  }

  static findByUser(userId) {
    return Gasto.find({ user: userId }).populate("category user", "name");
  }
  static calculateTotalSpent(userId) {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    return Gasto.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
  }

  static getLastGastos(userId) {
    return Gasto.find({ user: userId })
      .sort({ date: -1 })
      .limit(10)
      .populate("category user", "name");
  }
}

module.exports = GastoRepository;
