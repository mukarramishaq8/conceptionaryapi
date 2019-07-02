/**
 * AuthorGroup Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('AuthorGroup', {
        name: { type: Sequelize.STRING, allowNull: true },
        pictureLink: { type: Sequelize.STRING, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'author_groups',
            timestamps: false,
            underscored: true
        });
}