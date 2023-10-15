const mongoose = require('mongoose');
const Product = require('../models/product');
const fileHelper = require('../util/file');
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
  const image = req.file;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description
      },
      errorMessage: 'Attached file is not and image',
    });
  }

  if (!errors.isEmpty()) {
    console.log('errors.Array()', errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description
      },
      errorMessage: 'Attached file is not an image.',
    });
  }

  const imageUrl = image.path;

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
      console.log('Product created!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err, 'err')
      // return res.status(500).render('admin/add-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title,
      //     imageUrl,
      //     price,
      //     description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      // });
      // res.redirect('/500')
      const error = new Error('Creating a produc failed', {cause: 'Cause of an error'})
      error.httpStatusCode = 500;
      return next(error);
    });

 
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
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
    .catch(err => {
      const error = new Error('Creating a produc failed', {cause: 'Cause - editing failed'})
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
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
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      
    });
  }

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
        if (image) {
          fileHelper.deleteFile(product.imageUrl);
          product.imageUrl = image.path;
        }
        return product.save()
          .then(updtProduct => {
            console.log('Updated product', updtProduct)
            res.redirect('/admin/products')
          })
      })
      .catch(err => {
        console.warn('ERROR WHILE SEARCHING A PRODUCT', err)
        const error = new Error('Error')
        error.httpStatusCode = 500;
        return next(error);
      })

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
    .catch(err => {
      console.warn('err', err);
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      fileHelper(product.imageUrl);
      return Product.deleteOne({_id: prodId, userId: req.user._id})
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error('Error')
      error.httpStatusCode = 500;
      return next(error);
    })
  };