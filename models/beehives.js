"use strict";

const mongoose = require("mongoose");
const beehiveSchema = new mongoose.Schema({
  HiveID: {
    type: String,
    required: true
  },
  Location: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    match: /^.*\.(jpg|JPG|png|PNG|jpeg)$/,
    required: false,
  },
  Description: {
    type: String,
    required: false,
  }
});


module.exports = mongoose.model("beehive", beehiveSchema, "beehives");