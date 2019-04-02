/**
 * Perspective Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Perspective', {
        pronoun: {type: Sequelize.STRING, allowNull: true},
        description: {type: Sequelize.TEXT, allowNull: true},
        longDescription: {type: Sequelize.TEXT, allowNull: true},
        citation: {type: Sequelize.TEXT, allowNull: true},
        loves: {type: Sequelize.INTEGER, allowNull: true}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'perspectives',
        timestamps: false,
        underscored: true
    });
}