"use strict";

var randomstring = require("randomstring");
const moment = require("moment");
const Coupon = use("App/Models/Coupon");
const Plan = use("App/Models/Plan");
const Store = use("App/Models/Store");
const Subscription = use("App/Models/Subscription");
const { validate } = use("Validator");
const { formatters } = use("Validator");
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  async generateCoupon({ request, response, auth }) {
    if (auth.user.id != 1) {
      return response
        .status(403)
        .json({ success: false, data: { message: "Forbidden action." } });
    }

    const rules = {
      plan_id: "required|number",
      type: "required",
    };

    const validation = await validate(request.all(), rules, formatters.JsonApi);
    if (validation.fails()) {
      let errors = await validation.messages();
      return response.status(422).json({ success: false, data: errors });
    }

    const plan = await Plan.find(request.input("plan_id"));
    if (!plan) {
      return response
        .status(404)
        .json({ success: false, data: { message: "Plan not found." } });
    }

    if (request.input("type") == "slash") {
      const slashRules = {
        slash: "required|number",
      };

      const validation = await validate(
        request.all(),
        slashRules,
        formatters.JsonApi
      );
      if (validation.fails()) {
        let errors = await validation.messages();
        return response.status(422).json({ success: false, data: errors });
      }

      if (request.input("slash") > plan.yearly_price) {
        return response
          .status(422)
          .json({
            success: false,
            data: {
              message:
                "The slash should not be greater than the initial plan price",
            },
          });
      }

      let coupon = {
        plan_id: plan.id,
        code: "SL-" + randomstring.generate(8).toUpperCase(),
        type: request.input("type"),
        slash: request.input("slash"),
      };

      coupon = await Coupon.create(coupon);

      return response.json({ success: true, data: coupon });
    } else if (request.input("type") == "percent") {
      const percentRules = {
        percent: "required|number|min:0|max:100",
      };

      if (request.input("percent") > 100 || request.input("percent") < 0) {
        return response
          .status(422)
          .json({
            success: false,
            data: {
              message:
                "The slash should not be less than 0 or greater than 100",
            },
          });
      }

      const validation = await validate(
        request.all(),
        percentRules,
        formatters.JsonApi
      );
      if (validation.fails()) {
        let errors = await validation.messages();
        return response.status(422).json({ success: false, data: errors });
      }

      let coupon = {
        plan_id: plan.id,
        code: "PC-" + randomstring.generate(8).toUpperCase(),
        type: request.input("type"),
        percent: request.input("percent"),
      };

      coupon = await Coupon.create(coupon);

      return response.json({ success: true, data: coupon });
    } else {
      return response
        .status(404)
        .json({ success: false, data: { message: "Invalid coupon type." } });
    }
  }

  async getCoupons({ request, response, auth }) {
    if (auth.user.id != 1) {
      return response
        .status(403)
        .json({ success: false, data: { message: "Forbidden action." } });
    }

    const validCoupons = await Coupon.query()
      .where("status", "active")
      .with("plan")
      .fetch();
    const usedCoupons = await Coupon.query()
      .where("status", "used")
      .with("plan")
      .with("subscriptions.user")
      .fetch();

    return response.json({
      success: true,
      data: { valid_coupons: validCoupons, used_coupons: usedCoupons },
    });
  }

  async applyCoupon({ request, response, auth }) {
    const rules = {
      plan_id: "required|number",
      coupon_code: "required|string",
    };

    const validation = await validate(request.all(), rules, formatters.JsonApi);
    if (validation.fails()) {
      let errors = await validation.messages();
      return response.status(422).json({ success: false, data: errors });
    }
    const plan = await Plan.find(request.input("plan_id"));
    const coupon = await Coupon.query()
      .where("code", request.input("coupon_code"))
      .first();

    if (!plan) {
      return response
        .status(404)
        .json({ success: false, data: { message: "Plan not found." } });
    }

    if (!coupon) {
      return response
        .status(404)
        .json({ success: false, data: { message: "Coupon code not found." } });
    }

    if (coupon.status === "used") {
      return response.status(404).json({
        success: false,
        data: { message: "Coupon code has been used." },
      });
    }

    if (coupon.plan_id != request.input("plan_id")) {
      return response.status(404).json({
        success: false,
        data: { message: "Coupon code cannot be used on this plan." },
      });
    }

    const unpaid_subscriptions = await Subscription.query()
      .where({ status: "unpaid", user_id: auth.user.id })
      .with("plan")
      .fetch();
    const pending_subscriptions = await Subscription.query()
      .where({ status: "pending", user_id: auth.user.id })
      .with("plan")
      .fetch();

    if (pending_subscriptions.size() >= 3) {
      return response.status(405).json({
        success: false,
        data: {
          message: "You have at least 3 pending subscriptions.",
          pending_subscriptions: pending_subscriptions,
        },
      });
    }

    if (unpaid_subscriptions.size() >= 3) {
      return response.status(405).json({
        success: false,
        data: {
          message: "You have at least 3 unpaid subscriptions.",
          unpaid_subscriptions: unpaid_subscriptions,
        },
      });
    }

    let price = plan.yearly_price;

    if (coupon.type == "slash") {
      price = plan.yearly_price - coupon.slash;
    }

    if (coupon.type == "percent") {
      let percent = 100 - coupon.percent;
      price = (plan.yearly_price * percent) / 100;
    }

    const today = moment();
    const nextYear = today.add(1, "years");

    let store = {
      user_id: auth.user.id,
      name: "STORE-" + randomstring.generate(8).toUpperCase(),
      status: "created",
    };

    var time = new Date().getTime();
    store = await Store.create(store);

    let subscription = {
      user_id: auth.user.id,
      plan_id: plan.id,
      coupon_id: coupon.id,
      price_point: price,
      store_id: store.id,
      status: "unpaid",
      code:
        "SUB-" +
        randomstring.generate(8).toUpperCase() +
        "-" +
        time.toString().substring(0, 10),
      expires_at: nextYear.format("YYYY-MM-DD HH:mm:ss"),
      type: "yearly",
      notified: false,
    };

    subscription = await Subscription.create(subscription);

    coupon.status = "used";
    await coupon.save();

    return response.status(200).json({
      success: true,
      data: {
        message: "Coupon code applied, subscription created.",
        price_to_pay: price,
        price_in_naira: price * 365,
        subscription_id: subscription.id,
      },
    });
  }
}

module.exports = CouponController;
