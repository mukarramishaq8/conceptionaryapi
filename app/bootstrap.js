const Sequelize = require('sequelize');
const dbConfigs = require('./../config/db');
const sequelize = new Sequelize(dbConfigs.database, dbConfigs.username, dbConfigs.password, {
    host: dbConfigs.hostname,
    dialect: dbConfigs.dialect,
    pool: {
        max: dbConfigs.pool.max,
        min: dbConfigs.pool.min,
        acquire: dbConfigs.pool.acquire,
        idle: dbConfigs.pool.idle,
    }
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/***  Initialize Models  ***/
db.Concept = require('./models/Concept')(sequelize, Sequelize);

//export db object
module.exports = db;