// src/controllers/categoriaController.js
const Categoria = require('../models/Categoria');

exports.createCategoria = async (req, res) => {
  try {
    const { name, description } = req.body;

    let categoria = await Categoria.findOne({ name });
    if (categoria) {
      return res.status(400).json({ msg: 'La categoría ya existe' });
    }

    categoria = new Categoria({ name, description });
    await categoria.save();
    res.json(categoria);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const { name, description } = req.body;

    let categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    categoria.name = name || categoria.name;
    categoria.description = description || categoria.description;
    await categoria.save();
    res.json(categoria);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    let categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    await categoria.remove();
    res.json({ msg: 'Categoría eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};
