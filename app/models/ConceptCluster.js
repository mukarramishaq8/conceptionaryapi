/**
 * ConceptCluster Model
 */
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('ConceptCluster', {
        name: { type: Sequelize.STRING, allowNull: false },
        type: { type: Sequelize.STRING, allowNull: true },
        pictureLink: { type: Sequelize.STRING, allowNull: true }
    }, {
            sequelize,
            freezeTableName: true,
            tableName: 'concept_clusters',
            timestamps: false,
            underscored: true
        });
}