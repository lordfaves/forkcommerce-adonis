'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Subscription extends Model {
    static boot () {
        super.boot()
    
        this.addTrait('@provider:Lucid/SoftDeletes')
      }
      
    plan(){
        return this.belongsTo('App/Models/Plan')
    }

    store(){
        return this.belongsTo('App/Models/Store')
    }

    
    payments(){
        return this.hasMany('App/Models/Payment')
    }

    coupon(){
        return this.belongsTo('App/Models/Coupon')
    }

    store(){
        return this.belongsTo('App/Models/Store')
    }

    user(){
        return this.belongsTo('App/Models/User')
    }

}

module.exports = Subscription
