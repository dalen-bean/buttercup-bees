"use strict";

// Import required libraries
const express = require("express"),
  app = express(),
  homeController = require("./controllers/homeController"),
  errorController = require("./controllers/errorController"),
  productsController = require("./controllers/productsController"),
  beehivesController = require("./controllers/beehiveController"),
  gardensController = require("./controllers/gardensController"),
  userController = require("./controllers/usersController"),
  expressSession = require("express-session"),
  passport = require("passport"),
  connectFlash = require("connect-flash"),
  User = require("./models/user"),
  layouts = require("express-ejs-layouts");
const fileUpload = require('express-fileupload');

// Import Mongoose rather than working with MongoDB directly
const mongoose = require("mongoose");
const usersController = require("./controllers/usersController");

mongoose.connect("mongodb+srv://Dalen:Mongodb@gettingstarted.k6dbe.mongodb.net/Project1?retryWrites=true&w=majority")

const db = mongoose.connection;

db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

app.set("view engine", "ejs"); // Use EJS
app.set("port", process.env.PORT || 3000); // Set port to PORT env variable or 3000
app.use(express.urlencoded({extended: false})); // Use built-in middleware to parse request body data from html forms (urlencoded)
app.use(express.json()); // Use built-in middleware to parse request body data in JSON format
app.use(layouts); // Tell the app that it should use express-ejs-layouts
app.use(express.static("public")); // Tell the app where to find static resources
app.use(fileUpload());

app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(connectFlash());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});



// Routes
app.get("/", (req, res) => {
  //res.sendFile(__dirname+"/views/index.html");
  res.render("index");
});
// Home Routes
app.get("/about", homeController.showAbout);
app.get("/products", productsController.showAllProducts);
app.get("/contact", homeController.showContact);
app.get("/gardens", gardensController.showAllLocations);
app.get("/index", homeController.showIndex);
app.get("/layout", homeController.showLayout);
app.get("/shop", homeController.showShop);
app.get("/location", beehivesController.showAllLocations);
app.get("/gardenProducts", gardensController.showAllLocations); //change this to show garden products
app.get("/unauthorized", homeController.unauthorized);

//Product Routes
app.get("/products/list", productsController.index, productsController.indexView);
app.get("/products/new", productsController.new);
app.post("/products/create", productsController.create, productsController.upload, productsController.redirectView);
app.get("/products/:id/edit", productsController.edit);
app.put("/products/:id/update", productsController.update, productsController.redirectView);
app.get("/products/:id", productsController.show, productsController.showView);
app.get("/products/:id/delete", productsController.delete, productsController.redirectView);

//Beehive Routes
app.get("/beehives/list", beehivesController.index, beehivesController.indexView);
app.get("/beehives/new", usersController.isAdmin, beehivesController.new);
app.post("/beehives/create", usersController.isAdmin, beehivesController.create, beehivesController.upload, beehivesController.redirectView);
app.get("/beehives/:id/edit", usersController.isAdmin, beehivesController.edit);
app.post("/beehives/:id/update", usersController.isAdmin, beehivesController.update, beehivesController.redirectView);
app.get("/beehives/:id", beehivesController.show, beehivesController.showView);
app.get("/beehives/:id/delete", usersController.isAdmin, beehivesController.delete, beehivesController.redirectView);

//Garden Routes
app.get("/gardens/list", gardensController.index, gardensController.indexView);
app.get("/gardens/new", usersController.isAdmin, gardensController.new);
app.post("/gardens/create", usersController.isAdmin, gardensController.create, gardensController.upload, gardensController.redirectView);
app.get("/gardens/:id/edit", usersController.isAdmin, gardensController.edit);
app.post("/gardens/:id/update", usersController.isAdmin, gardensController.update, gardensController.redirectView);
app.get("/gardens/:id", gardensController.show, gardensController.showView);
app.get("/gardens/:id/delete", usersController.isAdmin, gardensController.delete, gardensController.redirectView);

// User routes
app.get("/users/login", userController.login);
app.post("/users/login", userController.authenticate);
app.get("/users/logout", userController.logout, userController.redirectView);
app.get("/users/register", userController.register);
app.post("/users/create", userController.create, userController.redirectView);


app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
