"use strict";
const Bank = use("App/Models/Bank");
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with banks
 */
class BankController {
  async getBanks({ response }) {
    const banks = await Bank.all();
    return response.json({ success: true, data: banks });
  }
}

module.exports = BankController;
