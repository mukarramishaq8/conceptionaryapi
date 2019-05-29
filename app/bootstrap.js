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
db.AuthorCluster = require('./models/AuthorCluster')(sequelize, Sequelize);
db.AuthorGroups = require('./models/AuthorGroups')(sequelize, Sequelize);
db.Keyword = require('./models/Keyword')(sequelize, Sequelize);
db.Tone = require('./models/Tone')(sequelize, Sequelize);
db.ConceptCluster = require('./models/ConceptCluster')(sequelize, Sequelize);

/***  Set Relationships  ***/
db.Concept.hasMany(db.Perspective);
db.Perspective.belongsTo(db.Concept);
db.Perspective.belongsTo(db.Author);
db.Author.hasMany(db.Perspective);

// db.AuthorGroups.hasMany()

db.Perspective.belongsToMany(db.Keyword, { through: 'perspectives_keywords', timestamps: false, foreignKey: 'perspective_id', otherKey: 'keyword_id' });

db.Author.belongsToMany(db.AuthorGroups, {through:'authors_author_groups',timestamps:false,foreignKey:'author_id',otherKey:'author_group_id'});
// db.AuthorGroups.belongsTo(db.Author, {through:'authors_author_groups',timestamps:false,foreignKey:'author_id',otherKey:'author_group_id'});
// db.AuthorGroups.hasMany(db.Author);

db.Keyword.belongsToMany(db.Perspective, { through: 'perspectives_keywords', timestamps: false, foreignKey: 'keyword_id', otherKey: 'perspective_id' });
db.Perspective.belongsToMany(db.Tone, { through: 'perspectives_tones', timestamps: false, foreignKey: 'perspective_id', otherKey: 'tone_id' });
db.Tone.belongsToMany(db.Perspective, { through: 'perspectives_tones', timestamps: false, foreignKey: 'tone_id', otherKey: 'perspective_id' });

db.Concept.belongsToMany(db.ConceptCluster, { through: 'concepts_concept_clusters', timestamps: false, foreignKey: 'concept_id', otherKey: 'concept_cluster_id' });
db.ConceptCluster.belongsToMany(db.Concept, { through: 'concepts_concept_clusters', timestamps: false, foreignKey: 'concept_cluster_id', otherKey: 'concept_id' });

//export db object
module.exports = db;