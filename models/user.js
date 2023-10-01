const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId, 
                    ref: 'Product',
                    required: true
                }, 
                quantity: {type: Number, require: true}
            }
        ],
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndx = this.cart.items.findIndex(p => {
                    return p.productId.toString() === product._id.toString()
                });
        
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndx >= 0) {
        newQuantity = this.cart.items[cartProductIndx].quantity + 1;
        updatedCartItems[cartProductIndx].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id, 
            quantity: newQuantity
        })
    }
    
    const updatedCart = {
        items: updatedCartItems
    };

    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(prodId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prodId.toString()
    })
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    return this.save();
}

module.exports = mongoose.model('User', userSchema)
