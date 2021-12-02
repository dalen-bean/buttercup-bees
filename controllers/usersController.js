const User = require("../models/user"),
    passport = require("passport"),
    httpStatus = require("http-status-codes").StatusCodes;
getUserParams = body => {
    return {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        admin: body.admin
    };
  };
module.exports = {
    users: (req, res, next) => {
        res.render("users")
    },
    login: (req, res, next) => {
        res.render("users/login")
    }, 
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",

        successRedirect: "/",

    }),
    logout: (req, res, next) => {
        req.logout();
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
      },
    register: (req, res, next) => {
        res.render("users/register")
    },
    create: (req, res, next) => {
        if (req.skip) next();
        let newUser = new User(getUserParams(req.body));
        console.log(newUser);
        User.register(newUser, req.body.password, (error, user) => {
          if (user) {
            res.locals.redirect = "/users/login";
            next();
          } else {
            res.locals.redirect = "/users/login";
            next();
          }
        });
    },
    redirectView: (req, res, next) => {
      let redirectPath = res.locals.redirect;
      if (redirectPath) res.redirect(redirectPath);
      else next();
    },
      isAdmin: (req, res, next) => {
        if(res.locals.currentUser && res.locals.currentUser.admin){
          next()
        } else {
            res.redirect('/unauthorized')
        }
    }
}