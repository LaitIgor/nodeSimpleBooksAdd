const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
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
  // ALternative with findAll
  // Product.findAll({where: {id: prodId}})
  // .then(res => console.log('FIND ALL PLEASE', res[0]))
  // .catch(err => console.log(err))
  // Find single
  Product.findByPk(prodId)
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
  Product.findAll()
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
  console.log(req.user.cart);
  req.user.getCart()
    .then((cart) => {
      return cart
            .getProducts()
            .then(products => {
                    res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products
                  });
            })
            .catch(err => console.log('THere is an error: ', err))
    })
    .catch(err => console.log('THere is an error: ', err) )
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products.at(0);
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return Product.findByPk(prodId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, { 
        through: {quantity: newQuantity} 
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where: {id: prodId}});
    })
    .then(products => {
      const product = products.at(0);
      product.cartItem.destroy();
    })
    .then(result => {
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
  let fetchedCart;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user.createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            product.orderItem = {quantity: product.cartItem.quantity};
            return product;
          }))
        })
        .catch(err => console.log('THere is an error: ', err))
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log('THere is an error: ', err))
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
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
