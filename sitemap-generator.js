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
const Perspective = db.Perspective;
const AuthorGroups = db.AuthorGroups;
var domain="http://conceptionary.io"


async function generateConceptSitemap() {
  let conceptMap = [];
  await Concept.findAll({ attributes: ['name'] }).then(response => {
    response.map(data => conceptMap.push({ name: data.name }));
  })
  const paramsConfig = {
    "/Concepts/:name": conceptMap,
  };
  return (
    new Sitemap(router)
      .applyParams(paramsConfig)
      .build(domain)
      .save("./public/conceptsitemap.xml")
  );
}
async function generateAuthorSiteMap() {
  let authorMap = [];
  await Author.findAll({ attributes: ['firstName', 'lastName'] }).then(response => {
    response.map(data => authorMap.push({ name: data.firstName + "%20" + data.lastName }));

  })
const paramsConfig = {
    "/Authors/:name": authorMap,
  };
  return (
    new Sitemap(router)
      .applyParams(paramsConfig)
      .build(domain)
      .save("./public/authorsitemap.xml")
  );
}
async function generateConceptClusterSiteMap() {
  let conceptClusterMap = []
  await ConceptCluster.findAll({ attributes: ['name'] }).then(response => {
    response.map(data => conceptClusterMap.push({ name: data.name }));
  })
  const paramsConfig = {
    "/Concept-Clusters/:name": conceptClusterMap,
  };
  return (
    new Sitemap(router)
      .applyParams(paramsConfig)
      .build(domain)
      .save("./public/conceptclustersitemap.xml")
  );
}
async function generateAuthorGroupSiteMap() {
  let authorGroupMap = []
  await AuthorGroups.findAll({}).then(response => {
    response.map(data => authorGroupMap.push({ name: data.name }));
  })
  const paramsConfig = {
    "/Author-Groups/:name": authorGroupMap,

  };



  return (
    new Sitemap(router)
      .applyParams(paramsConfig)
      .build(domain)
      .save("./public/authorgroupsitemap.xml")
  );
}
async function generatePerspectiveSiteMap() {
  let perspectiveMap = []
  await Perspective.findAll({}).then(response => {
    response.map(data => perspectiveMap.push({ id: data.id }));
 })
  let idMap = [{ id: 1 }, { id: 2 }];
  const paramsConfig = {
    "/perspective/:id": perspectiveMap,

  };



  return (
    new Sitemap(router)
      .applyParams(paramsConfig)
      .build(domain)
      .save("./public/perspectivesitemap.xml")
  );
}
async function generateSitemap()
{
  await generateConceptSitemap();
  await generateAuthorSiteMap()
  await generateConceptClusterSiteMap()
  await generateAuthorGroupSiteMap()
  await generatePerspectiveSiteMap();
  console.log(" SiteMap Generated Successfully !!!!")

}


generateSitemap()
