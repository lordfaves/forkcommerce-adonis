'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Feature extends Model {


    plans(){
        return this.belongsToMany('App/Models/Plan')
    }
    
}

module.exports = Feature
