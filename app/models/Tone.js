/**
 * Tone Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Tone', {
        name: {type: Sequelize.STRING, allowNull: false}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'tones',
        timestamps: false,
        underscored: true
    });
}