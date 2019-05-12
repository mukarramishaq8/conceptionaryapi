/**
 * AuthorOnAuthor Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('AuthorOnAuthor', {
        observation: { type: Sequelize.STRING, allowNull: true },
        citation: { type: Sequelize.STRING, allowNull: true },
        longObservation: { type: Sequelize.TEXT, allowNull: true },
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'authors_on_authors',
            timestamps: false,
            underscored: true
        }
    );
}