const { Client } = require("@elastic/elasticsearch");
                   require("dotenv").config();

const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";
const esclient   = new Client({ node: elasticUrl });
const index      = "countries";
const type       = "_doc";



async function deleteIndex(){
  await esclient.indices.delete({index: index})
  .then(function(resp) {
    console.log("##################################################################");
    console.log("Deleting the index was successful");
    console.log(JSON.stringify(resp.body, null, 4));
    console.log("##################################################################");
  }, function(err) {
    console.log("##################################################################");
    console.error(`An error occurred while deleting the index`);
    console.error(err);
    console.log("##################################################################");
  });
}
/**
 * @function createIndex
 * @returns {void}
 * @description Creates an index in ElasticSearch.
 */

async function createIndex() {
  try {
    await esclient.indices.create({index: index });
    console.log("##################################################################");
    console.log(`Created index ${index}`);
    console.log("##################################################################");
  } catch (err) {
    esclient.indices.delete({index: index});
    console.log("##################################################################");
    console.error(`An error occurred while creating the index ${index}:`);
    console.error(err);
    console.log("##################################################################");

  }
}

/**
 * @function setMapping,
 * @returns {void}
 * @description Sets the mapping to the database.
 */

async function setMapping () {
  try {
    
    const schema = {
      "name": {type: "keyword"},
      "geometry": {type: "geo_shape"},
    };
    esclient.indices.putSettings
    await esclient.indices.putMapping({ 
      index, 
      type,
      include_type_name: true,
      body: { 
        properties: schema 
      } 
    })
    console.log("##################################################################");
    console.log("Mapping created successfully");
    console.log("##################################################################");
  
  } catch (err) {
    console.log("##################################################################");
    console.error("An error occurred while setting the quotes mapping:");
    console.error(err);
    console.log("##################################################################");
  }
}

/**
 * @function checkConnection
 * @returns {Promise<Boolean>}
 * @description Checks if the client is connected to ElasticSearch
 */

function checkConnection() {
  return new Promise(async (resolve) => {
    console.log("##################################################################");
    console.log("Checking connection to ElasticSearch...");
    console.log("##################################################################");
    let isConnected = false;

    while (!isConnected) {
      try {

        await esclient.cluster.health({});
        console.log("##################################################################");
        console.log("Successfully connected to ElasticSearch");
        console.log("##################################################################");
        isConnected = true;

      // eslint-disable-next-line no-empty
      } catch (_) {

      }
    }

    resolve(true);

  });
}

module.exports = {
  esclient,
  setMapping,
  checkConnection,
  createIndex,
  deleteIndex,
  index,
  type
};