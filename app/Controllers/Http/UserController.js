"use strict";

const Env = use("Env");
const User = use("App/Models/User");
const { validate } = use("Validator");
const { formatters } = use("Validator");
const { OAuth2Client, auth } = require("google-auth-library");
const Hash = use("Hash");

class UserController {
  async register({ request, auth, response }) {
    const rules = {
      first_name: "required",
      last_name: "required",
      email: "required|email|unique:users,email",
      mobile: "required|unique:users,mobile",
      password: "required|min:6",
    };

    const messages = {
      "first_name.required": "First name field is required.",
      "last_name.required": "Last name field is required.",
      "mobile.required": "Mobile number field is required.",
      "mobile.unique": "Mobile number already exists.",
      "email.required": "Email field is required.",
      "email.unique": "Email already exists.",
      "email.email": "Please provide valid email.",
      "password.required": "Password field is required.",
      "password.min:6": "Password must be at least 6 characters long.",
    };
    const validation = await validate(
      request.all(),
      rules,
      messages,
      formatters.JsonApi
    );
    // return validation

    if (validation.fails()) {
      let valErr = await validation.messages();

      return response.status(422).json({ success: false, data: valErr });
    }

    // return request.all()

    try {
      let user = await User.create(
        request.only([
          "first_name",
          "last_name",
          "email",
          "password",
          "mobile",
        ]),
        { status: "registered" }
      );

      //generate token for user;
      let token = await auth.generate(user);

      Object.assign(user, token);

      return response.json({ success: true, data: user });
    } catch (e) {
      res.success = false;
      res.data = {};
      res.data = e.message;
    }

    return response.json(res);
  }

  async login({ request, auth, response }) {
    let { email, password } = request.all();

    try {
      if (await auth.attempt(email, password)) {
        let user = await User.findBy("email", email);
        let token = await auth.generate(user);

        Object.assign(user, token);
        return response.json(user);
      }
    } catch (e) {
      console.log(e);
      return response
        .status(401)
        .json({ success: false, data: { message: "Unauthorized" } });
    }
  }

  async googleAuth({ request, auth, response }) {
    const rules = {
      id_token: "required",
    };

    const messages = {
      "id_token.required": "Client ID token field is required.",
    };

    const validation = await validate(
      request.all(),
      rules,
      messages,
      formatters.JsonApi
    );
    // return validation

    if (validation.fails()) {
      let valErr = await validation.messages();

      return response.status(422).json({ success: false, data: valErr });
    }

    // return request.input('id_token')
    const client_id = Env.get("GOOGLE_CLIENT_ID");
    const client = new OAuth2Client(client_id);
    const ticket = await client.verifyIdToken({
      idToken: request.input("id_token"),
      audience: client_id,
    });

    return ticket;

    return client_id;
  }

  async details({ request, response, auth }) {
    return response
      .status(200)
      .json({ success: true, data: { user: auth.user } });
  }

  async allUsers({ request, response, auth }) {
    if (auth.user.id != 1) {
      return response
        .status(403)
        .json({ success: false, data: { message: "Forbidden action." } });
    }
    const users = await User.query()
      .with("subscriptions.store")
      .with("subscriptions.plan")
      .with("subscriptions.payments")
      .fetch();

    return response.status(200).json({
      success: true,
      data: {
        users: users,
      },
    });
  }
  async logout({ request, response, auth }) {
    await auth.authenticator("jwt").revokeTokens();
    await auth.authenticator("jwt").revokeTokensForUser(auth.user);

    return response.json({
      success: true,
      data: { message: "Logout successful." },
    });
  }

  async userNotifications({ request, response, auth }) {
    return auth.user;
  }

  async updatePassword({ request, response, auth }) {
    const user = auth.user;
    const rules = {
      old_password: "required",
      new_password: "required|different:old_password|min:6",
      c_password: "required|same:new_password",
    };

    const validation = await validate(request.all(), rules, formatters.JsonApi);
    if (validation.fails()) {
      let errors = await validation.messages();
      return response.status(422).json({ success: false, data: errors });
    }

    // return user;
    // verify if current password matches
    const verifyPassword = await Hash.verify(
      request.input("old_password"),
      user.password
    );

    // display appropriate message
    if (!verifyPassword) {
      return response.status(401).json({
        success: false,
        data: {
          message: "Current password could not be verified! Please try again.",
        },
      });
    }

    // hash and save new password
    user.password = request.input("new_password");
    await user.save();

    return response.json({
      success: true,
      data: { message: "Password successfully changed!" },
    });
  }
}

module.exports = UserController;
