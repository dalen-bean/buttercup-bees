'use strict';
const {check, validationResult} = require("express-validator");
const httpStatus = require("http-status-codes").StatusCodes,
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    Product= require("../models/products"),
    jsonWebToken = require("jsonwebtoken");

var secretKey = "secret_key"

module.exports= {
    
    getProducts: (req, res) => {
        res.json({
            status: httpStatus.OK,
            data: res.locals
        });
    },
    getToken: (req, res, next) => {
        new Cookie(req,res).set('access_token',token,{
        httpOnly: true,
        secure: true
    });

    },

      //The token always comes back as undefined
    verifyToken: (req, res, next) => {
    let token = req.query.apiToken;
    console.log(token)
    if (token) {
      User.findOne({ apiToken: token })
        .then(user => {
            res.json(token)
          if (user) next();
          else next(new Error("Invalid API token."));
        })
        .catch(error => {
          next(new Error(error.message));
        });
    } else {
      next(new Error("Invalid API token."));
    }
  },

  filterUserProduct: (req, res, next) => {
    let currentUser = res.locals.currentUser;
    if (currentUser) {
      let mappedStyles = res.locals.style.map(style => {
        let usersFavorite = currentUser.style.some(userStyle => {
          return userStyle.equals(style._id);
        });
        return Object.assign(style.toObject(), { favorite: usersFavorite });
      });
      res.locals.styles = mappedStyles;
      next();
    } else {
      next();
    }
  },
  apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", (errors, user) => {
      if (user) {
        let signedToken = jsonWebToken.sign(
          {
            data: user._id,
            exp: new Date().setDate(new Date().getDate() + 1)
          },
          "secret_encoding_passphrase"
        );
        res.json({
          success: true,
          token: signedToken
        });
      } else
        res.json({
          success: false,
          message: "Could not authenticate user."
        });
    })(req, res, next);
  },
  verifyJWT: (req, res, next) => {
    let token = req.headers.token;
    if (token) {
      jsonWebToken.verify(token, "secret_encoding_passphrase", (errors, payload) => {
        if (payload) {
          User.findById(payload.data).then(user => {
            if (user) {
              next();
            } else {
              res.status(httpStatus.FORBIDDEN).json({
                error: true,
                message: "No User account found."
              });
            }
          });
        } else {
          res.status(httpStatus.UNAUTHORIZED).json({
            error: true,
            message: "Cannot verify API token."
          });
          next();
        }
      });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Provide Token"
      });
    }
  },
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error."
      };
    }
    res.json(errorObject);
  },
}