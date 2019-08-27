const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const { getAuthorIds, getAllAuthorsByName, updatePerspectivesByAuthorId, getAllAuthorsByLastName, deleteAuthorById } = require('../querie-methods');
const chalk = require("chalk");
const _ = require('underscore');
const { mapObject } = require("../utils");
const {
    searchAuthorsByFilters,
    searchConceptsByFilters,
    searchConceptClustersByFilters,
    searchAuthorClustersByFilters
} = require('../querie-methods/index');
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
/**
 * remove duplicate authors
 */
module.exports.removeDuplicateAuthors = async function (req, res, next) {
    //     let firstName = req.param("firstname");
    //     let lastName = req.param("lastname");
    //     let authors = [];
    //     let records = 0;
    //     try{
    //     if (lastName) {
    //         if (firstName) {
    //             authors = await getAllAuthorsByName(firstName + " " + lastName)
    //         }
    //         authors = await getAllAuthorsByLastName(lastName)
    //     }
    //     if (authors.length > 0) {
    //         let updateWith = authors[0].id;
    //         for(let i=0;i<authors.length;i++){
    //             if (authors[i].id == updateWith) {
    //                 continue;
    //             }
    //             let result = await updatePerspectivesByAuthorId(authors[i].id, updateWith);
    //             if (result.length > 0) {
    //                 records = records + result.length;
    //                 await deleteAuthorById(authors[i].id);
    //             }
    //         }
    //     }
    //     res.json({ "no of records changed": records });
    // }catch(err){
    //     console.log(err);
    // }
}
module.exports.getPerspectivesByAuthorLastName = function (req, res) {
    Author.findAll(
        {
            where: { lastName: req.params.author_lastName },
            include: { model: Perspective, attributes: { include: [['author_id', 'Author']] } }
        }
    ).then(result => {
        let perspectives = [];
        result.forEach(author => {
            perspectives.push(...author.Perspectives);
        })
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            perspectives
        })
    })
        .catch(err => {
            console.log(err);
        })
}
module.exports.getAuthorsByLastName = async function (req, res) {
    let authors = await getAllAuthorsByLastName(req.param('lastname'));
    res.json(authors);
}
module.exports.getAuthor = async function (req, res, next) {
    if (req.body.author.groupIds.length > 0 && req.body.author.name) {
        let DataToQuery = [];
        let outerQuery = ``;
        outerQuery = await getAuthorIds(req.body.author.groupIds);
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
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data,
            query: req.query
        })
    }).catch(err => {
        console.log(err);
    });
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
// function getPictureLink(data){
//         console.log("******************************");
//         let author_with_picture=[];
//         Author.findAll({
//             attributes: ['first_name', 'last_name','id'],
//             limit:10
//         }).then(authors=>{
//             authors.forEach(author=>{
//                 let link={};
//                  let author_lastName=(((author.dataValues.last_name).split(" ")).join("+")).toLowerCase();
//                  let author_firstName=(((author.dataValues.first_name).split(" ")).join("+")).toLowerCase();
//                  author_firstName=((author_firstName).split(".")).join("");
//                  let pictureLink=author_lastName.concat("+"+author_firstName+".jpg");
//                  pictureLink=`https://conceptionary-images.s3.amazonaws.com/${pictureLink}`;
//                 link.id=author.dataValues.id;
//                 link.pictureLink=pictureLink;
//                 author_with_picture.push(link);
//             });
//         }).then(x=>{
//             author_with_picture.forEach(author=>{
//                 Author.update(
//                     {picture_link:author.pictureLink},
//                     {where:{id:author.id}}
//                     ).then(x=>{
//                         console.log("success");
//                     })
//                      .catch(err=>{
//                          console.log(err);
//                      })
//             });
//         })
//         .catch(err=>{
//           console.log(err);
//         })

//     /*if("pictureLink" in data){
//        let author_lastName=(((data.lastName).split(" ")).join("+")).toLowerCase();
//        let author_firstName=(((data.firstName).split(" ")).join("+")).toLowerCase();
//        author_firstName=((author_firstName).split(".")).join("");
//        let author_image=author_lastName.concat("+"+author_firstName+".jpg");

//       data.pictureLink=`https://conceptionary-images.s3.amazonaws.com/${author_image}`;
//     }
//     console.log("*********************************");
//     console.log(data.authors_convo_authors);
//     if("AuthorConvoAuthors" in data){
//         if(data.AuthorConvoAuthors.lenght>0){
//             data.AuthorConvoAuthors.forEach(function(convo){
//                 console.log(convo);
//             });
//         }
//     }
//     if("AuthorInfluenceAuthors" in data){
//         if(data.AuthorInfluenceAuthors.lenght>0){
//             data.AuthorInfluenceAuthors.forEach(function(influence){
//                 console.log(influence);
//             });
//         }
//     }*/
//     return data;
//  }
module.exports.getOne = async function (req, res, next) {
    Author.findByPk(req.params.authorId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ?
            undefined : serializers.withSelfAssociationsOnly(req.query) !== true ?
                [
                    {
                        model: Perspective, limit: 100, include: [
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
        console.log("sending data",JSON.stringify(data,null,4))
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
module.exports.filter = function (req, res, next) {
    let DataToQuery = [];
    Author.findAll({
        where: {
            [Sequelize.Op.or]: [
                {
                    firstName: { [Sequelize.Op.like]: req.params.label + '%' }
                },
                {
                    lastName: { [Sequelize.Op.like]: req.params.label + '%' }
                }
            ]
        },
        limit: 10
    }).then(async data => {
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

module.exports.secondFilter = async function (req, res, next) {
    switch (req.body.category) {
        case "Author": {
            let DataToQuery = [];
            try {
                let groupIds = [];
                groupIds = req.body.labels.map(x => x.id);
                let authorIds = await getAuthorIds(groupIds);
                let authors = await searchAuthorsByFilters(authorIds, req.body.label);
                if (authors.length > 0) {
                    let result = await mapObject("Authors", authors[0]);
                    DataToQuery.push(...result);
                }
            } catch (err) {
                console.log(err);
                DataToQuery = [];
            } finally {
                DataToQuery.sort((a, b) =>
                    a["label"].length - b["label"].length
                );
                DataToQuery = [...new Set(DataToQuery)];

                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data: DataToQuery
                })
            }
        }
            break;
        case "Concept": {
            let DataToQuery = [];
            try {
                let groupIds = [];
                groupIds = req.body.labels.map(x => x.id);
                authorIDs = await getAuthorIds(groupIds);
                let concepts = await searchConceptsByFilters(authorIDs, req.body.label);
                if (concepts.length > 0) {
                    let result = await mapObject("Concepts", concepts[0]);
                    DataToQuery.push(...result);
                }
            } catch (err) {
                DataToQuery = [];
                console.log(err);
            } finally {
                DataToQuery.sort((a, b) =>
                    a["label"].length - b["label"].length
                );
                DataToQuery = [...new Set(DataToQuery)];
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data: DataToQuery
                })
            }
        }
            break;
        case "Concept Clusters": {
            let DataToQuery = [];
            try {
                let groupIds = req.body.labels.map(x => x.id);
                let authorIDs = await getAuthorIds(groupIds);
                let concepts = await searchConceptsByFilters(authorIDs, req.body.label);
                let conceptIDs = concepts[0].map(concept => concept.id);
                let conceptClusters = await searchConceptClustersByFilters(conceptIDs, req.body.label);
                if (conceptClusters.length > 0) {
                    let result = await mapObject("Concept-Clusters", conceptClusters[0]);
                    DataToQuery.push(...result);
                } else {
                    let result = await mapObject("Concept-Clusters", conceptClusters);
                    DataToQuery.push(...result);
                }
            } catch (err) {
                DataToQuery = [];
            } finally {
                DataToQuery = [...new Set(DataToQuery)];

                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data: DataToQuery
                })
            }
        }
            break;
        case "Author Clusters": {
            let DataToQuery = [];
            try {
                let groupIds = [];
                if (req.body.labels.length == 1) {
                    groupIds = req.body.labels.map(x => x.id);
                };
                console.log(groupIds);
                let authorClusters = await searchAuthorClustersByFilters(groupIds, req.body.label);
                if (authorClusters.length > 0) {
                    let result = await mapObject("Author-Clusters", authorClusters[0]);
                    DataToQuery.push(...result);
                } else {
                    let result = await mapObject("Author-Clusters", authorClusters);
                    DataToQuery.push(...result);
                }
            } catch (err) {
                DataToQuery = [];
                console.log(err);
            } finally {
                DataToQuery = [...new Set(DataToQuery)];
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data: DataToQuery
                })

            }
        }
            break;
        default: {
            //     let DataToQuery = [];
            //     let AuthorIDs = [];
            //     let ConceptIDs = [];
            //     let outerQuery = "";
            //     let innerQuery = "";
            //     let groupIds = req.body.labels.map(x => x.id);
            //     AuthorIDs = await getAuthorIds(groupIds);
            //     //let authors=await searchAuthorsByFilters(AuthorIDs,req.body.label);
            //      let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) AND ( CONCAT(first_name,' ',last_name) LIKE '${req.body.label}%' ) ORDER BY length(CONCAT(first_name, ' ', last_name)) LIMIT 10 `;
            //      db.sequelize.query(mainQuery).then(data => {

            //         //data is ARRAY of ARRAYS, merging into single array containg author records
            //         // var merged = [].concat.apply([], data[0]); 
            //         if (true || merged.length > 0) {

            //             // let authorsdata = [...merged];
            //             let authorsdata = data[0];

            //             //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

            //             authorsdata.forEach(author => {
            //                 objectMapping = {};
            //                 objectMapping.label = author.first_name + " " + author.last_name;
            //                 objectMapping.value = author.first_name + " " + author.last_name;
            //                 objectMapping.id = author.id;
            //                 objectMapping.category = "Authors";
            //                 objectMapping.color = authorColor;

            //                 DataToQuery.push(objectMapping);
            //                 // AuthorIDs.push(author.id);
            //             });
            //         }
            //     }).then(x => {
            //         let mainQuery = `SELECT DISTINCT * FROM authors where id IN (${outerQuery}) `;
            //         db.sequelize.query(mainQuery).then(data => {

            //             //data is ARRAY of ARRAYS, merging into single array containg author records
            //             // var merged = [].concat.apply([], data[0]); 
            //             if (true || merged.length > 0) {

            //                 // let authorsdata = [...merged];
            //                 let authorsdata = data[0];

            //                 //authorsdata = authorsdata.filter(x=> x.firstName.toLowerCase().includes(req.body.label));

            //                 authorsdata.forEach(author => {
            //                     AuthorIDs.push(author.id);
            //                 });
            //             }
            //         }).then(x => {

            //             if (AuthorIDs.length == 1) {
            //                 // console.log(AuthorIDs)
            //                 innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${AuthorIDs[0]})`;
            //             }
            //             else {
            //                 innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${AuthorIDs.length > 0 ? AuthorIDs : -1}))`
            //             }
            //             mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery} AND (name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%') LIMIT 10 `;


            //             db.sequelize.query(mainQuery).then(data => {

            //                 //data is ARRAY of ARRAYS, merging into single array containg author records
            //                 // var merged = [].concat.apply([], data[0]); 
            //                 if (true || merged.length > 0) {

            //                     // let authorsdata = [...merged];
            //                     let conceptsData = data[0];

            //                     conceptsData.forEach(concept => {
            //                         objectMapping = {};
            //                         objectMapping.label = concept.name;
            //                         objectMapping.value = concept.name;
            //                         objectMapping.id = concept.id;
            //                         objectMapping.category = "Concepts";
            //                         objectMapping.color = conceptColor;

            //                         DataToQuery.push(objectMapping);
            //                         ConceptIDs.push(concept.id);
            //                     });
            //                 }

            //             }).then(x => {

            //                 // console.log(ConceptIDs)
            //                 outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${ConceptIDs.length > 0 ? ConceptIDs : -1}))`;

            //                 let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND name LIKE '${req.body.label}%' OR name LIKE '% ${req.body.label}%' LIMIT 10 `;
            //                 db.sequelize.query(mainQuery).then(data => {

            //                     //data is ARRAY of ARRAYS, merging into single array containg author records
            //                     // var merged = [].concat.apply([], data[0]); 
            //                     if (true || merged.length > 0) {

            //                         // let authorsdata = [...merged];
            //                         let conceptsClusterData = data[0];

            //                         conceptsClusterData.forEach(concept => {
            //                             objectMapping = {};
            //                             objectMapping.label = concept.name + " |Concept cluster";
            //                             objectMapping.value = concept.name;
            //                             objectMapping.id = concept.id;
            //                             objectMapping.category = "Concept-Clusters";
            //                             objectMapping.color = conceptClusterColor;

            //                             DataToQuery.push(objectMapping);
            //                         });
            //                     }

            //                 }).then(x => {
            //                     // DataToQuery = [...new Set(DataToQuery)];
            //                     DataToQuery = DataToQuery

            //                         .map(e => e["id"])

            //                         // store the keys of the unique objects
            //                         .map((e, i, final) => final.indexOf(e) === i && i)

            //                         // eliminate the dead keys & store unique objects
            //                         .filter(e => DataToQuery[e]).map(e => DataToQuery[e]);

            //                     AuthorIDs = [];
            //                     ConceptIDs = [];

            //                     // DataToQuery = _.sortBy(DataToQuery, 'label');
            //                     DataToQuery.sort((a, b) =>
            //                         a.length - b.length
            //                     );
            //                     res.status(httpResponse.success.c200.code).json({
            //                         responseType: httpResponse.responseTypes.success,
            //                         ...httpResponse.success.c200,
            //                         data: DataToQuery.slice(0, 10)
            //                     })
            //                 })
            //             })
            //         })
            //     })

            /**
             * new implementation
             */
            let DataToQuery = []
            try {
                let result = [];
                let groupIds = req.body.labels.map(x => x.id);
                let authorIDs = await getAuthorIds(groupIds);
                let authors = await searchAuthorsByFilters(authorIDs, req.body.label);
                result = await mapObject("Authors", authors[0]);
                DataToQuery.push(...result);
                let Concepts = await searchConceptsByFilters(authorIDs, req.body.label);
                result = await mapObject("Concepts", Concepts[0])
                DataToQuery.push(...result);
                let conceptClusters = await searchConceptClustersByFilters(authorIDs, req.body.label);
                result = await mapObject("Concept-Cluster", conceptClusters);
                DataToQuery.push(...result);
                let authorClusters = await searchAuthorClustersByFilters(authorIDs, req.body.label);
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
    }
}
