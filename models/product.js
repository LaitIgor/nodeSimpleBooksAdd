const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

module.exports = mongoose.model('Product', productSchema);


// const getDb = require('../util/database').getDb;
// const { ObjectId } = require('mongodb');

// class Product {
//   constructor(title, price, description, imageUrl, id, userdId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userdId = userdId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     console.log('Save!');
//     if (this._id) {
//       console.log('IF!');
//       // Edit
//       // find element and replace  or $set to this, means replace all fields to current ones
//       dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this})
//     } else {
//       console.log('ELSE');
//       dbOp = db.collection('products').insertOne(this)
//     }
//     // Database
    
//     // Collection
//     return dbOp
//         .then((result) => {
//             console.log(result);
//           })
//           .catch(err => console.log('err', err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products').find().toArray()
//           .then((products) => {
//             return products
//           })
//           .catch(err => console.log('err', err));
//   }

//   static findById(id) {
//     console.log('Finding by id which is: ', id);
//     const db = getDb();
//     return db.collection('products').find({_id: new ObjectId(id)}).next()
//     // Or like this
//     // return db.collection('products').findOne({_id: new ObjectId(id)})
//           .then((product) => {
//             console.log('products', product);
//             return product
//           })
//           .catch(err => console.log('err', err));
//   }

//   static deleteById(id) {
//     const db = getDb();
//     console.log('Entered delete with this id: ', id);
//     return db.collection('products').deleteOne({_id: new ObjectId(id)})
//           .then(() => {
//             console.log('Deleted');
//           })
//           .catch(err => console.log('err', err))
//   }
// }

// // const Product = sequelize.define('product', {
// //   id: {
// //     type: DataTypes.INTEGER,
// //     autoIncrement: true,
// //     allowNull: false,
// //     primaryKey: true
// //   }, 
// //   title: DataTypes.STRING,
// //   price: {
// //     type: DataTypes.DOUBLE,
// //     allowNull: false,
// //   },
// //   imageUrl: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   },
// //   description: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   }
// // });

// module.exports = Product;

// // const db = require('../util/database');

// // const Cart = require('./cart');

// // module.exports = class Product {
// //   constructor(id, title, imageUrl, description, price) {
// //     this.id = id;
// //     this.title = title;
// //     this.imageUrl = imageUrl;
// //     this.description = description;
// //     this.price = price;
// //   }

// //   save() {
// //     return db.execute(
// //       'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
// //     [this.title, this.price, this.imageUrl, this.description]);
// //   }

// //   static deleteById(id) {
    

// //   }

// //   static fetchAll() {
// //     return db.execute('SELECT * FROM products')
// //   }

// //   static findById(id) {
// //     return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
// //   }
   
// // };
