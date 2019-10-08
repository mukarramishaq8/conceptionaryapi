const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const { mapObject } = require('../utils');
const { searchAllAuthorsByLabel, searchAllConceptClustersByLabel, searchAllConceptsByLabel, searchAllAuthorClustersByLabel, searchAllAuthorGroupsByLabel } = require('../querie-methods');
const _ = require('underscore');

const Concept = db.Concept;
const ConceptCluster = db.ConceptCluster;
const Author = db.Author;
const Perspective=db.Perspective;
const AuthorGroups=db.AuthorGroups;
var fs = require('fs');
// const Perspective = db.Perspective;
// const Author = db.Author;
// const AuthorGroups = db.AuthorGroups;
// const ConceptCluster = db.ConceptCluster;
// const AuthorCluster = db.AuthorCluster;


// let objectMapping = {}

// let authorColor = "#A52A2A";
// let conceptColor = "#000000";
// let conceptClusterColor = "#FF0000";
// let authorClusterColor = "#0000FF";
// let authorGroupColor = '#33FF57';



module.exports.updateRouteFile=async function(req,res,next){
    await Concept.findAll({attributes: ['name']}).then(response => {
        let json=`{"concepts":${JSON.stringify(response)}}`
        var jsonObj = JSON.parse(json);
        fs.writeFile('./routes/conceptRoute.txt', JSON.stringify(jsonObj), function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
          
    
    
    
    
    })
    await ConceptCluster.findAll({}).then(response => {
        let array=[];
        response.map(cluster => {
            array.push({name:cluster.name})
        })
        console.log("REsult of Concept Cluster is ",JSON.stringify(array[0]))



    })
    await Author.findAll({}).then(response => {
        let array=[];
        response.map(author => {
            array.push({name:author.firstName+" "+author.lastName})
        })
        console.log("REsult of Author is ",JSON.stringify(array[0]))

    })
    await Perspective.findAll({}).then(response => {
        let array=[];
        response.map(perspective => {
            array.push({name:perspective.id})
        })
        console.log("REsult of  is Perspective ",JSON.stringify(array[0]))


    })
    await AuthorGroups.findAll({}).then(response => {
        let array=[];
        response.map(group => {
            array.push({name:group.name})
        })
        console.log("REsult of Author Group is ",JSON.stringify(array[0]))


    })
    
    
}
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
        result = await mapObject("Concept-Clusters", conceptClusters);
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
