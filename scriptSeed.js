const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Gasto = require("./src/models/Gasto");
const Meta = require("./src/models/Meta");
const Categorie = require("./src/models/Categoria");
const Subscription = require("./src/models/Suscripcion");
require("dotenv").config();

const CATEGORIES = [
  {
    _id: {
      $oid: "66d236b128e3ae89a7cbbbb3",
    },
    name: "Supermercado",
    createdAt: {
      $date: "2024-08-30T21:16:33.425Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d236b728e3ae89a7cbbbb7",
    },
    name: "Carnicería",
    createdAt: {
      $date: "2024-08-30T21:16:39.631Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d236c428e3ae89a7cbbbbd",
    },
    name: "Otros",
    createdAt: {
      $date: "2024-08-30T21:16:52.299Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d236e228e3ae89a7cbbbc1",
    },
    name: "Entretenimiento",
    createdAt: {
      $date: "2024-08-30T21:17:22.258Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d236f028e3ae89a7cbbbc5",
    },
    name: "Delivery",
    createdAt: {
      $date: "2024-08-30T21:17:36.838Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d236fe28e3ae89a7cbbbc9",
    },
    name: "Boludeces",
    createdAt: {
      $date: "2024-08-30T21:17:50.790Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d2373528e3ae89a7cbbbcd",
    },
    name: "Restaurantes",
    createdAt: {
      $date: "2024-08-30T21:18:45.440Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d2376428e3ae89a7cbbbd1",
    },
    name: "Ropa & Indumentaria",
    createdAt: {
      $date: "2024-08-30T21:19:32.038Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d2377f28e3ae89a7cbbbd5",
    },
    name: "Transporte",
    createdAt: {
      $date: "2024-08-30T21:19:59.126Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d237d528e3ae89a7cbbbd9",
    },
    name: "Helados",
    createdAt: {
      $date: "2024-08-30T21:21:25.120Z",
    },
    __v: 0,
  },
  {
    _id: {
      $oid: "66d2380f28e3ae89a7cbbbdd",
    },
    name: "Conectividad a internet",
    createdAt: {
      $date: "2024-08-30T21:22:23.714Z",
    },
    __v: 0,
  },
];

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI_TEST_ENV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión:"));
db.once("open", async () => {
  console.log("Conectado a MongoDB");

  // Limpiar las colecciones
  await User.deleteMany({});
  await Gasto.deleteMany({});
  await Meta.deleteMany({});
  await Subscription.deleteMany({});
  await Categorie.deleteMany({});

  const users = await User.insertMany([
    {
      name: "Martin coll",
      email: "contacto@martincoll.dev",
      password: "$2a$10$Fd.8eXgq//U5VNA5tPkGZepvsA2jKE3TSadxZGgIquTWS3ILQKsVa",
      telegramId: "6581079342",
    },
  ]);

  console.log("Usuarios creados:", users);

  // Crear gastos de ejemplo
  const gastos = getRandomGastos(150, users[0]);
  await Gasto.insertMany(gastos);

  console.log("Gastos creados:", gastos);

  // Crear metas de ejemplo
  const metas = await Meta.insertMany([
    {
      user: users[0]._id,
      name: "Ahorro para vacaciones",
      targetAmount: 1000,
      currentAmount: 200,
      category: "Ahorro",
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
    {
      user: users[0]._id,
      name: "Ahorro para nuevo coche",
      targetAmount: 5000,
      currentAmount: 1500,
      category: "Ahorro",
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    },
  ]);

  console.log("Metas creadas:", metas);

  // Crear suscripciones de ejemplo
  const subscriptions = await Subscription.insertMany([
    {
      user: users[0]._id,
      name: "Netflix",
      amount: 15,
      frequency: "mensual",
      nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    {
      user: users[0]._id,
      name: "Spotify",
      amount: 10,
      frequency: "mensual",
      nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  ]);

  console.log("Suscripciones creadas:", subscriptions);

  // Crear categorías de ejemplo
  const categories = CATEGORIES.map((category) => ({ ...category, createdAt: new Date(), _id: new mongoose.Types.ObjectId(category._id.$oid) }));
  await Categorie.insertMany(categories);


  console.log("Seed de datos completado.");
  mongoose.connection.close();
});

function getRandomGastos(amount, user) {
    const gastos = [];
    for (let i = 0; i < amount; i++) {
        const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        gastos.push({
            user: user._id,
            amount: Math.floor(Math.random() * 1000),
            description: "Gasto de ejemplo",
            category: new mongoose.Types.ObjectId(randomCategory._id.$oid),
            date: new Date(new Date().setDate(new Date().getDate() - i)),
        });
    }
    return gastos;
}