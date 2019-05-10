/**
 * AuthorBioHeading Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('AuthorBioHeading', {
        name: {type: Sequelize.STRING, allowNull: true},
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'author_bio_headings',
        timestamps: false,
        underscored: true
    });
}