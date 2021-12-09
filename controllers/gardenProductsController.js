"use strict";

const gardenProduct = require("../models/gardenProducts");

module.exports = {
    index: (req, res, next) => {
      gardenProduct.find({})
        .then(gardenProducts => {
          res.locals.gardenProducts = gardenProducts;
          next();
        })
        .catch(error => {
          console.log(`Error fetching products: ${error.message}`);
          next(error);
        });
    },
    indexView: (req, res) => {
        res.render("gardenProducts/index");
      },

      saveProduct: (req, res) => {
        let newGardenProduct = new gardenProduct({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price          
        });
        newGardenProduct
          .save()
          .then(result => {
            res.render("thanks");
          })
          .catch(error => {
            if (error) res.send(error);
          });
      },
      new: (req, res) => {
        res.render("gardenProducts/new");
      },
      create: (req, res, next) => {
        let gardenProductParams = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          imageURL: req.files.imageURL.name
        };
        gardenProduct.create(gardenProductParams)
          .then(gardenProduct => {
            res.locals.redirect = "/gardenProducts";
            res.locals.gardenProduct = gardenProduct;
            next();
          })
          .catch(error => {
            console.log(`Error saving product: ${error.message}`);
            next(error);
          });
      },
      show: (req, res, next) => {
        let gardenProductId = req.params.id;
        gardenProduct.findById(gardenProductId)
          .then(gardenProduct => {
            res.locals.gardenProduct = gardenProduct;
            next();
          })
          .catch(error => {
            console.log(`Error fetching product by ID: ${error.message}`);
            next(error);
          });
      },

      showView: (req, res) => {
        res.render("gardenProducts/show");
      },

      edit: (req, res, next) => {
        let gardenProductId = req.params.id;
        gardenProduct.findById(productId)
          .then(product => {
            res.render("gardenProducts/edit", {
              gardenProduct: gardenProduct
            });
          })
          .catch(error => {
            console.log(`Error fetching product by ID: ${error.message}`);
            next(error);
          });
      },

      update: (req, res, next) => {
        let gardenProductId = req.params.id,
          gardenProductParams = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            imageURL: req.files.imageURL.name
          };
    
        gardenProduct.findByIdAndUpdate(gardenProductId, {
          $set: gardenProductParams
        })
          .then(gardenProduct => {
            res.locals.redirect = `/gardenProducts/${gardenProductId}`;
            res.locals.gardenProduct = gardenProduct;
            next();
          })
          .catch(error => {
            console.log(`Error updating product by ID: ${error.message}`);
            next(error);
          });
      },
      delete: (req, res, next) => {
        let gardenProductId = req.params.id;
        gardenProduct.findByIdAndRemove(gardenProductId)
          .then(() => {
            res.locals.redirect = "/gardenProducts";
            next();
          })
          .catch(error => {
            console.log(`Error deleting products by ID: ${error.message}`);
            next();
          });
      },

      showAllProducts: (req, res, next) => {
        gardenProduct.find({}).then((gardenProducts) => {
            res.render("gardenProducts", {gardenProducts: gardenProducts});
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

     addToCart: (req, res, next) => {

      //Check to see if item already exists in cart.  If so, upate quantity by one.
    // Otherwise, add item to shopping cart
    let item = req.cart.get(req.body.id);
    console.log("item:", item);
    if (item.length > 0) {
      req.cart.update(req.body.id, { quantity: item[0].quantity + 1 });
    } else {
      // Add new item to shopping cart
      req.cart.add({
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        quantity: 1
      });
     }

     console.log(req.cart.content());
     res.redirect("/courses");
  },
  viewCart: (req, res, next) => {
    res.json(req.cart.content());
  }


};