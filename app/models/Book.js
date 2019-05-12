/**
 * Book Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Book', {
        title: { type: Sequelize.STRING, allowNull: false },
        isbn: { type: Sequelize.STRING, allowNull: true },
        pictureLink: { type: Sequelize.STRING, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'books',
            timestamps: false,
            underscored: true
        }
    );
}