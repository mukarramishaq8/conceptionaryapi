/**
 * BookDescription Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('BookDescription', {
        description: { type: Sequelize.STRING, allowNull: true },
        source: { type: Sequelize.STRING, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'book_descriptions',
            timestamps: false,
            underscored: true
        }
    );
}