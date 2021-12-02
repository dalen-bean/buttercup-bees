"use strict";

const Garden = require("../models/gardens");

module.exports = {
    index: (req, res, next) => {
      Garden.find({})
        .then(gardens => {
          res.locals.gardens = gardens;
          next();
        })
        .catch(error => {
          console.log(`Error fetching gardens: ${error.message}`);
          next(error);
        });
    },
    indexView: (req, res) => {
        res.render("gardens/index");
      },

      saveGarden: (req, res) => {
        let newGarden = new Garden({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price
        });
        newGarden
          .save()
          .then(result => {
            res.render("New Garden!");
          })
          .catch(error => {
            if (error) res.send(error);
          });
      },
      new: (req, res) => {
        res.render("gardens/new");
      },
      create: (req, res, next) => {
        let gardenParams = {
          GardenID: req.body.GardenID,
          Location: req.body.Location,
          Description: req.body.Description,
          imageURL: req.files.imageURL.name
        };
        Garden.create(gardenParams)
          .then(garden => {
            res.locals.redirect = "/gardens";
            res.locals.garden = garden;
            next();
          })
          .catch(error => {
            console.log(`Error saving garden: ${error.message}`);
            next(error);
          });
      },
      show: (req, res, next) => {
        let gardenId = req.params.id;
        Garden.findById(gardenId)
          .then(garden => {
            res.locals.garden = garden;
            next();
          })
          .catch(error => {
            console.log(`Error fetching garden by ID: ${error.message}`);
            next(error);
          });
      },

      showView: (req, res) => {
        res.render("gardens/show");
      },

      edit: (req, res, next) => {
        let gardenId = req.params.id;
        Garden.findById(gardenId)
          .then(garden => {
            res.render("gardens/edit", {
              garden: garden
            });
          })
          .catch(error => {
            console.log(`Error fetching garden by ID: ${error.message}`);
            next(error);
          });
      },

      update: (req, res, next) => {
        let gardenId = req.params.id,
          gardenParams = {
            GardenID: req.body.GardenID,
            Location: req.body.Location,
            Description: req.body.Description,
            imageURL: req.files.imageURL.name
          };
    
        Garden.findByIdAndUpdate(gardenId, {
          $set: gardenParams
        })
          .then(garden => {
            res.locals.redirect = '/gardens';
            res.locals.garden = garden;
            next();
          })
          .catch(error => {
            console.log(`Error updating garden by ID: ${error.message}`);
            next(error);
          });
      },
      delete: (req, res, next) => {
        let gardenId = req.params.id;
        Garden.findByIdAndRemove(gardenId)
          .then(() => {
            res.locals.redirect = "/gardens";
            next();
          })
          .catch(error => {
            console.log(`Error deleting gardens by ID: ${error.message}`);
            next();
          });
      },

      redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath !== undefined) res.redirect(redirectPath);
        else next();
      },

      showAllLocations: (req, res, next) => {
        Garden.find({}).then((gardens) => {
            res.render("gardens", {gardens: gardens});
        }).catch((err) => {
            next(err);
        })
      },

      upload : (req, res, next) => {
        let imageUrl;
        let uploadPath;
        let back_one
      
        if (!req.files || Object.keys(req.files).length === 0) {
          return res.status(400).send('No files were uploaded.');
        }
      
        imageUrl = req.files.imageURL;
        back_one = __dirname.slice(0,-11); // I couldn't figure out how to remove /controllers from __dirname so this was my solution
        uploadPath = back_one + '/public/images/' + imageUrl.name;
        imageUrl.mv(uploadPath, function(err) {
          if (err)
            return res.status(500).send(err);
        });
        next();
    },
};