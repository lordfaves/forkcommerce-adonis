'use strict'
const Store = use('App/Models/Store')

class StoreController {
  
  async userStores({request, response, auth})
  {
    const stores = await Store.query().where('user_id', auth.user.id).with('subscriptions').fetch()
    if(stores.size() === 0){

      return response.status(404).json({success:false,data:{message:"You do not have any stores yet."}})
    }  
    return response.status(200).json({success:true, data:{stores}})
  }
}

module.exports = StoreController
