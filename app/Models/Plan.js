'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Plan extends Model {
    static boot () {
        super.boot()

        this.addTrait('@provider:Lucid/SoftDeletes')
    }
      
    subscriptions(){
        return this.hasMany('App/Models/Subscription')
    }
      
    coupons(){
        return this.hasMany('App/Models/Coupon')
    }

    features(){
        return this.belongsToMany('App/Models/Feature')
    }
}

module.exports = Plan
