"use strict";

const mongoose = require("mongoose"),
{ Schema } = mongoose,
passportLocalMongoose = require("passport-local-mongoose"),
  userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    password : { 
        required: false
    }

  });

  userSchema.virtual("fullName").get(function() {
    return `${this.firstname} ${this.lastname}`;
  });
  
  userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
  });

module.exports = mongoose.model("user", userSchema, "users");