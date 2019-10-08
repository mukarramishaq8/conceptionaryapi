require("babel-register")({
    presets: ["es2015", "react"]
  });
  const Sequelize = require('sequelize');

  const router = require("./sitemap-routes").default;
  const Sitemap = require("react-router-sitemap").default;
  const db = require('./app/bootstrap');
  
const Concept = db.Concept;
const ConceptCluster = db.ConceptCluster;
const Author = db.Author;
const Perspective=db.Perspective;
const AuthorGroups=db.AuthorGroups;

async function generateSitemap() {
  let conceptMap=[];
  let authorMap=[];
  let conceptClusterMap=[]
  let perspectiveMap=[]
  let authorGroupMap=[]
  await Concept.findAll({attributes: ['name']}).then(response => {
      console.log("first is ",response[0])
      response.map(data => conceptMap.push({name:data.name}));
    })
    console.log("size is ",conceptMap[0]);

    let idMap = [{name:'love'},{name:'love'},{name:'educate'},{name:'cdk'},{name:'voice'},{name:'song'}];
    // let authorMap = [{name:'Hao'},{name:'FriedRich'},{name:'Sigmund Frued'}];
    // conceptMap=result.concepts;
  

    
    
    const paramsConfig = {
        "/Concept/:name": conceptMap,
      };
  
    
    
    return (
        new Sitemap(router)
            .applyParams(paramsConfig)
            .build("http://conceptionary.io")
            .save("./public/sitemap.xml")
      );
  }
async function generateAuthorSitedMap() {
  let conceptMap=[];
  let authorMap=[];
  let conceptClusterMap=[]
  let perspectiveMap=[]
  let authorGroupMap=[]
    await Author.findAll({attributes: ['firstName','lastName']}).then(response => {
      console.log("first author is ",JSON.stringify(response[0]))
      response.map(data => authorMap.push({name:data.firstName+" "+data.lastName}));
      
    })
    
    let idMap = [{name:'love'},{name:'love'},{name:'educate'},{name:'cdk'},{name:'voice'},{name:'song'}];
    // let authorMap = [{name:'Hao'},{name:'FriedRich'},{name:'Sigmund Frued'}];
    // conceptMap=result.concepts;
  

    
    
    const paramsConfig = {
        "/Author/:name":authorMap,
      };
  
    
    
    return (
        new Sitemap(router)
            .applyParams(paramsConfig)
            .build("http://conceptionary.io")
            .save("./public/authorsitemap.xml")
      );
  }
async function generateConceptClusterSitedMap() {
  let conceptMap=[];
  let authorMap=[];
  let conceptClusterMap=[]
  let perspectiveMap=[]
  let authorGroupMap=[]
  
    await ConceptCluster.findAll({attributes: ['name']}).then(response => {
      console.log("first Concept Cluster is ",JSON.stringify(response[0]))
      response.map(data => conceptClusterMap.push({name:data.name}));
      


  })




    let idMap = [{name:'love'},{name:'love'},{name:'educate'},{name:'cdk'},{name:'voice'},{name:'song'}];
    // let authorMap = [{name:'Hao'},{name:'FriedRich'},{name:'Sigmund Frued'}];
    // conceptMap=result.concepts;
  

    
    
    const paramsConfig = {
        "/Concept-Clusters/:name":conceptClusterMap,
      };
  
    
    
    return (
        new Sitemap(router)
            .applyParams(paramsConfig)
            .build("http://conceptionary.io")
            .save("./public/conceptclustersitemap.xml")
      );
  }
  async function generateAuthorGroupSitedMap() {
    let conceptMap=[];
    let authorMap=[];
    let conceptClusterMap=[]
    let perspectiveMap=[]
    let authorGroupMap=[]
    
  await AuthorGroups.findAll({}).then(response => {
    console.log("first Concept Cluster is ",JSON.stringify(response[0]))
    response.map(data => authorGroupMap.push({name:data.name}));
    
  
  })
  
  
  
      let idMap = [{name:'love'},{name:'love'},{name:'educate'},{name:'cdk'},{name:'voice'},{name:'song'}];
      // let authorMap = [{name:'Hao'},{name:'FriedRich'},{name:'Sigmund Frued'}];
      // conceptMap=result.concepts;
    
  
      
      
      const paramsConfig = {
          "/Author-Groups/:name":authorGroupMap,
      
        };
    
      
      
      return (
          new Sitemap(router)
              .applyParams(paramsConfig)
              .build("http://conceptionary.io")
              .save("./public/authorgroupsitemap.xml")
        );
    }
  
  generateSitemap();
  generateAuthorSitedMap()
  generateConceptClusterSitedMap()
  // generateAuthorGroupSitedMap()