const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Registering handlebars  = any key, engine
// const expressHds = require('express-handlebars');
// app.engine(
//     'hbs', 
//     expressHds(
//         {
//             layoutsDir: 'views/layouts/', 
//             defaultLayout: 'main-layout', 
//             extname: 'hbs'
//         }));
// app.set('view engine', 'hbs');

// Set global value
app.set('view engine', 'ejs');
// set directory where all our views located (2nd parameter)
// but this exact keys are default, so it not required to explicitly put it here
app.set('views', 'views')

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const notFound = require('./routes/not-found');

app.use(bodyParser.urlencoded({ extended: false }));
// Import static files like styles
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(notFound);

app.listen(3000);