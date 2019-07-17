/**
 * Perspective Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Perspective', {
        pronoun: { type: Sequelize.STRING, allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: false },
        longDescription: { type: Sequelize.TEXT, allowNull: false },
        citation: { type: Sequelize.TEXT, allowNull: true },
        loves: { type: Sequelize.INTEGER, allowNull: true },
        concept_id: { type: Sequelize.INTEGER, allowNull: true },
        author_id: { type: Sequelize.INTEGER, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'perspectives',
            timestamps: false,
            underscored: true
        });
}