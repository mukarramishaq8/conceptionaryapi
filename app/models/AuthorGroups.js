/**
 * Author Groups Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('AuthorGroups', {
        name: { type: Sequelize.STRING, allowNull: true },
        picture_link: { type: Sequelize.STRING, allowNull: true },
        author_bio_heading_id: { type: Sequelize.INTEGER, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'author_groups',
            timestamps: false,
            underscored: true
        });
}