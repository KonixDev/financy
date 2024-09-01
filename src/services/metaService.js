// services/metaService.js
const MetaRepository = require('../repositories/metaRepository');

class MetaService {
  static async getMetasByUser(userId) {
    return MetaRepository.findByUser(userId);
  }

  static async createMeta(metaData) {
    return MetaRepository.createMeta(metaData);
  }

  static async getMetaById(metaId) {
    const meta = await MetaRepository.findById(metaId);
    if (!meta) {
      throw new Error('Meta no encontrada');
    }
    return meta;
  }

  static async updateMeta(metaId, metaData, userId) {
    const meta = await MetaRepository.findById(metaId);
    if (!meta) {
      throw new Error('Meta no encontrada');
    }

    // Verificar si el usuario es el propietario de la meta
    if (meta.user.toString() !== userId) {
      throw new Error('No autorizado');
    }

    return MetaRepository.updateMeta(metaId, metaData);
  }

  static async deleteMeta(metaId, userId) {
    const meta = await MetaRepository.findById(metaId);
    if (!meta) {
      throw new Error('Meta no encontrada');
    }

    // Verificar si el usuario es el propietario de la meta
    if (meta.user.toString() !== userId) {
      throw new Error('No autorizado');
    }

    return MetaRepository.deleteMeta(metaId);
  }
}

module.exports = MetaService;
