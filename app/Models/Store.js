'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Store extends Model {
    static boot () {
        super.boot()

        this.addTrait('@provider:Lucid/SoftDeletes')
    }
      
    subscriptions(){
        return this.hasMany('App/Models/Subscription')
    }
}

module.exports = Store
