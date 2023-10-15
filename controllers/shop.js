const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // console.log('products', products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => {
      console.log('There was an error: ', err)
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      console.log('GETCART and products', products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => {
      console.log('There was an error: ', err)
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log('There was an error: ', err)
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    // .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log('There was an error: ', err)
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => {
      console.log('There was an error: ', err)
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  // Make sure that authorized person is the one who owns this order
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order is Found.'));
      }
      console.log('Should get atleast here');
      if (order.user.userId.toString() !== req.user._id.toString()) {
        console.log('Not equal');
        return next(new Error('Unauthorized'));
      }
      console.log('PASSED!');
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      // Instead of returning existing, we create new PDF 
      // using pdfkit package
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      })
      pdfDoc.text('________________')
      let totalPrice = 0;
      order.products.forEach(prod => {
        console.log(44444);
        totalPrice += prod.quantity * prod.product.price
        console.log(55555);
        pdfDoc.fontSize(14).text(
          prod.product.title + 
          ' - ' + 
          prod.quantity + 
          ' x ' + 
          ' $ ' +  
          prod.product.price
          )
      })
      pdfDoc.text('------')
      pdfDoc.fontSize(20).text('Total price: $' + totalPrice)

      pdfDoc.end();


      // fs.readFile before sendin open and read whole file
      // wich is very memory consuming. we should avoid it
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      //   res.send(data);
      // })
      // it does not preload file, just keep streaming it directly
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      // file.pipe(res);


    })
    .catch(err => {
      const error = new Error('Access restricted')
      error.httpStatusCode = 500;
      return next(error);
    })
}