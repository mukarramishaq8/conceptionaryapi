const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
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


module.exports.index = function (req, res, next) {
    let DataToQuery = []

    db.sequelize.query(`SELECT * FROM authors WHERE (CONCAT(first_name, ' ', last_name)) LIKE '${req.params.label}%' OR (CONCAT(first_name, ' ', last_name)) LIKE '% ${req.params.label}%' ORDER BY length(CONCAT(first_name, ' ', last_name))`
        //where: Sequelize.where(Sequelize.fn("concat", Sequelize.col("first_name")," ",Sequelize.col("last_name")),'Evan Abba'),
        /* where: {
             [Sequelize.Op.or]: [{
                 firstName: {
                     [Sequelize.Op.like]: req.params.label + '%'
                 }
             }, {
                 lastName: {
                     [Sequelize.Op.like]: req.params.label + '%'
                 },
                 firstName: {
                     [Sequelize.Op.like]: '% ' + req.params.label + '%'
                 }
             }, {
                 lastName: {
                     [Sequelize.Op.like]: '% ' + req.params.label + '%'
                 }
             }]
         },*/
        //limit: 10
    ).
        then(data => {
            data = data[0]
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.first_name + " " + author.last_name;
                objectMapping.value = author.first_name + " " + author.last_name;
                objectMapping.id = author.id;
                objectMapping.category = "Authors";
                objectMapping.color = authorColor;
                DataToQuery.push(objectMapping);
            });

        }).then(x => {
            Concept.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        {
                            name: {
                                [Sequelize.Op.like]: req.params.label + '%'
                            }
                        },
                        {
                            name: {
                                [Sequelize.Op.like]: '% ' + req.params.label + '%'
                            }
                        }
                    ]


                },
                order: [
                    [Sequelize.fn('length', Sequelize.col('name'))]
                ],

                limit: 10
            }).
                then(data => {

                    data.forEach(concept => {
                        objectMapping = {};
                        objectMapping.label = concept.name;
                        objectMapping.value = concept.name;
                        objectMapping.id = concept.id;
                        objectMapping.category = "Concepts";
                        objectMapping.color = conceptColor;

                        DataToQuery.push(objectMapping);
                    });



                }).then(x => {
                    ConceptCluster.findAll({
                        where: {
                            [Sequelize.Op.or]: [
                                {
                                    name: {
                                        [Sequelize.Op.like]: req.params.label + '%'
                                    }
                                },
                                {
                                    name: {
                                        [Sequelize.Op.like]: '% ' + req.params.label + '%'
                                    }
                                }
                            ]

                        },
                        order: [Sequelize.fn('length', Sequelize.col('name'))],
                        limit: 10
                    }).
                        then(data => {

                            data.forEach(concept => {
                                objectMapping = {};
                                objectMapping.label = concept.name + "|Concept Cluster";
                                objectMapping.value = concept.name;
                                objectMapping.id = concept.id;
                                objectMapping.category = "Concept-Clusters";
                                objectMapping.color = conceptClusterColor;

                                DataToQuery.push(objectMapping);
                            });

                        }).then(x => {
                            AuthorCluster.findAll({

                                where: {
                                    [Sequelize.Op.or]: [
                                        {
                                            name: {
                                                [Sequelize.Op.like]: req.params.label + '%'
                                            }
                                        },
                                        {
                                            name: {
                                                [Sequelize.Op.like]: '% ' + req.params.label + '%'
                                            }
                                        }
                                    ]

                                },
                                order: [Sequelize.fn('length', Sequelize.col('name'))],
                                limit: 10
                            }).
                                then(data => {

                                    data.forEach(author => {
                                        objectMapping = {};
                                        objectMapping.label = author.name + "|Author Cluster";
                                        objectMapping.value = author.name;
                                        objectMapping.id = author.id;
                                        objectMapping.category = "Author-Clusters";
                                        objectMapping.color = authorClusterColor;
                                        DataToQuery.push(objectMapping);

                                    })
                                }).then(x => {

                                    AuthorGroups.findAll({
                                        where: {

                                            name: {
                                                [Sequelize.Op.like]: req.params.label + '%'
                                            }

                                        },
                                        order: [Sequelize.fn('length', Sequelize.col('name'))],
                                        limit: 10
                                    }).then(data => {
                                        data.forEach(authorGroup => {
                                            objectMapping = {};
                                            objectMapping.label = authorGroup.name + '| Author Group';
                                            objectMapping.value = authorGroup.name;
                                            objectMapping.id = authorGroup.id;
                                            objectMapping.category = 'Author-Groups';
                                            objectMapping.color = authorGroupColor;
                                            DataToQuery.push(objectMapping);
                                        })
                                    }).then(x => {
                                        /* DataToQuery = DataToQuery.map(e => e["id"])
                                         // store the keys of the unique objects
                                         .map((e, i, final) => final.indexOf(e) === i && i)
                                         // eliminate the dead keys & store unique objects
                                         .filter(e => DataToQuery[e]).map(e => DataToQuery[e]);*/

                                        DataToQuery.sort((a, b) =>
                                            a["label"].length - b["label"].length
                                        );
                                        res.status(httpResponse.success.c200.code).json({
                                            responseType: httpResponse.responseTypes.success,
                                            ...httpResponse.success.c200,
                                            data: DataToQuery.slice(0, 10)
                                        })
                                    })
                                })
                        })
                })
        })

};
module.exports.getIdByName = (req, res, next) => {
    let name = req.params.name;
    Concept.find({
        where: {
            name: name
        }
    }).then(concept => {
        res.json(concept);
    })
        .catch((err) => {
            res.json({ errn });
        }
        );
}