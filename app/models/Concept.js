/**
 * Concept Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Concept', {
        name: {type: Sequelize.STRING, allowNull: false},
        picture_link: {type: Sequelize.STRING, allowNull: true}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'concepts',
        timestamps: false,
    });
}