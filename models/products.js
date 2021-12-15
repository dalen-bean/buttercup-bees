"use strict";

const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
    min: [0, "Cannot have a negative price"],
    required: true
  },
  imageURL: {
    type: String,
    match: /^.*\.(jpg|JPG|png|PNG|jpeg)$/,
    required: false,
  }
});

productSchema.methods.getInfo = function() {
    return `Name: ${this.name} Description: ${this.description} Price: ${this.price}`;
  };

module.exports = mongoose.model("product", productSchema, "products");