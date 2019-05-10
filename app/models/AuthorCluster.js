/**
 * AuthorCluster Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('AuthorCluster', {
        name: {type: Sequelize.STRING, allowNull: true},
        pictureLink: {type: Sequelize.STRING, allowNull: true}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'author_clusters',
        timestamps: false,
        underscored: true
    });
}