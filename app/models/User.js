/**
 * User Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('User', {
        username: {type: Sequelize.STRING, allowNull: false},
        password: {type: Sequelize.STRING, allowNull: false}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'users',
        timestamps: false,
        underscored: true
    });
}