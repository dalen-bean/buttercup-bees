"use strict";

//Require subscriber model to handle all data operations for subscribers
const Subscriber = require("../models/subscriber");

// Get a list of all subscribers in the database
exports.getAllSubscribers = (req, res) => {
  Subscriber.find({})
    .then(subscribers => {
      res.render("subscribers", {
        subscribers: subscribers
      });
    })
    .catch(error => {
      console.log(error.message);
      return [];
    })
    .then(() => {
      console.log("promise complete");
    });
};

// Render the contact view
exports.getSubscriptionPage = (req, res) => {
  res.render("contact");
};

// Save a new subscriber in the database
exports.saveSubscriber = (req, res) => {

  //Create a new instance of the subscriber model with data from form
  let newSubscriber = new Subscriber({
    name: req.body.name,
    email: req.body.email,
    zipCode: req.body.zipCode
  });

  //Call the save function to insert the new subscriber into the database
  newSubscriber.save()
    .then(() => {
      res.render("thanks");
    })
    .catch(error => {
      res.send(error);
    });
};

exports.deleteSubscriber = (req, res) => {
  let id = req.params.id;

  Subscriber.findByIdAndDelete(id).then(() => {
    console.log("Subscriber Deleted");
    res.redirect("/subscriber");
  }).catch((error) => {
    console.log(error)
  })
}