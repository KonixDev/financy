// repositories/metaRepository.js
const Meta = require('../models/Meta');

class MetaRepository {
  static async findByUser(userId) {
    return Meta.find({ user: userId });
  }

  static async createMeta(metaData) {
    const meta = new Meta(metaData);
    return meta.save();
  }

  static async findById(id) {
    return Meta.findById(id).populate('user', 'name');
  }

  static async updateMeta(id, updateData) {
    return Meta.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteMeta(id) {
    return Meta.findByIdAndRemove(id);
  }
}

module.exports = MetaRepository;
