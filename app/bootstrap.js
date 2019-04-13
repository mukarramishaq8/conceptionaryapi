const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
        max: parseInt(process.env.SEQ_POOL_MAX),
        min: parseInt(process.env.SEQ_POOL_MIN),
        acquire: parseInt(process.env.SEQ_POOL_ACQUIRE),
        idle: parseInt(process.env.SEQ_POOL_IDLE),
    }
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/***  Initialize Models  ***/
db.Concept = require('./models/Concept')(sequelize, Sequelize);
db.Perspective = require('./models/Perspective')(sequelize, Sequelize);
db.Author = require('./models/Author')(sequelize, Sequelize);

/***  Set Relationships  ***/
db.Concept.hasMany(db.Perspective );
db.Perspective.belongsTo(db.Concept);
db.Perspective.belongsTo(db.Author);
db.Author.hasMany(db.Perspective);

//export db object
module.exports = db;