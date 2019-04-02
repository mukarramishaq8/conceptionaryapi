/**
 * Author Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Author', {
        firstName: {type: Sequelize.STRING, allowNull: true},
        lastName: {type: Sequelize.STRING, allowNull: false},
        dob: {type: Sequelize.STRING, allowNull: true},
        dod: {type: Sequelize.STRING, allowNull: true},
        gender: {type: Sequelize.STRING, allowNull: true},
        pictureLink: {type: Sequelize.STRING, allowNull: true}
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'authors',
        timestamps: false,
        underscored: true
    });
}