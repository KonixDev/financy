const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const gastoController = require('../controllers/gastoController');
const suscripcionController = require('../controllers/suscripcionController');
const metaController = require('../controllers/metaController');
const summaryController = require('../controllers/summaryController');
const categoriaController = require('../controllers/categoriaController');

const { verifyTokenExpiration } = require('../middlewares/botAuth');

router.post('/gastos', auth, gastoController.createGasto);
router.get('/gastos/summary', auth, gastoController.getGastos);
router.get('/gastos/export/csv', auth, gastoController.exportGastosCSV);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', auth, authController.getUser);

router.get('/gastos', auth, gastoController.getGastos);
router.put('/gastos/:id', auth, gastoController.updateGasto);
router.delete('/gastos/:id', auth, gastoController.deleteGasto);

router.post('/suscripciones', auth, suscripcionController.createSuscripcion);

router.post('/metas', auth, metaController.createMeta);
router.get('/metas', auth, metaController.getMetas);
router.put('/metas/:id', auth, metaController.updateMeta);
router.delete('/metas/:id', auth, metaController.deleteMeta);

router.get('/summary', auth, summaryController.getSummary);

router.get("/profile", auth, verifyTokenExpiration, authController.getUser);

router.post('/categorias', categoriaController.createCategoria); 
router.get('/categorias', categoriaController.getCategorias); 
router.put('/categorias/:id', categoriaController.updateCategoria);
router.delete('/categorias/:id', categoriaController.deleteCategoria); 

module.exports = router;
