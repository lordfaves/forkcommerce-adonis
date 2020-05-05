'use strict'
const { auth } = require('google-auth-library');
var randomstring = require("randomstring");
const moment = require('moment');
const Plan = use('App/Models/Plan')
const Store = use('App/Models/Store')
const Subscription = use('App/Models/Subscription')
const { validate } = use("Validator");
const { formatters } = use('Validator')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with subscriptions
 */
class SubscriptionController {

  async makeSubscription({request, response, auth})
  {
    const rules = {
      plan_id: "required|number"
    }

    const validation = await validate(request.all(), rules, formatters.JsonApi)

    if(validation.fails()){
      let errors = await validation.messages()
      return response.status(422).json({success:false, data:errors})
    }

    const plan = await Plan.find(request.input("plan_id"))

    if(!plan){
      return response.status(404).json({success:false, data:{message:"Plan not found."}})
    }
  
    const unpaid_subscriptions = await Subscription.query().where({status:'unpaid', user_id:auth.user.id}).with('plan').fetch()
    const pending_subscriptions = await Subscription.query().where({status:'pending', user_id:auth.user.id}).with('plan').fetch()

    if(pending_subscriptions.size() >= 3){
      return response.status(405).json({success:false,data:{message:"You have at least 3 pending subscriptions.", pending_subscriptions:pending_subscriptions}})
    }

    if(unpaid_subscriptions.size() >= 3){
      return response.status(405).json({success:false,data:{message:"You have at least 3 unpaid subscriptions.", unpaid_subscriptions:unpaid_subscriptions}})
    }

    const today = moment();
    const nextYear = today.add(1, "years")

    let store = {
      user_id : auth.user.id,
      name :'STORE-'+ randomstring.generate(8).toUpperCase(),
      status :'created'
    }
    
    store = await Store.create(store)
    
    var time = new Date().getTime()
    
    let subscription = {
      user_id : auth.user.id,
      store_id: store.id,
      plan_id : plan.id,
      price_point: plan.yearly_price,
      status: 'unpaid',
      code: 'SUB-'+randomstring.generate(8).toUpperCase()+'-'+time.toString().substring(0,10),
      expires_at: nextYear.format('YYYY-MM-DD HH:mm:ss'),
      type: 'yearly',
      notified: false,
    }

    // return response.json({store:store, subscription:subscription})

    subscription = await Subscription.create(subscription)

    return response.status(200).json({success:true, 
                  data:{
                        message:"Subscription pre-created with no coupon.",
                        price_to_pay:subscription.price_point,
                        price_in_naira:subscription.price_point*365,
                        subscription_id:subscription.id
                      }})

  }

  async userSubscriptions({request, response, auth})
  {
    const subscriptions = await Subscription.query().where('user_id', auth.user.id).with('plan').with('store').fetch()
    if(subscriptions.size() === 0){

      return response.status(404).json({success:false,data:{message:"You do not have any subscriptions yet."}})
    }  
    return response.status(200).json({success:true, data:{subscriptions}})
  }

  async userSubscription({request, response, auth, params})
  {
    const subscription = await Subscription.query().where({id:params.subscription_id, user_id:auth.user.id}).first()

    if(!subscription){

      return response.status(404).json({success:false,data:{message:"Subscription not found."}})
    } 
    
    return response.status(200).json({success:true, data:{subscription}})
  }

  async cancelSubscription({request, response, auth, params})
  {
    const subscription = await Subscription.query().where({id:params.subscription_id, user_id:auth.user.id}).first()

    if(!subscription){

      return response.status(404).json({success:false,data:{message:"Subscription not found."}})
    }

    
    if(!(subscription.status == 'unpaid') || (subscription.status == 'cancelled') || (subscription.status == 'failed')){

      return response.status(405).json({success:false,data:{message:"Subscription already paid for or awaiting approval."}})
    } 

    subscription.delete()

    return response.status(200).json({success:true, data:{message:"Subscription successfully cancelled."}})

  }


 
}

module.exports = SubscriptionController
