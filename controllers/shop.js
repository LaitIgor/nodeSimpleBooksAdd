const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log('Prods to render', products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log('THere was an error while fetching products', err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log('PRODUCT BY ID', product);
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      console.log('Prods to render in index ', products);
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log('errrrr', err));
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then((user) => {
      console.log('products111', user.cart.items);
        const products = user.cart.items;
        res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log('THere is an error: ', err) )
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product)
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log('There is an error: ', err))
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then((user) => {
      console.log('products111', user.cart.items);
        const products = user.cart.items.map(product => {
          // ._doc retrieves all the data of a product like populate does 
          // instead of just showin id object
          return {quantity: product.quantity, product: {...product.productId._doc}}
        });
        const order = new Order({
          user: {
            name: req.user.name,
            // Again, mongoose will pick id from whiole user object here
            userId: req.user
          },
          products
        });

        return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your orders',
        orders: orders
      });
    })
    .catch(err => console.log('THere is an error: ', err))

};
