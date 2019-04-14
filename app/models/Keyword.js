/**
 * Keyword Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Keyword', {
        name: {type: Sequelize.STRING, allowNull: false}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'keywords',
        timestamps: false,
        underscored: true
    });
}