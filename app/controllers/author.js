const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const {getAuthorIds}=require('../Queries');
const chalk = require("chalk");
const _ = require('underscore');
const Perspective = db.Perspective;
const Author = db.Author;
// const AuthorGroups = db.AuthorGroups;
const Concept = db.Concept;
const AuthorBioHeading = db.AuthorBioHeading;
const AuthorGroup = db.AuthorGroups;
const Book = db.Book;
const BookDescription = db.BookDescription;
/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getAuthor = async function (req, res, next) {
    if (req.body.author.groupIds.length > 0 && req.body.author.name) {
        let DataToQuery = [];
        let outerQuery = ``;
        const outerQuery=await getAuthorIds(req.body.author.groupIds);
        db.sequelize.query(`SELECT * FROM authors where id IN (${outerQuery}) AND ( CONCAT(first_name,' ',last_name) = '${req.body.author.name}') ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `)
            .then(data => {
                data[0].forEach(author => {
                    let obj = {};
                    objectMapping = {};
                    objectMapping.label = author.first_name + " " + author.last_name;
                    objectMapping.value = author.first_name + " " + author.last_name;
                    objectMapping.id = author.id;
                    objectMapping.category = "Authors";
                    obj.selectedOption = objectMapping;
                    DataToQuery.push(obj);
                });

            }).then(x => {
                DataToQuery = [...new Set(DataToQuery)];

                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    dobj: DataToQuery[0]
                })
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        if (req.body.author.name) {
            Author.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), {
                            [Sequelize.Op.eq]: req.body.author.name
                        }),
                        Sequelize.where(Sequelize.fn('concat', Sequelize.col('first_name'), ' ', Sequelize.col('last_name')), {
                            [Sequelize.Op.eq]: req.body.author.name
                        })
                    ]
                }
            }).then(data => {
                obj = {};
                objectMapping = {};
                objectMapping.label = data.firstName + " " + data.lastName;
                objectMapping.value = data.firstName + " " + data.lastName;
                objectMapping.id = data.id;
                objectMapping.category = "Authors";
                obj.selectedOption = objectMapping;
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    obj
                })
            }).catch(err => {
                console.log(err);
            })
        } else {
            res.json({ "msg": "query name not found" });
        }
    }
}

module.exports.index = function (req, res, next) {
    Author.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true
            ? undefined
            : serializers.withSelfAssociationsOnly(req.query) !== true
                ? [
                    {
                        model: Perspective, include: [
                            { model: Concept }
                        ]
                    },
                    { model: AuthorGroup, include: { model: AuthorBioHeading } },
                    { model: Book, include: { model: BookDescription } },
                ]
                : [
                    { association: 'AuthorOnAuthors' },
                    { association: 'AuthorConvoAuthors' },
                    { association: 'AuthorInfluenceAuthors' },
                ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data,
        query: req.query
    })).catch(err => {
        console.log(err);
    });
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function (req, res, next) {
    Author.findByPk(req.params.authorId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ?
         undefined: serializers.withSelfAssociationsOnly(req.query) !== true ?
                [
                    {
                        model: Perspective, include: [
                            { model: Concept }
                        ]
                    },
                    { model: AuthorGroup, include: { model: AuthorBioHeading } },
                    { model: Book, include: { model: BookDescription } },
                ]
                : [
                    { association: 'AuthorOnAuthors' },
                    { association: 'AuthorConvoAuthors' },
                    { association: 'AuthorInfluenceAuthors' },
                ]
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
    }).catch(err => {
        console.log(err);
    })
}
/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    Author.create(req.body)
        .then(data => {
            res.status(httpResponse.success.c201.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c201,
                data
            });
        }).catch(next);
}

/**
 * update a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.update = function (req, res, next) {
    Author.findByPk(req.params.authorId)
        .then(author => {
            if (!author) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            author.update(req.body).then(data => {
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data
                });
            });
        }).catch(next);
}

/**
 * delete a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.delete = function (req, res, next) {
    Author.findByPk(req.params.authorId)
        .then(author => {
            if (!author) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            author.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}



let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000";
let conceptClusterColor = "#00FF00";
let authorClusterColor = "#aaa";

module.exports.filter = function (req, res, next) {
    let DataToQuery = [];
    Author.findAll({
        where: {
            [Sequelize.Op.or]: [
                {
                    firstName: { [Sequelize.Op.like]: req.params.label +'%'}
               },
              {
                lastName: { [Sequelize.Op.like]:  req.params.label+'%'}
              }
            ]
        },
        limit: 10
    }).then(data => {
        if (data.length > 0) {

            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.firstName + " " + author.lastName;
                objectMapping.value = author.firstName + " " + author.lastName;
                objectMapping.id = author.id;
                objectMapping.category = "Authors";
                objectMapping.color = authorColor;

                DataToQuery.push(objectMapping);
            });
        }
    }).then(x => {
        DataToQuery = [...new Set(DataToQuery)];

        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data: DataToQuery
        })
    });
};

//  function getAuthorGroupIds  (query){
//     return new Promise(async (resolve, reject)=> {
//         let authorgroupIdsfromClusters = [];
//         let data = await db.sequelize.query(query);
//             if (data.length > 0) {
//                 data[0].forEach(x=> {
//                     authorgroupIdsfromClusters.push(x.id)
//                 })
//             }
//             resolve(authorgroupIdsfromClusters);
//     });
// }


// function getAuthorGroupIds(authorgroupIds) {
//     return new Promise(async (resolve, reject) => {
//         let authorgroupIdsfromClusters = [];

//         if (authorgroupIds.length == 1) {
//             let data = await db.sequelize.query(`
//         SELECT DISTINCT author_group_id as gid from authors_author_groups WHERE author_id IN 
//         (SELECT author_id from authors_author_groups WHERE author_group_id IN (${authorgroupIds})) `
//             );

//             if (data.length > 0) {
//                 data[0].forEach(x => {
//                     authorgroupIdsfromClusters.push(x.gid)
//                 })
//             }

//         } else {
//             let data = await db.sequelize.query(`
//         SELECT DISTINCT author_group_id as gid from authors_author_groups WHERE author_id IN 
//         (
//             SELECT author_id from
//             (SELECT author_id from authors_author_groups WHERE author_group_id = ${authorgroupIds[0]}) as g1
//             INNER JOIN
//             (SELECT author_id from authors_author_groups WHERE author_group_id = ${authorgroupIds[1]}) as g2
            
//             using(author_id)
//         )`
//             );
//             if (data.length > 0) {


//                 data[0].forEach(x => {
//                     authorgroupIdsfromClusters.push(x.gid)
//                 })
//             }
//         }

//         resolve(authorgroupIdsfromClusters);
//     });
// }

module.exports.secondFilter = async function (req, res, next) {
    switch (req.body.category) {
        case "Author": {
            let DataToQuery = [];
            let groupIds = [];
            let outerQuery = ``;
            groupIds=req.body.labels.map(x=>x.id);
            outerQuery=await getAuthorIds(groupIds);
            db.sequelize.query(`SELECT * FROM authors where id IN (${outerQuery}) AND ( CONCAT(first_name,' ',last_name) LIKE '${req.body.label}%' OR CONCAT(first_name,' ',last_name) LIKE '% ${req.body.label}%') ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `)
                .then(data => {
                    if (data.length > 0) {
                        data[0].forEach(author => {
                            objectMapping = {};
                            objectMapping.label = author.first_name + " " + author.last_name;
                            objectMapping.value = author.first_name + " " + author.last_name;
                            objectMapping.id = author.id;
                            objectMapping.category = "Authors";
                            objectMapping.color = authorColor;

                            DataToQuery.push(objectMapping);
                        });
                    }
                }).then(x => {
                    DataToQuery = [...new Set(DataToQuery)];

                    res.status(httpResponse.success.c200.code).json({
                        responseType: httpResponse.responseTypes.success,
                        ...httpResponse.success.c200,
                        data: DataToQuery
                    })
                })
                .catch(err => {
                    console.log(err);
                })
        }
            break;
        case "Concept": {
            let DataToQuery = [];
            let groupIds = [];
            let outerQuery = "";
            groupIds=req.body.labels.map(x=>x.id);
            outerQuery=await getAuthorIds(groupIds);
            db.sequelize.query(`SELECT id FROM authors where id IN (${outerQuery})  `)
                .then(data => {
                    let authorIDs = data[0].map(author => author.id);
                    let innerQuery = "";
                    if (authorIDs.length == 1) {
                        innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${authorIDs[0]})`;
                    }
                    else {
                        innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${authorIDs.length > 0 ? authorIDs : -1}))`
                    }
                    mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND (name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%') LIMIT 10 `;
                    db.sequelize.query(mainQuery)
                        .then(data => {
                            if (data.length > 0) {
                                data[0].forEach(concept => {
                                    objectMapping = {};
                                    objectMapping.label = concept.name;
                                    objectMapping.value = concept.name;
                                    objectMapping.id = concept.id;
                                    objectMapping.category = "Concepts";
                                    objectMapping.color = conceptColor;
                                    DataToQuery.push(objectMapping);
                                });
                            }
                        })
                        .then(x => {
                            DataToQuery = [...new Set(DataToQuery)];

                            res.status(httpResponse.success.c200.code).json({
                                responseType: httpResponse.responseTypes.success,
                                ...httpResponse.success.c200,
                                data: DataToQuery
                            })
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                })
        }
            break;
        case "Concept Clusters": {
            let conceptIDs = [];
            let DataToQuery = [];
            let groupIds = req.body.labels.map(x=>x.id);
            let outerQuery = await getAuthorIds(groupIds);
            db.sequelize.query(`SELECT id FROM authors where id IN (${outerQuery}) `)
                .then(data => {
                    let authorIDs = data[0].map(author => author.id);
                    let innerQuery = "";
                    if (authorIDs.length == 1) {
                        // console.log(AuthorIDs)
                        innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${authorIDs[0]})`;
                    }
                    else {
                        innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${authorIDs.length > 0 ? authorIDs : -1}))`
                    }
                    mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND (name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%') LIMIT 10 `;
                    db.sequelize.query(mainQuery)
                        .then(data => {
                            conceptIDs = data[0].map(concept => concept.id);
                            console.log(conceptIDs);
                        })
                        .then(x => {
                            let outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${conceptIDs.length > 0 ? conceptIDs : -1}))`;
                            let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%' LIMIT 10 `;
                            db.sequelize.query(mainQuery)
                                .then(data => {
                                    console.log(data);
                                    if (data.length > 0) {
                                        data[0].forEach(conceptCluster => {
                                            objectMapping = {};
                                            objectMapping.label = conceptCluster.name + " |Concept cluster";
                                            objectMapping.value = conceptCluster.name;
                                            objectMapping.id = conceptCluster.id;
                                            objectMapping.category = "Concept-Clusters";
                                            objectMapping.color = conceptClusterColor;

                                            DataToQuery.push(objectMapping);
                                        });
                                    }
                                })
                                .then(x => {
                                    DataToQuery = [...new Set(DataToQuery)];

                                    res.status(httpResponse.success.c200.code).json({
                                        responseType: httpResponse.responseTypes.success,
                                        ...httpResponse.success.c200,
                                        data: DataToQuery
                                    })
                                })
                                .catch(err => {

                                })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }).catch(err => {
                    console.log(err);
                });
        }
            break;
        case "Author Clusters": {
            let DataToQuery = [];
            let groupIds = [];
            let author_cluster_ids = [];
            if (req.body.labels.length == 1) {
                groupIds.push(req.body.labels[0].id);
            }
            else {
                groupIds = req.body.labels.map(x => x.id);
            }
            db.sequelize.query(`SELECT DISTINCT author_cluster_id from author_clusters_author_groups where author_group_id in (${groupIds})`)
                .then(data => {
                    author_cluster_ids = data[0].map(author_cluster => author_cluster.author_cluster_id);
                })
                .then(x => {
                    db.sequelize.query(`SELECT DISTINCT * from author_clusters where id in (${author_cluster_ids}) AND (name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%') `)
                        .then(data => {
                            if (data.length > 0) {
                                data[0].forEach(author => {
                                    objectMapping = {};
                                    objectMapping.label = author.name + "|Author Cluster";
                                    objectMapping.value = author.name;
                                    objectMapping.id = author.id;
                                    objectMapping.category = "Author-Clusters";
                                    objectMapping.color = authorClusterColor;
                                    DataToQuery.push(objectMapping);
                                });
                            }
                        })
                        .then(x => {
                            DataToQuery = [...new Set(DataToQuery)];
                            res.status(httpResponse.success.c200.code).json({
                                responseType: httpResponse.responseTypes.success,
                                ...httpResponse.success.c200,
                                data: DataToQuery
                            })
                        })
                        .catch();
                })
                .catch(err => {
                    console.log(err);
                });

        }
            break;
        default: {
            let DataToQuery = [];

            let AuthorIDs = [];
            let ConceptIDs = [];

            // SQUELIZE doesn't provide support/implementation for ALL operator hence using custom raw query
            let outerQuery = "";
            let innerQuery = "";
            let groupIds = req.body.labels.map(x=>x.id);
            outerQuery=await getAuthorIds(groupIds);
            let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) AND ( CONCAT(first_name,' ',last_name) LIKE '${req.body.label}%' ) ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `;
            db.sequelize.query(mainQuery).then(data => {

                //data is ARRAY of ARRAYS, merging into single array containg author records
                // var merged = [].concat.apply([], data[0]); 
                if (true || merged.length > 0) {

                    // let authorsdata = [...merged];
                    let authorsdata = data[0];

                    //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

                    authorsdata.forEach(author => {
                        objectMapping = {};
                        objectMapping.label = author.first_name + " " + author.last_name;
                        objectMapping.value = author.first_name + " " + author.last_name;
                        objectMapping.id = author.id;
                        objectMapping.category = "Authors";
                        objectMapping.color = authorColor;

                        DataToQuery.push(objectMapping);
                        // AuthorIDs.push(author.id);
                    });
                }
            }).then(x => {
                let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) `;
                db.sequelize.query(mainQuery).then(data => {

                    //data is ARRAY of ARRAYS, merging into single array containg author records
                    // var merged = [].concat.apply([], data[0]); 
                    if (true || merged.length > 0) {

                        // let authorsdata = [...merged];
                        let authorsdata = data[0];

                        //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

                        authorsdata.forEach(author => {
                            AuthorIDs.push(author.id);
                        });
                    }
                }).then(x => {

                    if (AuthorIDs.length == 1) {
                        // console.log(AuthorIDs)
                        innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${AuthorIDs[0]})`;
                    }
                    else {
                        innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${AuthorIDs.length > 0 ? AuthorIDs : -1}))`
                    }
                    mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND (name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%') LIMIT 10 `;


                    db.sequelize.query(mainQuery).then(data => {

                        //data is ARRAY of ARRAYS, merging into single array containg author records
                        // var merged = [].concat.apply([], data[0]); 
                        if (true || merged.length > 0) {

                            // let authorsdata = [...merged];
                            let conceptsData = data[0];

                            conceptsData.forEach(concept => {
                                objectMapping = {};
                                objectMapping.label = concept.name;
                                objectMapping.value = concept.name;
                                objectMapping.id = concept.id;
                                objectMapping.category = "Concepts";
                                objectMapping.color = conceptColor;

                                DataToQuery.push(objectMapping);
                                ConceptIDs.push(concept.id);
                            });
                        }

                    }).then(x => {

                        // console.log(ConceptIDs)
                        outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${ConceptIDs.length > 0 ? ConceptIDs : -1}))`;

                        let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%' LIMIT 10 `;
                        db.sequelize.query(mainQuery).then(data => {

                            //data is ARRAY of ARRAYS, merging into single array containg author records
                            // var merged = [].concat.apply([], data[0]); 
                            if (true || merged.length > 0) {

                                // let authorsdata = [...merged];
                                let conceptsClusterData = data[0];

                                conceptsClusterData.forEach(concept => {
                                    objectMapping = {};
                                    objectMapping.label = concept.name + " |Concept cluster";
                                    objectMapping.value = concept.name;
                                    objectMapping.id = concept.id;
                                    objectMapping.category = "Concept-Clusters";
                                    objectMapping.color = conceptClusterColor;

                                    DataToQuery.push(objectMapping);
                                });
                            }

                        }).then(x => {
                            // DataToQuery = [...new Set(DataToQuery)];
                            DataToQuery = DataToQuery

                                .map(e => e["id"])

                                // store the keys of the unique objects
                                .map((e, i, final) => final.indexOf(e) === i && i)

                                // eliminate the dead keys & store unique objects
                                .filter(e => DataToQuery[e]).map(e => DataToQuery[e]);

                            AuthorIDs = [];
                            ConceptIDs = [];

                            // DataToQuery = _.sortBy(DataToQuery, 'label');
                            DataToQuery.sort((a, b) =>
                                a.length - b.length
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

        }
    }

}
