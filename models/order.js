"use strict";

const mongoose = require("mongoose");

// Schema for an order item
// No explicit model is created using this schema
// Instead, it is used as a type in the orderSchema
const orderItemSchema = new mongoose.Schema({

    // Explicitly define the _id property, since we will pass in the existing ID of the course
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Course cannot have a negative price"]
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

// Virtual attribute for extended price (price * quantity)
orderItemSchema.virtual("extendedPrice").get(function () {
    return this.price * this.quantity;
});

// Instance method to update quantity
orderItemSchema.methods.updateQuantity = function(newQuantity) {
    this.quantity = newQuantity;
}

// Schema for an order
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    date: {
        type: Date,
        default: new Date(),
        required: true
    },
    
    // items is an array objects that conform to the orderItemSchema defined above
    items: [{
        type: orderItemSchema,
        required: true
    }],
    paid: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String
    },
    paymentDate: {
        type: Date
    }

});

// Order total
orderSchema.virtual("total").get(function () {
    let total = 0;
    this.items.forEach(item => {
        total += item.extendedPrice;
    });
    return total;
});

// Find an item in the items array
orderSchema.methods.findItem = function (id) {
    let order = this;
    let item = null;
    item = order.items.find(item => item._id === id);
    return item;
};

// Add a new item (or increment quantity by one if the item already exists)
orderSchema.methods.addItem = function (item) {
    let order = this;
    let existingItem = order.findItem(item._id);
    if (existingItem) {
        // If item is already in cart, increment item quantity by one
        existingItem.updateQuantity(existingItem.quantity + 1);
    } else {
        // Add new item
        order.items.push(item);
    }
};

// Update the quantity of an item
orderSchema.methods.updateItemQuantity = function (id, quantity) {
    let order = this;
    let itemToUpdate = order.findItem(id);
    if (itemToUpdate) {
        itemToUpdate.updateQuantity(quantity);
    }
};

// Remove an item
orderSchema.methods.removeItem = function (id) {
    let order = this;
    order.items = order.items.filter(item => item._id !== id);
}

module.exports = mongoose.model("Order", orderSchema, "orders");