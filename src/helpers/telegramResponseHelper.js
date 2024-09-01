const { formatCurrency, CURRENCYS_OPTIONS } = require("../utils/currencyUtil");

exports.getMainMenuOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "Agregar Gasto", callback_data: "ADD_GASTO" }],
      [{ text: "Agregar Categoría", callback_data: "ADD_CATEGORIA" }],
      [{ text: "Ver Resumen", callback_data: "SUMMARY" }],
      [{ text: "Ver Últimos 10 Gastos", callback_data: "GASTOS" }],
      [{ text: "Agregar Subscripción", callback_data: "ADD_SUBSCRIPTION" }],
      [{ text: "Ver Suscripciones", callback_data: "SUBSCRIPTIONS" }],
      [{ text: "Ver Metas", callback_data: "METAS" }],
    ],
  },
});

exports.getRecurringOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "Sí", callback_data: "RECURRENT" }],
      [{ text: "No", callback_data: "NO_RECURRENT" }],
    ],
  },
});

exports.getCategoryOptions = (categories) => ({
  reply_markup: {
    inline_keyboard: categories.map((category) => [
      {
        text: category.name,
        callback_data: `CATEGORY-${category._id}-${category.name}`,
      },
    ]),
  },
});

exports.selectGasto = (gastos) => ({
  reply_markup: {
    inline_keyboard: gastos.map((gasto, i) => [
      {
        text: `(${i + 1}): ${formatCurrency(
          gasto.amount,
          CURRENCYS_OPTIONS.PESO_ARGENTINO
        )}`,
        callback_data: `GASTO-${gasto._id}-${gasto.amount}-${gasto.category.name}`,
      },
      {
        text: "Editar",
        callback_data: `EDIT_GASTO-${gasto._id}`,
      },
      {
        text: "Eliminar",
        callback_data: `DELETE_GASTO-${gasto._id}-${gasto.amount}`,
      },
    ]),
  },
});

exports.selectGastoAction = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "Editar", callback_data: "EDIT_GASTO" }],
      [{ text: "Eliminar", callback_data: "DELETE_GASTO" }],
    ],
  },
});

exports.backToMainMenu = () => ({
  reply_markup: {
    inline_keyboard: [[{ text: "<- Menú principal", callback_data: "MENU" }]],
  },
});


exports.getFrequencyOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: "Diario", callback_data: "ADD_SUBSCRIPTION-diario" }],
      [{ text: "Semanal", callback_data: "ADD_SUBSCRIPTION-semanal" }],
      [{ text: "Mensual", callback_data: "ADD_SUBSCRIPTION-mensual" }],
      [{ text: "Anual", callback_data: "ADD_SUBSCRIPTION-anual" }],
    ],
  },
}); // No need to implement this function