"use strict";

const Beehive = require("../models/beehives");

module.exports = {
    index: (req, res, next) => {
      Beehive.find({})
        .then(beehives => {
          res.locals.beehives = beehives;
          next();
        })
        .catch(error => {
          console.log(`Error fetching beehives: ${error.message}`);
          next(error);
        });
    },
    indexView: (req, res) => {
        res.render("beehives/index");
      },

      saveBeehive: (req, res) => {
        let newBeehive = new Beehive({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price
        });
        newBeehive
          .save()
          .then(result => {
            res.render("New Beehive!");
          })
          .catch(error => {
            if (error) res.send(error);
          });
      },
      new: (req, res) => {
        res.render("beehives/new");
      },
      create: (req, res, next) => {
        let beehiveParams = {
          HiveID: req.body.HiveID,
          Location: req.body.Location,
          Description: req.body.Description,
          imageURL: req.files.imageURL.name
        };
        Beehive.create(beehiveParams)
          .then(beehive => {
            res.locals.redirect = "/location";
            res.locals.beehive = beehive;
            next();
          })
          .catch(error => {
            console.log(`Error saving beehive: ${error.message}`);
            next(error);
          });
      },
      show: (req, res, next) => {
        let beehiveId = req.params.id;
        Beehive.findById(beehiveId)
          .then(beehive => {
            res.locals.beehive = beehive;
            next();
          })
          .catch(error => {
            console.log(`Error fetching beehive by ID: ${error.message}`);
            next(error);
          });
      },

      showView: (req, res) => {
        res.render("beehives/show");
      },

      edit: (req, res, next) => {
        let beehiveId = req.params.id;
        Beehive.findById(beehiveId)
          .then(beehive => {
            res.render("beehives/edit", {
              beehive: beehive
            });
          })
          .catch(error => {
            console.log(`Error fetching beehive by ID: ${error.message}`);
            next(error);
          });
      },

      update: (req, res, next) => {
        let beehiveId = req.params.id,
          beehiveParams = {
            HiveID: req.body.HiveID,
            Location: req.body.Location,
            Description: req.body.Description,
            imageURL: req.files.imageURL.name
          };
    
        Beehive.findByIdAndUpdate(beehiveId, {
          $set: beehiveParams
        })
          .then(beehive => {
            res.locals.redirect = '/location';
            res.locals.beehive = beehive;
            next();
          })
          .catch(error => {
            console.log(`Error updating beehive by ID: ${error.message}`);
            next(error);
          });
      },
      delete: (req, res, next) => {
        let beehiveId = req.params.id;
        Beehive.findByIdAndRemove(beehiveId)
          .then(() => {
            res.locals.redirect = "/location";
            next();
          })
          .catch(error => {
            console.log(`Error deleting beehives by ID: ${error.message}`);
            next();
          });
      },

      redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath !== undefined) res.redirect(redirectPath);
        else next();
      },

      showAllLocations: (req, res, next) => {
        Beehive.find({}).then((beehives) => {
            res.render("location", {beehives: beehives});
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