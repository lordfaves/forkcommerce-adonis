'use strict'

const { auth } = require('google-auth-library');
var randomstring = require("randomstring");
const moment = require('moment');
const Coupon = use('App/Models/Coupon')
const Plan = use('App/Models/Plan')
const Store = use('App/Models/Store')
const Subscription = use('App/Models/Subscription')
const { validate } = use("Validator");
const { formatters } = use('Validator')
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {

  async applyCoupon({request, response, auth})
  {
   
    const rules = {
        plan_id: "required|number",
        coupon_code: "required|string"
    }

    const validation = await validate(request.all(), rules, formatters.JsonApi)
    if(validation.fails()){
      let errors = await validation.messages()
      return response.status(422).json({success:false, data:errors})
    }
    const plan = await Plan.find(request.input("plan_id"))
    const coupon = await Coupon.query().where('code',request.input("coupon_code")).first()

    if(!plan){
      return response.status(404).json({success:false, data:{message:"Plan not found."}})
    }

    if(!coupon){
      return response.status(404).json({success:false, data:{message:"Coupon code not found."}})
    }

    if(coupon.status === "used"){
      return response.status(404).json({success:false, data:{message:"Coupon code has been used."}})
    }

    if(coupon.plan_id != request.input("plan_id")){
      return response.status(404).json({success:false, data:{message:"Coupon code cannot be used on this plan."}})
    }

    const unpaid_subscriptions = await Subscription.query().where({status:'unpaid', user_id:auth.user.id}).with('plan').fetch()
    const pending_subscriptions = await Subscription.query().where({status:'pending', user_id:auth.user.id}).with('plan').fetch()

    if(pending_subscriptions.size() >= 3){
      return response.status(405).json({success:false,data:{message:"You have at least 3 pending subscriptions.", pending_subscriptions:pending_subscriptions}})
    }

    if(unpaid_subscriptions.size() >= 3){
      return response.status(405).json({success:false,data:{message:"You have at least 3 unpaid subscriptions.", unpaid_subscriptions:unpaid_subscriptions}})
    }

    let price = plan.yearly_price

    if(coupon.type == "slash"){
      price = plan.yearly_price - coupon.slash
    }

    if(coupon.type == "percent"){
      let percent = 100-coupon.percent
      price = plan.yearly_price *percent/100
    }

    const today = moment();
    const nextYear = today.add(1, "years")

    let store = {
      user_id : auth.user.id,
      name :'STORE-'+ randomstring.generate(8).toUpperCase(),
      status :'created'
    }
    
    var time = new Date().getTime()
    store = await Store.create(store)
    
    let subscription = {
      user_id : auth.user.id,
      plan_id : plan.id,
      coupon_id : coupon.id,
      price_point: price,
      store_id: store.id,
      status: 'unpaid',
      code: 'SUB-'+randomstring.generate(8).toUpperCase()+'-'+time.toString().substring(0,10),
      expires_at: nextYear.format('YYYY-MM-DD HH:mm:ss'),
      type: 'yearly',
      notified: false,
    }

    subscription = await Subscription.create(subscription)

    coupon.status = 'used';
    await coupon.save()

    return response.status(200).json({success:true, 
                  data:{
                        message:"Coupon code applied, subscription created.",
                        price_to_pay:price,
                        price_in_naira:price*365,
                        subscription_id:subscription.id
                      }})
  }
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new coupon.
   * GET coupons/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing coupon.
   * GET coupons/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = CouponController
