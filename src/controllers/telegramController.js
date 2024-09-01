const AuthService = require("../services/authService");
const GastoService = require("../services/gastoService");
const CategoryService = require("../services/categoryService");
const { checkIfRegistered } = require("../middlewares/botAuth.js");
const {
  getMainMenuOptions,
  backToMainMenu,
  getCategoryOptions,
  selectGasto,
} = require("../helpers/telegramResponseHelper");
const { MESSAGES } = require("../constants/messages.js");
const {
  formatCurrency,
  CURRENCYS_OPTIONS,
} = require("../utils/currencyUtil.js");
const { ACTIONS } = require("../constants/actions.js");
const NotificationService = require("../services/notificationService");
const {
  handleSetNotification,
  handleGetNotifications,
  handleDeleteNotification,
} = require("./notificationController.js");
const SubscriptionController = require("./subscriptionController.js");
NotificationService.scheduleAllNotifications();

let usersInRegistration = {};
let usersInProcess = {};

const QUERYS_FUNCTIONS = {
  REGISTER: async (bot, chatId, data) => handleRegister(bot, chatId),
  LOGIN: async (bot, chatId, data) => handleLogin(bot, chatId),
  MENU: async (bot, chatId, data) => handleMenu(bot, chatId),
  SUMMARY: async (bot, chatId, data) => handleSummary(bot, chatId),
  GASTOS: async (bot, chatId, data) => handleGastos(bot, chatId),
  ADD_GASTO: async (bot, chatId, data) => handleAddGasto(bot, chatId),
  ADD_CATEGORIA: async (bot, chatId, data) => handleAddCategoria(bot, chatId),
  RECURRENT: async (bot, chatId, data) => handleRecurring(bot, chatId, true),
  NO_RECURRENT: async (bot, chatId, data) =>
    handleRecurring(bot, chatId, false),
  CATEGORY: async (bot, chatId, data) =>
    handleCategorySelection(bot, chatId, data),
  GASTO: async (bot, chatId, data) => handleGastoSelection(bot, chatId, data),
  EDIT_GASTO: async (bot, chatId, data) =>
    handleGastoSelection(bot, chatId, data),
  UPDATE_GASTO: async (bot, chatId, data) =>
    handleUpdateGasto(bot, chatId, data),
  DELETE_GASTO: async (bot, chatId, data) =>
    handleDeleteGasto(bot, chatId, data),
  ADD_SUBSCRIPTION: async (bot, chatId, data) =>
    SubscriptionController.handleAddSubscription(bot, chatId, usersInProcess),
  EDIT_SUBSCRIPTION: async (bot, chatId, data) =>
    SubscriptionController.handleEditSubscription(
      bot,
      chatId,
      data.split("-")[1]
    ),
  DELETE_SUBSCRIPTION: async (bot, chatId, data) =>
    SubscriptionController.handleDeleteSubscription(
      bot,
      chatId,
      data.split("-")[1]
    ),
  SUBSCRIPTIONS: async (bot, chatId, data) =>
    SubscriptionController.getCurrentSubscriptions(bot, chatId, data),
};

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const options = getMainMenuOptions();
  await bot.sendMessage(chatId, MESSAGES.WELCOME, options);
}

async function handleBack(bot, msg) {
  const options = backToMainMenu();
  await bot.sendMessage(msg.chat.id, MESSAGES.BACK_TO_MENU, options);
}

async function handleCallbackQuery(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    const querySplitted = data.split("-")[0];
    if (QUERYS_FUNCTIONS[querySplitted]) {
      await QUERYS_FUNCTIONS[querySplitted](bot, chatId, data);
      if (querySplitted !== "MENU") {
        await handleBack(bot, query.message);
      }
      return;
    }
    await bot.sendMessage(chatId, MESSAGES.INVALID_QUERY);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, MESSAGES.ERROR);
  }
}

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = await AuthService.findUserByTelegramId(chatId.toString());

  if (!user) {
    await bot.sendMessage(chatId, MESSAGES.NOT_REGISTERED);
    return;
  }

  if (text.startsWith("/setnotification")) {
    const [type, message, intervals, frequency, startDate, endDate] = text
      .replace("/setnotification ", "")
      .split("|");
    await handleSetNotification(
      bot,
      chatId,
      type,
      message,
      intervals.split(","),
      frequency,
      startDate,
      endDate
    );
  } else if (text.startsWith("/getnotifications")) {
    await handleGetNotifications(bot, chatId);
  } else if (text.startsWith("/deletenotification")) {
    const notificationId = text.replace("/deletenotification ", "");
    await handleDeleteNotification(bot, chatId, notificationId);
  }

  if (usersInRegistration[chatId]) {
    await AuthService.processRegistration(
      bot,
      chatId,
      text,
      usersInRegistration
    );
  } else if (usersInProcess[chatId]) {
    const userAction = usersInProcess[chatId].action;
    if (userAction === ACTIONS.ADD_GASTO) {
      await GastoService.processGastoCreation(
        bot,
        chatId,
        text,
        usersInProcess
      );
    } else if (userAction === ACTIONS.ADD_CATEGORIA) {
      await CategoryService.processCategoryCreation(
        bot,
        chatId,
        text,
        usersInProcess
      );
    } else if (userAction === ACTIONS.EDIT_GASTO) {
      await GastoService.processGastoEdit(
        bot,
        chatId,
        text,
        usersInProcess,
        user
      );
    } else if (userAction === ACTIONS.ADD_SUBSCRIPTION) {
      await SubscriptionController.processSubscriptionCreation(
        bot,
        chatId,
        text,
        usersInProcess
      );
    } else if (userAction === ACTIONS.EDIT_SUBSCRIPTION) {
      await SubscriptionController.processSubscriptionEdit(
        bot,
        chatId,
        text,
        usersInProcess
      );
    }
  }
}

async function handleRegister(bot, chatId) {
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  if (user) {
    await bot.sendMessage(chatId, MESSAGES.ALREADY_REGISTERED);
  } else {
    usersInRegistration[chatId] = {};
    await bot.sendMessage(chatId, MESSAGES.ENTER_NAME);
  }
}

async function handleLogin(bot, chatId) {
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  if (!user) {
    await bot.sendMessage(chatId, MESSAGES.NOT_REGISTERED);
  } else {
    const token = await AuthService.generateToken(user._id);
    await AuthService.updateUserToken(user._id, token);
    await bot.sendMessage(chatId, MESSAGES.LOGIN_SUCCESS(user.name));
  }
}

async function handleMenu(bot, chatId) {
  if (await checkIfRegistered(chatId, bot)) {
    const options = getMainMenuOptions();
    await bot.sendMessage(chatId, MESSAGES.MENU_PROMPT, options);
  }
}

async function handleSummary(bot, chatId) {
  if (await checkIfRegistered(chatId, bot)) {
    const userId = await AuthService.findUserByTelegramId(chatId.toString());
    const summaryData = await GastoService.getSummary(userId);
    await bot.sendMessage(chatId, summaryData.text);
    await bot.sendPhoto(chatId, summaryData.charts.gastoMensualChart, {
      caption: "Gastos por Mes",
    });
    await bot.sendPhoto(chatId, summaryData.charts.gastoCategoriaChart, {
      caption: "Gastos por Categoría",
    });
    await bot.sendPhoto(chatId, summaryData.charts.metaProgresoChart, {
      caption: "Progreso de Metas",
    });
    await bot.sendPhoto(chatId, summaryData.charts.gastoDiarioChart, {
      caption: "Consumo Diario (Últimos 30 días)",
    });
  }
}

async function handleGastos(bot, chatId) {
  if (await checkIfRegistered(chatId, bot)) {
    const user = await AuthService.findUserByTelegramId(chatId.toString());
    const { gastos, resumeText } = await GastoService.getGastos(user._id);
    await bot.sendMessage(chatId, resumeText);
    await bot.sendMessage(chatId, MESSAGES.SELECT_GASTO, selectGasto(gastos));
  }
}

async function handleAddGasto(bot, chatId) {
  if (await checkIfRegistered(chatId, bot)) {
    usersInProcess[chatId] = { action: ACTIONS.ADD_GASTO };
    await bot.sendMessage(chatId, MESSAGES.ENTER_AMOUNT);
  }
}

async function handleAddCategoria(bot, chatId) {
  if (await checkIfRegistered(chatId, bot)) {
    usersInProcess[chatId] = { action: ACTIONS.ADD_CATEGORIA };
    await bot.sendMessage(chatId, MESSAGES.ENTER_CATEGORY_NAME);
  }
}

async function handleRecurring(bot, chatId, isRecurring) {
  if (usersInProcess[chatId]) {
    usersInProcess[chatId].isRecurring = isRecurring;
    await selectCategory(bot, chatId);
  } else {
    await bot.sendMessage(chatId, MESSAGES.NOT_IN_PROCESS);
  }
}

async function handleCategorySelection(bot, chatId, category) {
  const gastoData = usersInProcess[chatId];
  gastoData.category = category.split("-")[1];
  const categoryName = category.split("-")[2];
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  const { gasto, totalGastado, spentLastMonthChart } =
    await GastoService.createGasto(user._id, gastoData);

  delete usersInProcess[chatId]; // Limpiar el proceso

  await bot.sendMessage(
    chatId,
    MESSAGES.GASTO_REGISTERED(
      formatCurrency(gasto.amount, CURRENCYS_OPTIONS.PESO_ARGENTINO),
      categoryName,
      formatCurrency(totalGastado[0].total, CURRENCYS_OPTIONS.PESO_ARGENTINO)
    )
  );

  if (spentLastMonthChart) {
    await bot.sendPhoto(chatId, spentLastMonthChart, {
      caption: "Evaluación de gasto en la categoría",
    });
  } else {
    await bot.sendMessage(
      chatId,
      "No hay suficientes datos para evaluar la categoría."
    );
  }
}

async function handleGastoSelection(bot, chatId, gastoData) {
  // Parse the gastoId from the data
  const gastoId = gastoData.split("-")[1];
  usersInProcess[chatId] = { action: ACTIONS.EDIT_GASTO, gastoId };
  await bot.sendMessage(chatId, MESSAGES.ENTER_NEW_AMOUNT);
}

async function handleUpdateGasto(bot, chatId, data) {
  const { gastoId, newAmount, newDateText } = usersInProcess[chatId];

  const newDate = new Date(newDateText);
  if (isNaN(newDate)) {
    await bot.sendMessage(chatId, MESSAGES.INVALID_DATE);
    return;
  }

  const user = await AuthService.findUserByTelegramId(chatId.toString());
  const updatedGasto = await GastoService.editGasto(
    gastoId,
    {
      amount: newAmount,
      date: newDate,
    },
    user._id
  );

  delete usersInProcess[chatId]; // Clean up process

  await bot.sendMessage(
    chatId,
    MESSAGES.GASTO_UPDATED(
      formatCurrency(updatedGasto.amount, CURRENCYS_OPTIONS.PESO_ARGENTINO),
      updatedGasto.category.name,
      updatedGasto.date.toLocaleDateString()
    )
  );
}

async function handleDeleteGasto(bot, chatId, data) {
  const gastoId = data.split("-")[1];
  const gastoAmount = data.split("-")[2];
  const user = await AuthService.findUserByTelegramId(chatId.toString());
  await GastoService.deleteGasto(gastoId, user._id);
  await bot.sendMessage(chatId, MESSAGES.GASTO_DELETED(gastoAmount));
}

async function selectCategory(bot, chatId) {
  const categories = await CategoryService.getAllCategories();
  const options = getCategoryOptions(categories);
  await bot.sendMessage(chatId, MESSAGES.SELECT_CATEGORY, options);
}

module.exports = {
  handleStart,
  handleCallbackQuery,
  handleMessage,
  handleAddCategoria,
  handleAddGasto,
  handleCategorySelection,
  handleGastos,
  handleLogin,
  handleMenu,
  handleRegister,
  handleRecurring,
  handleSummary,
};
