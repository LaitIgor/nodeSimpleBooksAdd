const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    console.log("In Product route");
    // // Old way before rootDir
    // res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'))
    // Rendering static html method
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    // Rendering dinamic html
    res.render(
        'admin/add-product', 
        {
            pageTitle: 'Add product', 
            path: '/admin/add-product',
            activeAddProduct: true,
            formsCSS: true,
            productCSS: true,
        });
    };

    exports.postAddProduct = (req, res, next) => {
        const title = req.body.title;
        const imageUrl = req.body.imageUrl;
        const price = req.body.price;
        const description = req.body.description;

        const product = new Product(title, imageUrl, price, description);
        product.save();
        res.redirect('/');
    }

    exports.getProducts = (req, res, next) => {
        Product.fetchAll(products => {
            res.render(
                'admin/products', 
                {
                    prods: products, 
                    pageTitle: 'Admin products', 
                    path: '/admin/products', 
                });
        });
    }