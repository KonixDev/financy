// controllers/metaController.js
const MetaService = require('../services/metaService');

exports.createMeta = async (req, res) => {
  try {
    const metaData = { ...req.body, user: req.user.id };
    const meta = await MetaService.createMeta(metaData);
    res.json(meta);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getMetas = async (req, res) => {
  try {
    const metas = await MetaService.getMetasByUser(req.user.id);
    res.json(metas);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateMeta = async (req, res) => {
  try {
    const meta = await MetaService.updateMeta(req.params.id, req.body, req.user.id);
    res.json(meta);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'No autorizado' || err.message === 'Meta no encontrada') {
      res.status(404).json({ msg: err.message });
    } else {
      res.status(500).send('Error en el servidor');
    }
  }
};

exports.deleteMeta = async (req, res) => {
  try {
    await MetaService.deleteMeta(req.params.id, req.user.id);
    res.json({ msg: 'Meta eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.message === 'No autorizado' || err.message === 'Meta no encontrada') {
      res.status(404).json({ msg: err.message });
    } else {
      res.status(500).send('Error en el servidor');
    }
  }
};
