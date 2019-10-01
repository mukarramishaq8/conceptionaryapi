const db = require('../bootstrap');
const Perspective = db.Perspective;
const Keyword = db.Keyword;
const httpResponse = require('../helpers/http');
module.exports.getPerspectiveByKeyword = function (req, res) {
    console.log(req.body.id)
    Keyword.findAll({where:{id:req.body.id},
        include: {
            model: Perspective
        }
    }).then(data => {
        console.log("Sending data",JSON.stringify(data,null,4))
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        console.log("bye")
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        })
    })
    .catch(err=>{
        console.log(err)
    })
}
