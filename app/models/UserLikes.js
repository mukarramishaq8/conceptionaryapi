// user likes table

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('UserLike', {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        perspectiveId: { type: Sequelize.INTEGER, allowNull: false },
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'user_likes',
            timestamps: false,
            underscored: true
        });
}