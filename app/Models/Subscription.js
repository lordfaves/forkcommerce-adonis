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

    code(){
        return 123456
    }
}

module.exports = Subscription
