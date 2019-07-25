
let authorColor = "#A52A2A";
let conceptColor = "#000000";
let conceptClusterColor = "#FF0000";
let authorClusterColor = "#0000FF";
let authorGroupColor = '#33FF57';
module.exports.mapObject=(category,data)=>{
let mappedData=[];
switch(category){
    case "Authors":{
        return new Promise((resolve,reject)=>{
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.first_name + " " + author.last_name;
                objectMapping.value = author.first_name + " " + author.last_name;
                objectMapping.id = author.id;
                objectMapping.category = "Authors";
                objectMapping.color = authorColor;
                mappedData.push(objectMapping);
            });
            resolve(mappedData);
        });
    }

    case "Concepts":{
        return new Promise((resolve,reject)=>{
            data.forEach(concept => {
                objectMapping = {};
                objectMapping.label = concept.name;
                objectMapping.value = concept.name;
                objectMapping.id = concept.id;
                objectMapping.category = "Concepts";
                objectMapping.color = conceptColor;
                mappedData.push(objectMapping);
            });
            resolve(mappedData);
        });
    }

    case "Concept-Clusters":{
        return new Promise(resolve=>{
            data.forEach(concept => {
                objectMapping = {};
                objectMapping.label = concept.name +" | "+concept.type;
                objectMapping.value = concept.name;
                objectMapping.id = concept.id;
                objectMapping.category = "Concept-Clusters";
                objectMapping.color = conceptClusterColor;
                mappedData.push(objectMapping);
            });
          resolve(mappedData);
        });
    }

    case "Author-Clusters":{
        return new Promise(resolve=>{
            data.forEach(author => {
                objectMapping = {};
                objectMapping.label = author.name + "|Author Cluster";
                objectMapping.value = author.name;
                objectMapping.id = author.id;
                objectMapping.category = "Author-Clusters";
                objectMapping.color = authorClusterColor;
                mappedData.push(objectMapping);

            })

            resolve(mappedData);
        });
    }
  case "Author-Groups":{
      return new Promise(resolve=>{
        data.forEach(authorGroup => {
            objectMapping = {};
            objectMapping.label = authorGroup.name + '| Author Group';
            objectMapping.value = authorGroup.name;
            objectMapping.id = authorGroup.id;
            objectMapping.category = 'Author-Groups';
            objectMapping.color = authorGroupColor;
            mappedData.push(objectMapping);
        })
        resolve(mappedData);
      });
  }
}
}
/**
 * send response
 */
module.exports.sendResponse=function(Data){

}