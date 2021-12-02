"use strict";

const Product = require("../models/products");

module.exports = {
    index: (req, res, next) => {
      Product.find({})
        .then(products => {
          res.locals.products = products;
          next();
        })
        .catch(error => {
          console.log(`Error fetching products: ${error.message}`);
          next(error);
        });
    },
    indexView: (req, res) => {
        res.render("products/index");
      },

      saveProduct: (req, res) => {
        let newProduct = new Product({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price          
        });
        newProduct
          .save()
          .then(result => {
            res.render("thanks");
          })
          .catch(error => {
            if (error) res.send(error);
          });
      },
      new: (req, res) => {
        res.render("products/new");
      },
      create: (req, res, next) => {
        let productParams = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          imageURL: req.files.imageURL.name
        };
        Product.create(productParams)
          .then(product => {
            res.locals.redirect = "/products";
            res.locals.product = product;
            next();
          })
          .catch(error => {
            console.log(`Error saving product: ${error.message}`);
            next(error);
          });
      },
      show: (req, res, next) => {
        let productId = req.params.id;
        Product.findById(productId)
          .then(product => {
            res.locals.product = product;
            next();
          })
          .catch(error => {
            console.log(`Error fetching product by ID: ${error.message}`);
            next(error);
          });
      },

      showView: (req, res) => {
        res.render("products/show");
      },

      edit: (req, res, next) => {
        let productId = req.params.id;
        Product.findById(productId)
          .then(product => {
            res.render("products/edit", {
              product: product
            });
          })
          .catch(error => {
            console.log(`Error fetching product by ID: ${error.message}`);
            next(error);
          });
      },

      update: (req, res, next) => {
        let productId = req.params.id,
          productParams = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            imageURL: req.files.imageURL.name
          };
    
        Product.findByIdAndUpdate(productId, {
          $set: productParams
        })
          .then(product => {
            res.locals.redirect = `/products/${productId}`;
            res.locals.product = product;
            next();
          })
          .catch(error => {
            console.log(`Error updating product by ID: ${error.message}`);
            next(error);
          });
      },
      delete: (req, res, next) => {
        let productId = req.params.id;
        Product.findByIdAndRemove(productId)
          .then(() => {
            res.locals.redirect = "/products";
            next();
          })
          .catch(error => {
            console.log(`Error deleting products by ID: ${error.message}`);
            next();
          });
      },

      showAllProducts: (req, res, next) => {
        Product.find({}).then((products) => {
            res.render("products", {products: products});
        }).catch((err) => {
            next(err);
        })
      },

      redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath !== undefined) res.redirect(redirectPath);
        else next();
      },
//I took out the upload function because i couldn't get it to work

      upload : (req, res, next) => {
        let imageUrl;
        let uploadPath;
        let back_one
        
        if (!req.files || Object.keys(req.files).length === 0) {
          return res.status(400).send('No files were uploaded.');
        }

        imageUrl = req.files.imageURL;
        back_one = __dirname.slice(0,-11); // I couldn't figure out how to remove /controllers from __dirname so this was my solution
        console.log(back_one);
        uploadPath = back_one + '/public/images/' + imageUrl.name;
        imageUrl.mv(uploadPath, function(err) {
          if (err)
            return res.status(500).send(err);
        });
        next();
     },


};