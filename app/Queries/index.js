const db=require("../bootstrap");
const AuthorGroup = db.AuthorGroups;
const Sequelize = require('sequelize');
const chalk=require("chalk");
module.exports.getAuthorIds=function(Ids){
    return new Promise(function(resolve,reject){
        let groupIds = [];
        let query = ``;
            groupIds.push(...Ids);
            if (groupIds.length == 1) {
                query = `SELECT author_id FROM authors_author_groups WHERE author_group_id in (${groupIds})`;
             }
            else {
                query = `
            SELECT author_id from 
            (SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[0]}) ) as a1
            INNER JOIN
            ( SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[1]}) ) as a2  
            USING(author_id)`;
            }
            db.sequelize.query(query)
                        .then(data=>{
                         let author_ids=data[0].map(x=>x.author_id);
                         resolve(author_ids);
                        })
                        .catch(err=>{
                            console.log(err);
                        })
    }).catch(err=>{
        console.log(err);
    })
}