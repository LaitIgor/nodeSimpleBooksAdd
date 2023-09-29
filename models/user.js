const getDb = require('../util/database').getDb;
const { ObjectId } = require('mongodb');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart // {items: []}
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
    }

    addToCart(product) {
        const cartProductIndx = this.cart.items.findIndex(p => {
            return p.productId.toString() === product._id.toString()
        });

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndx >=0) {
            newQuantity = this.cart.items[cartProductIndx].quantity + 1;
            updatedCartItems[cartProductIndx].quantity = newQuantity;
        } else {
            updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
        }
        
        const updatedCart = {
            items: updatedCartItems
        };

        const db = getDb();
        return db
                .collection('users')
                .updateOne({
                    _id: new ObjectId(this._id)}, 
                    {$set: {cart: updatedCart}}
                )

    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => item.productId)
        return db.collection('products').find({_id: {$in: productIds}}).toArray()
                .then(products => {
                    return products.map(p => {
                        return {
                            ...p, 
                            quantity: this.cart.items.find(i => {
                            return i.productId.toString() == p._id.toString();
                            }).quantity
                        }
                    })
                })
                .catch(err => console.log('error is: ', err));
    }

    deleteItemFromCart(prodId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== prodId.toString()
        })

        const db = getDb();
        return db
                .collection('users')
                .updateOne({
                    _id: new ObjectId(this._id)}, 
                    {$set: {cart: {items: updatedCartItems}}}
                )


    }

    addOrder() {
        const db = getDb();
        return this.getCart()
                .then((products) => {
                    const order = {
                        items: products,
                        user: {
                            _id: new ObjectId(this._id),
                            name: this.name,
                            email: this.email,
                        }
                    }

                    return db.collection('orders').insertOne(order)
                })
                .then(result => {
                    this.cart = {items: []}
                    return db
                    .collection('users')
                    .updateOne({
                        _id: new ObjectId(this._id)}, 
                        {$set: {cart: {items: []}}}
                    )
                })
                .catch(err => console.log('error is: ', err))
    }

    getOrders() {
        const db = getDb();
        return db
                .collection('orders')
                .find({'user._id': new ObjectId(this._id)})
                .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({_id: new ObjectId(userId)})
                .then(user => {
                    return user;
                })
                .catch(err => console.log('error is: ', err));
    }


}

module.exports = User;