'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Payment extends Model {

    subscription(){
        return this.belongsTo('App/Models/Subscription')
    }

    user(){
        return this.belongsTo('App/Models/User')
    }

    bank(){
        return this.belongsTo('App/Models/Bank')
    }
}

module.exports = Payment
