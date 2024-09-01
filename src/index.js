require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const apiRoutes = require('./routes/api');
require('./bot/telegramBot.js'); // Importa el bot

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', apiRoutes);

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

// Rutas base
app.get('/', (req, res) => {
  res.send('API de Finanzas Personales v1.0');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
