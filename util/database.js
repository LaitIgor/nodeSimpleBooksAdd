const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('new_schema_igor', 'root', 'Qwe123rt45!', {
    dialect: 'mysql', 
    host: 'localhost'
    }
);

module.exports = sequelize;