const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    product: {
      title: '',
      imageUrl: '',
      price: '',
      description: ''
    },
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('errors.Array()', errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  const product = new Product(
    {
      title, 
      price, 
      description, 
      imageUrl, 
      // we pass whole user object, but mongoose will pick only _id of user!
      userId: req.user
    }
    );
   
  product.save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err, 'err'));

 
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      console.log('Edit from admin: ', product);
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validaTionErrors: [],
      });
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      
    });
  }

  console.log('Does it ATLEAST PASS I|T?');
  console.log('req.body: ', req.body);
  console.log('FIND BY ID OF: ', prodId);

    Product.findById(prodId)
      .then(product => {
        // Ensure that only user who created product is deleting it
        if(product.userId.toString() !== req.user._id.toString()) {
          console.log('=======>> Forbidden Actions detected!!! <<=======');
          return res.redirect('/login');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save()
          .then(updtProduct => {
            console.log('Updated product', updtProduct)
            res.redirect('/admin/products')
          })
      })
      .catch(err => console.warn('ERROR WHILE SEARCHING A PRODUCT', err))

  // const updatedProduct = new Product(
  //   prodId,
  //   updatedTitle,
  //   updatedImageUrl,
  //   updatedDesc,
  //   updatedPrice
  // );
  // updatedProduct.save();
 
};

exports.getProducts = (req, res, next) => {
  // Find only products that were created by currently logged in user
  Product.find({userId: req.user._id})
  // selects only certain fields from fetched object and excludes named ones
    // .select('title price -_id')
  // this function will fill userId with whole user object instead of simply id
  // check console without this method and see difference between
    // .populate('userId', 'name')
    .then(products => {
      console.log('ALL products populated', products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',

      })
    })
    .catch(err => console.warn('err', err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.warn('err', err));
  };