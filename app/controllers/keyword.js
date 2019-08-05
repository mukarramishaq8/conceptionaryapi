const db = require('../bootstrap');
const Perspective = db.Perspective;
const Keyword = db.Keyword;
const httpResponse = require('../helpers/http');
module.exports.getPerspectiveByKeyword = function (req, res) {
    console.log(req.params.keywordId)
    Keyword.findByPk(req.params.keywordId,{
        include: {
            model: Perspective
        }
    }).then(data => {
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
