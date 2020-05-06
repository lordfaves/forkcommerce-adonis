"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.on("/").render("welcome");

Route.group(() => {
  // Unlogged user routes.
  Route.post("/register", "UserController.register");
  Route.post("/login", "UserController.login");
  Route.post("google-auth", "UserController.googleAuth");
  Route.post("plans", "PlanController.getPlans");

  // Logged in user routes.
  Route.post("/logout", "UserController.logout").middleware("auth");
  Route.post("/get-code", "UserController.getCode");
  Route.post("/resend-code", "UserController.resendCode");
  Route.post("/verify-code", "UserController.verifyCode");
  Route.post("/details", "UserController.details").middleware("auth");
  Route.post("/notifications", "UserController.userNotifications").middleware(
    "auth"
  );
  Route.post("/updatePassword", "UserController.updatePassword").middleware(
    "auth"
  );

  Route.get("users", "UserController.allUsers").middleware("auth");

  //Subscriptions.
  Route.post(
    "subscriptions/apply-coupon",
    "CouponController.applyCoupon"
  ).middleware("auth");

  Route.post("applyCoupon", "CouponController.applyCoupon").middleware("auth");
  Route.post(
    "makeSubscription",
    "SubscriptionController.makeSubscription"
  ).middleware("auth");
  Route.post("makePayment", "PaymentController.makePayment").middleware("auth");
  Route.get(
    "userSubscriptions",
    "SubscriptionController.userSubscriptions"
  ).middleware("auth");
  Route.get(
    "userSubscriptions/:subscription_id",
    "SubscriptionController.userSubscription"
  ).middleware("auth");
  Route.post(
    "cancelSubscription",
    "SubscriptionController.cancelSubscription"
  ).middleware("auth");

  Route.get("userStores", "StoreController.userStores").middleware("auth");
  Route.get("getBanks", "BankController.getBanks").middleware("auth");

  //   ADMIN ROUTES
  Route.get(
    "allSubscriptions",
    "SubscriptionController.allSubscriptions"
  ).middleware("auth");
  Route.post("generateCoupon", "CouponController.generateCoupon").middleware(
    "auth"
  );
  Route.get("getCoupons", "CouponController.getCoupons").middleware("auth");
  Route.get("allPayments", "PaymentController.allPayments").middleware("auth");
  Route.post("queryPayments", "PaymentController.queryPayments").middleware(
    "auth"
  );

  Route.post("approvePayment", "PaymentController.approvePayment").middleware(
    "auth"
  );
  Route.post("disprovePayment", "PaymentController.disprovePayment").middleware(
    "auth"
  );

  //   STANDARD ROUTES

  Route.post(
    "subscriptions",
    "SubscriptionController.makeSubscription"
  ).middleware("auth");

  Route.get(
    "subscriptions",
    "SubscriptionController.userSubscriptions"
  ).middleware("auth");
  Route.get(
    "subscriptions/:subscription_id",
    "SubscriptionController.userSubscription"
  ).middleware("auth");
  Route.delete(
    "subscriptions/:subscription_id/cancel",
    "SubscriptionController.cancelSubscription"
  ).middleware("auth");

  // Stores
  Route.get("stores", "StoreController.userStores").middleware("auth");

  // Payments
  Route.get("payments/all", "PaymentController.allPayments").middleware("auth");
  Route.post("payments/query", "PaymentController.queryPayments").middleware(
    "auth"
  );
  Route.post("payments/approve", "PaymentController.approvePayment").middleware(
    "auth"
  );
  Route.post(
    "payments/disprove",
    "PaymentController.disprovePayment"
  ).middleware("auth");
  Route.post("payments", "PaymentController.makePayment").middleware("auth");
  Route.get("payments", "PaymentController.userPayments").middleware("auth");

  //   Coupons
  Route.post("coupons/generate", "CouponController.generateCoupon").middleware(
    "auth"
  );
  Route.get("coupons", "CouponController.getCoupons").middleware("auth");
}).prefix("api");

// Route::group(['middleware' => ['auth:api','apiauth:client_token'], 'namespace' => 'api',], function(){
//     Route::post('logout', 'UserController@logoutApi');
//     Route::post('getCode', 'UserController@getCode')->middleware('throttle:10,1');
//     Route::post('resendCode', 'UserController@resendCode')->middleware('throttle:10,1');
//     Route::post('verifyCode', 'UserController@verifyCode')->middleware('throttle:10,1');
//     Route::post('details','UserController@details');
//     Route::get('userNotifications','UserController@userNotifications');
//     Route::post('updatePassword', 'UserController@updatePassword')->middleware('throttle:10,1');

//     Route::group(['middleware'=>['role:sudo']], function(){

//         Route::get('users', 'UserController@users');

//         Route::post('generateCoupon', 'CouponController@generateCoupon');
//         Route::get('getCoupons', 'CouponController@getCoupons');

//         Route::get('allPayments', 'PaymentController@allPayments');
//         Route::post('getPayments', 'PaymentController@getPayments');
//         Route::post('approvePayment', 'PaymentController@approvePayment');
//         Route::post('disprovePayment', 'PaymentController@disprovePayment');

//         Route::get('allSubscriptions', 'SubscriptionController@allSubscriptions');

//     });

//     Route::post('applyCoupon', 'CouponController@applyCoupon')->middleware('throttle:20,1');;

//     Route::post('makeSubscription', 'SubscriptionController@makeSubscription');
//     Route::get('userSubscriptions', 'SubscriptionController@userSubscriptions');
//     Route::get('userSubscriptions/{subscription}', 'SubscriptionController@getSubscription');
//     Route::post('cancelSubscription', 'SubscriptionController@cancelSubscription');
//     Route::get('userStores', 'StoreController@userStore');

//     Route::post('articles', 'ArticleController@create');
//     Route::get('articles/{article}', 'ArticleController@show');
//     Route::put('articles/{article}', 'ArticleController@update');
//     Route::delete('articles/{article}', 'ArticleController@delete');
//     Route::get('articles', 'ArticleController@list');
// });
