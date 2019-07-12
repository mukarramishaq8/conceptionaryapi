const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const { mapObject } = require('../utils');
const { searchAllAuthorsByLabel, searchAllConceptClustersByLabel, searchAllConceptsByLabel, searchAllAuthorClustersByLabel, searchAllAuthorGroupsByLabel } = require('../querie-methods');
const _ = require('underscore');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const AuthorGroups = db.AuthorGroups;
const ConceptCluster = db.ConceptCluster;
const AuthorCluster = db.AuthorCluster;


let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let conceptClusterColor = "#FF0000";
let authorClusterColor = "#0000FF";
let authorGroupColor = '#33FF57';

module.exports.index = async function (req, res, next) {
    let DataToQuery = []
    try {
        let result;
        let authors = await searchAllAuthorsByLabel(req.params.label);
        result = await mapObject("Authors", authors[0]);
        DataToQuery.push(...result);
        let Concepts = await searchAllConceptsByLabel(req.params.label);
        result = await mapObject("Concepts", Concepts)
        DataToQuery.push(...result);

        let conceptClusters = await searchAllConceptClustersByLabel(req.params.label);
        result = await mapObject("Concept-Cluster", conceptClusters);
        DataToQuery.push(...result);

        let authorClusters = await searchAllAuthorClustersByLabel(req.params.label);
        result = await mapObject("Author-Clusters", authorClusters);
        DataToQuery.push(...result);
        let authorGroups = await searchAllAuthorGroupsByLabel(req.params.label);
        result = await mapObject("Author-Groups", authorGroups);
        DataToQuery.push(...result);
    } catch (err) {
        console.log(err);
    }
    finally {
        DataToQuery.sort((a, b) =>
            a["label"].length - b["label"].length
        );
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data: DataToQuery.slice(0, 10)
        })
    }
}

// module.exports.getIdByName = (req, res, next) => {
//     let name = req.params.name;
//     Concept.find({
//         where: {
//             name: name
//         }
//     }).then(concept => {
//         res.json(concept);
//     })
//         .catch((err) => {
//             res.json({ errn });
//         }
//         );
// }