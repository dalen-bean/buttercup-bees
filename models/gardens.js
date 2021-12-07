"use strict";

const mongoose = require("mongoose");
const gardenSchema = new mongoose.Schema({
  GardenID: {
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
    required: true,
  }
});


module.exports = mongoose.model("garden", gardenSchema, "gardens");