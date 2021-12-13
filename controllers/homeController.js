"use strict";
//DATABASE URL: mongodb+srv://Dalen:Mongodb@gettingstarted.k6dbe.mongodb.net/project1?retryWrites=true&w=majority

const moment = require('moment');

exports.showAbout = (req, res) => {
  res.render("about")
};
exports.showProducts = (req, res) => {
  res.render("products");
};
exports.showContact = (req, res) => {
  res.render("contact");
};
exports.showGardens = (req, res) => {
  res.render("gardens");
};
exports.showIndex = (req, res) => {
  res.render("index", {moment: moment});
};
exports.showLayout = (req, res) => {
  res.render("layout");
};
exports.showShop = (req, res) => {
  res.render("shop");
};
exports.showLocation = (req, res) => {
  res.render("location");
};
exports.unauthorized = (req, res) => {
  res.render("unauthorized");
};
exports.showGardenProducts = (req, res) => {
  res.render("gardenProducts");
}

