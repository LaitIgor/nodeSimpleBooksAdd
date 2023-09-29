const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      console.log('Prods to render', products[0]);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log('THere was an error while fetching products', err));
};

exports.getProduct = (req, res, next) => {
  console.log('LETS SEEEEE!!!!');
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
  console.log('GET INDEX');
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log('errrrr', err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then((products) => {
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
  req.user.deleteItemFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(orders => {
      console.log('orders======>', orders, '<=========orders');
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your orders',
        orders: orders
      });
    })
    .catch(err => console.log('THere is an error: ', err))

};
