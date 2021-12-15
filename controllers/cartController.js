"use strict";
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env")});  // Go up one directory to access the .env file for Stripe API keys
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY); // Pass in Stripe secret API key
const Order = require("../models/order");


module.exports = {

    // Get existing cart out of session and "hydrate" as an instance of the Order model 
    // -- OR -- create a new Order instance if session variable does not exist
    // Make the cart available to other handlers in req.cart
    getCart: (req, res, next) => {
        let cart = req.session.cart ? Order.hydrate(req.session.cart) : new Order();
        req.cart = cart;
        next();
    },

    // Save the req.cart object cart back into the session and redirect to the cart view
    // This will be called after making modifications to the cart
    saveCart: (req, res, next) => {
        req.session.cart = req.cart;
        res.redirect("/cart/view");
    },

    // View the cart, passing in the cart object and Stripe publishable API key as data
    // Render an empty cart view if nothing is in the cart
    viewCart: (req, res, next) => {
        let cart = req.cart;
        // console.log(cart);
        if (cart.items.length > 0) {
            res.render("cart/view", { cart: cart, stripePubKey: process.env.STRIPE_PUB_KEY });
        } else {
            res.render("cart/empty");
        }
    },

    // Add an item to the cart
    addToCart: (req, res, next) => {
        let cart = req.cart;
        let item = {
            _id: req.body._id,
            title: req.body.title,
            price: req.body.price
        };
        cart.addItem(item);
        next();
    },

    // Remove an item from the cart
    removeFromCart: (req, res, next) => {
        let idToRemove = req.params.id;
        let cart = req.cart;
        if (cart.findItem(idToRemove)) {
            cart.removeItem(idToRemove);
        }
        next();
    },

    // Update the quantity of an item in the cart
    updateQuantity: (req, res, next) => {
        let idToUpdate = req.body.id;
        let quantity = parseInt(req.body.quantity);
        let cart = req.cart;
        let itemToUpdate = cart.findItem(idToUpdate);
        if (itemToUpdate && quantity) {
            itemToUpdate.updateQuantity(quantity);
        }
        next();
    },

    // Save the cart to the database as an order
    saveOrder: async (req, res, next) => {
        let userId = req.user._id;
        let cart = req.cart;
        if (cart.items.length > 0) {
            cart.user = userId;

            // Check to see if order already exists in database
            // This could happen if the user clicks checkout and then goes back to edit their order before completing payment
            if (await Order.findById(cart._id)) {
                cart.isNew = false;          // Tell Mongoose that the order already exists
                cart.markModified("items");  // Mark items as modified so that they will be updated when calling save() below
            } else {
                cart.isNew = true; //Tell Mongoose that order is new so save() works properly (since order already has an ID from the hydrate function)
            }

            try {
                let savedOrder = await cart.save();
                res.locals.orderId = savedOrder._id;
                next();
            } catch (error) {
                console.log(error);
                next(error);
            }
        }
    },

    // Initiate a Stripe payment session configured with cart items
    // Send back the payment session id as JSON
    // Client will use this ID to redirect to Stripe
    // See https://stripe.com/docs/checkout/integration-builder
    stripeCheckout: async (req, res) => {
        let cart = req.cart;

        // Generate an array of line items in format required by Stripe API
        let stripeLineItems = [];
        cart.items.forEach(item => {
            stripeLineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title
                    },
                    unit_amount: item.price * 100, // unit_amount is in cents, so multiply $ amount by 100
                },
                quantity: item.quantity,
            })

        });

        // Create the Stripe session with settings
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],  // Credit card payments accepted
            client_reference_id: res.locals.orderId.toString(),  // Store the local orderId on Stripe as a reference
            customer_email: req.user.email,  // Store user email
            line_items: stripeLineItems,  // Order line items
            mode: 'payment',  // One-time payment
            success_url: `${req.headers.origin}/cart/confirm?session_id={CHECKOUT_SESSION_ID}`, // Redirect Url for success.  Pass sessionID in querystring
            cancel_url: `${req.headers.origin}/cart/view`, // Redirect Url for cancel
        });

        // Send back stripe session ID to client
        res.json({ id: stripeSession.id });
    },

    // Confirm that Stripe payment went through and update the order in the database
    confirmPayment: async (req, res, next) => {
        const stripeSession = await stripe.checkout.sessions.retrieve(req.query.session_id);
     
        if (stripeSession.payment_status === "paid") {

            // Save variables for later use
            res.locals.stripeSession = stripeSession.id;
            res.locals.paymentStatus = stripeSession.payment_status;
            res.locals.orderId = stripeSession.client_reference_id;

            try {
                await Order.findByIdAndUpdate(res.locals.orderId, {
                    paid: true,
                    paymentId: stripeSession.id,
                    paymentDate: new Date()
                });
                next();
            } catch (error) {
                next(error);
            }
        }
    },

    // Reset the cart in the session and on res.locals
    resetCart: (req, res, next) => {
        req.session.cart = res.locals.cart = null;
        next();
    },

    // Render the order invoice
    showInvoice: async (req, res, next) => {
        try {
            let order = await Order.findById(res.locals.orderId).populate("user");
            res.render("cart/invoice", { order: order });
        } catch (error) {
            console.log(error);
        }


    },
};