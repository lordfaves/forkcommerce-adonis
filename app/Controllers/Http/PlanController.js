'use strict'
const Plan = use('App/Models/Plan')
class PlanController {
  async getPlans({request, response, auth}){
    const plans = await Plan.query().with('features').fetch()
    return response.json({success:true,data:plans})
  }
}

module.exports = PlanController
