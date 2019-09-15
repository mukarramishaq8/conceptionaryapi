const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const Sequelize = require('sequelize');
const excelToJson = require('convert-excel-to-json');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;
const { getConceptByName, getAuthorByName, createConcept, createAuthor, ceatePerspective, getPerspective, getAuthorByLastName } = require("../querie-methods");
const csv = require('csv-parser');
const fs = require('fs');
const upload = require('../config/upload')();
var path = require('path');
var Jimp = require('jimp');
 
const { createCanvas, loadImage,registerFont } = require('canvas')
registerFont( process.cwd() + "/app/config/arial.ttf", { family: 'TArial' })
var Frame = require('canvas-to-buffer')
var canvas = createCanvas(350, 350)
var c = canvas.getContext('2d')
const editCanvas = (pronoun,title, data, author) => {
    console.log("Found author",author);
    canvas = createCanvas(600, 314)
    c = canvas.getContext('2d')
    c.strokeStyle = "#000"
    c.fillStyle = "red";
    c.rect(5, 5, 590, 309);
    c.stroke();
    c.fillStyle = "#000";
    c.font = "40px Arial";

    let tile= " ";

    if(title!=null)
    {
        console.log("s"+pronoun+"s")
        if(title.length>0)
        {
            tile=pronoun.charAt(0).toUpperCase() + pronoun.slice(1)+" "+title.charAt(0).toUpperCase() + title.slice(1)
        }
        else
        tile=title.charAt(0).toUpperCase() + title.slice(1)
    }

    c.fillText(tile, 14, 55);
    c.beginPath();
    c.moveTo(10, 75);
    c.lineTo(580, 75);
    c.stroke();

    c.font = "20px Arial";
   
    console.log("Title built is ",tile);
    
    wrapText(c,tile + " is " + data, 14, 110,580, 30);
    c.font = "25px Arial";
    c.fillStyle = "red";
    if(author.length>15 && author.length<20)
    {
        c.fillText(author,370, 250);
    }
    else
    {

        if(author.length>20)
        {


            c.fillText(author,320, 250);    
        }
    }
    if(author.length<15)
    {
        
        c.fillText(author,385, 250);
        
    }

    c.font = "18px Arial";
    c.fillStyle = "Gray";
    c.fillText("Conceptionary.io", 22, 300);


}
function wrapText(context, text, x, y, maxWidth, fontSize, fontFace) {

    var words = text.split(' ');
    var line = '';
    var lineHeight = 20;
    // console.log("I Got Data "+text)
    c.fillStyle = "#000";
   for (var n = 0; n < words.length; n++) {

        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}


/**
 * upload file
 */
//function uploadFile(req,res)
/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function parseExcelToJson(path) {
    return new Promise((resolve, reject) => {
        let result = excelToJson({
            source: fs.readFileSync(path),
            columnToKey: {
                A: "ID",
                B: "PRONOUN",
                C: "CONCEPT",
                D: "DESCRIPTION",
                E: "AUTHOR_LAST",
                F: "AUTHOR_FIRST",
                G: "CITATION",
                H: "LNG"


            },
            header: {
                rows: 1
            }
        });
        result = result[Object.keys(result)[0]];
        resolve(result);
    })
}
module.exports.upLoadPerspective = function (req, res) {
    upload(req, res, function (err) {
        if (!err) {
            (async () => {
                try {
                    let concept = {};
                    let author = {};
                    let data = [];
                    let newCreated = false;
                    let perspectives = [];
                    let skip = [];
                    perspectives = await parseExcelToJson(req.file.path);
                    for (let i = 0; i < perspectives.length; i++) {
                        if (perspectives[i].CONCEPT) {
                            concept = await getConceptByName(perspectives[i].CONCEPT);
                            if (!concept) {
                                newCreated = true;
                                concept = await createConcept({ name: perspectives[i].CONCEPT })
                            }
                            if (perspectives[i].AUTHOR_LAST) {
                                if (perspectives[i].AUTHOR_LAST && perspectives[i].AUTHOR_FIRST) {
                                    author = await getAuthorByName(perspectives[i].AUTHOR_FIRST + " " + perspectives[i].AUTHOR_LAST);
                                    if (!author) {
                                        newCreated = true;
                                        author = await createAuthor(
                                            {
                                                firstName: perspectives[i].AUTHOR_FIRST,
                                                lastName: perspectives[i].AUTHOR_LAST,
                                                dob: "",
                                                dod: "",
                                                gender: "",
                                                pictureLink: ""
                                            }
                                        );
                                    }
                                } else {
                                    author = await getAuthorByLastName(perspectives[i].AUTHOR_LAST);
                                    console.log(author);
                                    if (!author) {
                                        newCreated = true;
                                        author = await createAuthor(
                                            {
                                                firstName: "",
                                                lastName: perspectives[i].AUTHOR_LAST,
                                                dob: "",
                                                dod: "",
                                                gender: "",
                                                pictureLink: ""
                                            }
                                        );
                                    }
                                }
                            } else {
                                author = await getAuthorByLastName("anonymous");
                                if (!author) {
                                    newCreated = true;
                                    author = await createAuthor(
                                        {
                                            firstName: "",
                                            lastName: "anonymous",
                                            dob: "",
                                            dod: "",
                                            gender: "",
                                            pictureLink: ""
                                        }
                                    );
                                }
                            }
                            let newperspective = await getPerspective({ author_id: author.id, concept_id: concept.id });
                            if (!newperspective || newCreated) {
                                if (!perspectives[i].DESCRIPTION) {
                                    skip.push(i);
                                    continue;
                                }
                                let perspec = await ceatePerspective(
                                    {
                                        pronoun: perspectives[i].PRONOUN,
                                        description: perspectives[i].DESCRIPTION,
                                        longDescription: perspectives[i].LNG,
                                        citation: perspectives[i].CITATION,
                                        author_id: author.id,
                                        concept_id: concept.id
                                    }
                                )
                                data.push(perspec);
                            } else {
                                skip.push(i);
                            }
                        } else {
                            skip.push(i);
                            continue;
                        }
                    };
                    res.json({ msg: `${data.length} records saved`, skip });
                    //res.json({data});
                } catch (err) {
                    console.log(err);
                }
            })();
        } else {
            res.json({ msg: "file not uploaded", skip });
        }
    })
}
module.exports.index = function (req, res, next) {
    Perspective.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            { model: Concept },
            { model: Author },
            { model: Keyword },
            { model: Tone },
        ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data,
        query: req.query
    })).catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function (req, res, next) {
    Perspective.findByPk(req.params.perspectiveId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            { model: Concept },
            { model: Author },
            { model: Keyword },
            { model: Tone },
        ]
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
    }).catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    Perspective.create(req.body)
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
    Perspective.findByPk(req.params.perspectiveId)
        .then(perspective => {
            if (!perspective) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            perspective.update(req.body).then(data => {
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
    Perspective.findByPk(req.params.perspectiveId)
        .then(perspective => {
            if (!perspective) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            perspective.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}
module.exports.createLike = async function (req, res) {
    let perspective = await Perspective.findByPk(req.body.like.id);
    if (perspective) {
        if (perspective.loves == null || perspective.loves === "") {
            perspective.loves = 1;
            perspective = await perspective.save();
        } else {
            if (req.body.like.type === "increase") {
                perspective.loves += 1;
                perspective = await perspective.save();
            } else if (req.body.like.type === "decrease") {
                perspective.loves -= 1;
                perspective = await perspective.save();
            }
        }
        res.json({ perspective });
    } else {
        res.json({ msg: "resource not found" });
    }

    // Users.findAll({
    //     include: {
    //         model: perspectives,
    //         where: {
    //             id: 5
    //         }
    //     }
    // })
    //     .then(user => {
    //         console.log(user[0].Perspectives);
    //         res.send("hello");
    //     })
    //     .catch(err => {
    //         res.send("");
    //         console.log(err);
    //     });
}
module.exports.getPerspectivesByLikes=(req,res) => {
    Perspective.findAll({where:{concept_id:req.body.perspective.conceptid},order:[['loves','DESC'], [Sequelize.fn('length', Sequelize.col('description')), 'ASC']
    ],offset:req.body.perspective.offset*30,limit:30}).then(data => {
        
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            perspectives: data,

        });
    }).catch(err => {
        console.log(err)
    })
}
module.exports.getPerspectivesByAuthors = function (req, res) {
    Perspective.findAll({
        where: {
            [Sequelize.Op.and]:[
                {
                    author_id:{[Sequelize.Op.in]: req.body.perspective.authorIds}
                },
                {
                    concept_id:req.body.perspective.conceptId
                }
            ]
        }
    }).then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            perspectives: data,

        });
    }).catch(err => {
        console.log(err)
    })
}
module.exports.getPerspectiveDetail = function (req, res) {
    Perspective.findByPk(req.params.perspectiveId, {
        include: [
            { model: Concept },
            { model: Author }
        ]
    }).then(data => {
        console.log("Data got is",data.Author.firstName+" "+data.Author.lastName);
        editCanvas(data.pronoun, data.Concept.name, data.description, data.Author.firstName+" "+data.Author.lastName);
        var frame = new Frame(canvas)
        var buffer = frame.toBuffer()
        var imageType = frame.getImageType()
        const out = fs.createWriteStream(process.cwd() + "/public/images/" + data.id + ".png")
            const stream = canvas.createPNGStream()
            stream.pipe(out)
            out.on('finish', () => {
                Jimp.read(process.cwd() + "/public/images/" + data.id + ".png", (err, lenna) => {
                    if (err) throw err;
                    lenna
                      .quality(100) // set JPEG quality
                      .write(process.cwd() + "/public/images/converted.png"); // save
                  }); 

                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    data,
                    img: `/images/${data.id}.png`

                });
            
            })
				




    }).catch(err => {
        console.log(err);
    });
}
