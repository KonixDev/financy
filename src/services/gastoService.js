// services/gastoService.js
const GastoRepository = require("../repositories/gastoRepository");
const MetaService = require("./metaService");
const ChartHelper = require("../helpers/chartHelper");
const moment = require("moment");
const { MESSAGES } = require("../constants/messages");
const { getRecurringOptions } = require("../helpers/telegramResponseHelper");
const { formatCurrency, CURRENCYS_OPTIONS } = require("../utils/currencyUtil");
const fs = require("fs");
const { getMesName } = require("../utils/datesUtils");
const { ACTIONS } = require("../constants/actions");
class GastoService {
  static async getSummary(userId) {
    const gastos = await GastoRepository.findByUser(userId);
    const metas = await MetaService.getMetasByUser(userId);

    const gastosPorMes = this.calculateGastosPorMes(gastos);
    const gastosPorCategoria = this.calculateGastosPorCategoria(gastos);
    const metasProgreso = this.calculateMetasProgreso(metas);
    const gastosPorDia = this.calculateGastosPorDia(gastos);

    const charts = await this.generateCharts(
      gastosPorMes,
      gastosPorCategoria,
      metasProgreso,
      gastosPorDia
    );
    const text = this.formatSummaryText(
      gastosPorMes,
      gastosPorCategoria,
      metasProgreso
    );

    return {
      text,
      summary: {
        gastosPorMes,
        gastosPorCategoria,
        metasProgreso,
        gastosPorDia,
      },
      charts,
    };
  }
  static async editGasto(gastoId, updateData, userId) {
    const gasto = await GastoRepository.findById(gastoId);
    if (!gasto) {
      throw new Error("Gasto no encontrado");
    }

    // Verificar si el usuario es el propietario del gasto
    if (gasto.user.toString() !== userId) {
      throw new Error("No autorizado");
    }

    const updatedGasto = await GastoRepository.updateGasto(gastoId, updateData);
    return updatedGasto;
  }

  static async getLastMonthSummaryByCategory(userId, categoryId) {
    const gastos = await GastoRepository.findByUser(userId);
    const gastosLastMonth = gastos.filter(
      (gasto) =>
        moment(gasto.date).isAfter(moment().subtract(1, "month")) &&
        gasto.category._id.toString() === categoryId
    );
    const gastosPorDia = this.calculateGastosPorDia(gastosLastMonth);
    const spentLastMonthChart = await ChartHelper.generateBarChart(
      Object.keys(gastosPorDia).reverse(),
      Object.values(gastosPorDia).reverse(),
      `Consumo Diario (Últimos 30 días) - ${gastos[0].category.name}`
    );

    return { spentLastMonthChart };
  }
  static calculateGastosPorMes(gastos) {
    return gastos.reduce((acc, gasto) => {
      const mes = moment(gasto.date).format("YYYY-MM");
      acc[mes] = (acc[mes] || 0) + gasto.amount;
      return acc;
    }, {});
  }

  static calculateGastosPorCategoria(gastos) {
    return gastos.reduce((acc, gasto) => {
      acc[gasto.category.name] = (acc[gasto.category.name] || 0) + gasto.amount;
      return acc;
    }, {});
  }

  static calculateMetasProgreso(metas) {
    return metas.map((meta) => ({
      name: meta.name,
      targetAmount: meta.targetAmount,
      currentAmount: meta.currentAmount,
      progress: ((meta.currentAmount / meta.targetAmount) * 100).toFixed(2),
      category: meta.category,
      deadline: meta.deadline,
    }));
  }

  static calculateGastosPorDia(gastos) {
    const hoy = moment().startOf("day");
    const gastosPorDia = {};

    for (let i = 0; i < 30; i++) {
      const dia = hoy.clone().subtract(i, "days").format("YYYY-MM-DD");
      gastosPorDia[dia] = 0;
    }

    gastos.forEach((gasto) => {
      const dia = moment(gasto.date).format("YYYY-MM-DD");
      if (gastosPorDia.hasOwnProperty(dia)) {
        gastosPorDia[dia] += gasto.amount;
      }
    });

    return gastosPorDia;
  }

  static async generateCharts(
    gastosPorMes,
    gastosPorCategoria,
    metasProgreso,
    gastosPorDia
  ) {
    const gastoMensualChart = await ChartHelper.generateBarChart(
      Object.keys(gastosPorMes)
        .map((value) => getMesName(value))
        .reverse(),
      Object.values(gastosPorMes).reverse(),
      "Gastos por Mes (Últimos 12 meses)"
    );

    const gastoCategoriaChart = await ChartHelper.generatePieChart(
      Object.keys(gastosPorCategoria),
      Object.values(gastosPorCategoria),
      "Gastos por Categoría"
    );

    const metaProgresoChart = await ChartHelper.generateBarChart(
      metasProgreso.map((meta) => meta.name),
      metasProgreso.map((meta) => meta.progress),
      "Progreso de Metas (%)",
      { max: 100 }
    );

    const gastoDiarioChart = await ChartHelper.generateBarChart(
      Object.keys(gastosPorDia).reverse(),
      Object.values(gastosPorDia).reverse(),
      "Resumen Mensual (Últimos 30 días)"
    );

    return {
      gastoMensualChart,
      gastoCategoriaChart,
      metaProgresoChart,
      gastoDiarioChart,
    };
  }

  static formatSummaryText(gastosPorMes, gastosPorCategoria, metasProgreso) {
    let text =
      "Resumen de Gastos (en los últimos 30 días):\
      \n\nGastos en el Mes:";
    Object.keys(gastosPorMes).forEach((mes) => {
      text += `\n${getMesName(mes)}: ${formatCurrency(
        gastosPorMes[mes],
        CURRENCYS_OPTIONS.PESO_ARGENTINO
      )}`;
    });
    text += "\n\nGastos por Categoría:";
    Object.keys(gastosPorCategoria).forEach((categoria) => {
      text += `\n${categoria}: ${formatCurrency(
        gastosPorCategoria[categoria],
        CURRENCYS_OPTIONS.PESO_ARGENTINO
      )}`;
    });
    text += "\n\nProgreso de Metas:";
    metasProgreso.forEach((meta) => {
      text += `\n${meta.name}: ${meta.progress}%`;
    });
    return text;
  }

  static async createGasto(gastoData) {
    return GastoRepository.createGasto(gastoData);
  }

  static async getGastos(userId) {
    const gastos = await GastoRepository.getLastGastos(userId);
    return { resumeText: this.formatGastos(gastos), gastos };
  }

  static async updateGasto(gastoId, gastoData, userId) {
    const gasto = await GastoRepository.findById(gastoId);
    if (!gasto) {
      throw new Error("Gasto no encontrado");
    }

    // Verificar si el usuario es el propietario del gasto
    if (gasto.user._id.toString() !== userId.toString()) {
      throw new Error("No autorizado");
    }

    return GastoRepository.updateGasto(gastoId, gastoData);
  }

  static async deleteGasto(gastoId, userId) {
    const gasto = await GastoRepository.findById(gastoId);
    if (!gasto) {
      throw new Error("Gasto no encontrado");
    }

    // Verificar si el usuario es el propietario del gasto
    if (gasto.user._id.toString() !== userId.toString()) {
      throw new Error("No autorizado");
    }

    return GastoRepository.deleteGasto(gastoId);
  }

  static formatGastos(gastos) {
    let gastosText = "Últimos 10 Gastos Recientes:\n";
    gastos.forEach((gasto, i) => {
      const dateHuman = new Date(gasto.date).toLocaleDateString();
      gastosText += `(${i + 1}): ${dateHuman}: ${formatCurrency(
        gasto.amount,
        CURRENCYS_OPTIONS.PESO_ARGENTINO
      )} en ${gasto.category.name}\n`;
    });
    return gastosText;
  }
  static async processGastoCreation(bot, chatId, text, usersInProcess) {
    const amount = parseFloat(text);
    if (isNaN(amount)) {
      await bot.sendMessage(chatId, MESSAGES.INVALID_AMOUNT);
    } else {
      usersInProcess[chatId].amount = amount;
      const options = getRecurringOptions();
      await bot.sendMessage(chatId, MESSAGES.IS_RECURRING, options);
    }
  }

  static async processGastoEdit(bot, chatId, text, usersInProcess, user) {
    const { gastoId, stage } = usersInProcess[chatId];
    if (usersInProcess[chatId].action === ACTIONS.EDIT_GASTO && !stage) {
      const newAmount = parseFloat(text);
      if (isNaN(newAmount)) {
        await bot.sendMessage(chatId, MESSAGES.INVALID_AMOUNT);
        return;
      }
      if (newAmount !== 0) {
        usersInProcess[chatId].newAmount = newAmount;
      }
      usersInProcess[chatId].stage = ACTIONS.GASTO_UPDATE_DATE;
      return await bot.sendMessage(chatId, MESSAGES.ENTER_NEW_DATE);
    }
    
    if (stage && stage === ACTIONS.GASTO_UPDATE_DATE) {
      // Check if Date is in correct format, YYYY-MM-DD
      let newDate = new Date(text);
      if (isNaN(newDate)) {
        await bot.sendMessage(chatId, MESSAGES.ENTER_NEW_DATE);
        return;
      }
      // Add one day to the date to avoid timezone issues
      newDate.setDate(newDate.getDate() + 1);
      usersInProcess[chatId].newDateText = newDate;
      const gastoUpdatedData = {}
      if (usersInProcess[chatId].newAmount) {
        gastoUpdatedData.amount = usersInProcess[chatId].newAmount;
      }
      if (usersInProcess[chatId].newDateText) {
        gastoUpdatedData.date = usersInProcess[chatId].newDateText;
      }
      const gastoUpdated = await this.updateGasto(gastoId, gastoUpdatedData, user._id);
      delete usersInProcess[chatId]; // Clean up process
      await bot.sendMessage(chatId, MESSAGES.GASTO_UPDATED(
        gastoUpdated.amount,
        gastoUpdated.category.name,
        gastoUpdated.date.toLocaleDateString()
      ));
    }
  }

  static async createGasto(chatId, data) {
    const gastoData = {
      user: chatId,
      amount: data.amount,
      category: data.category,
      isRecurring: data.isRecurring,
      date: new Date(),
    };

    const gasto = await GastoRepository.createGasto(gastoData);
    const totalGastado = await GastoRepository.calculateTotalSpent(chatId);
    const { spentLastMonthChart } = await this.getLastMonthSummaryByCategory(
      chatId,
      data.category
    );

    return { gasto, totalGastado, spentLastMonthChart };
  }
}

module.exports = GastoService;
