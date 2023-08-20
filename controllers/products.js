const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    console.log("In Product route");
    // // Old way before rootDir
    // res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'))
    // Rendering static html method
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    // Rendering dinamic html
    res.render(
        'add-product', 
        {
            pageTitle: 'Add product', 
            path: '/admin/add-product',
            activeAddProduct: true,
            formsCSS: true,
            productCSS: true,
        });
    };

    exports.postAddProduct = (req, res, next) => {
        const product = new Product(req.body.title);
        product.save();
        res.redirect('/');
    }

    exports.getProducts = (req, res, next) => {
        // Old way before rootDir
        // res.sendFile(path.join(__dirname, '..', 'views', 'shop.html'));
        // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
        // This command use default template engine which we defined in app.js
        Product.fetchAll(products => {
            res.render(
                'shop', 
                {
                    prods: products, 
                    pageTitle: 'Shop', 
                    path: '/', 
                    hasProducts: products.length > 0,
                    activeShop: true,
                    productCSS: true,
                });
        });




    };