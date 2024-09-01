// src/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  telegramId: {
    type: String, // ID del chat de Telegram
  },
  telegramToken: {
    type: String, // Token único para autenticar solicitudes desde el bot
  },
  token: {
    type: String, // Almacenamiento seguro del token JWT
  },
  tokenExpires: {
    type: Date, // Fecha de expiración del token
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
