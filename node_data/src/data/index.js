const elastic = require("../elastic");
const countries  = require("./formatted_countries.geo.json");
const formatter = require('./formatter');


/**
 * @function createESAction
 * @returns {{index: { _index: string, _type: string }}}
 * @description Returns an ElasticSearch Action in order to
 *              correctly index documents.
 */
const esAction = {
  index: {
    _index: elastic.index,
    _type: elastic.type
  }
};


/**
 * @function pupulateDatabase
 * @returns {void}
 */
async function populateDatabase() {
  // const isFormatterReady = await formatter.start();
  const isFormatterReady = true;
  if (isFormatterReady){
    const docs = [];

    for (const country of countries) {
      docs.push(esAction);
      docs.push(country);
    }
    await elastic.esclient.bulk({body: docs });
    return true;
  }
  return false
}

// elastic.esclient.count({
//   index: elastic.index
//   }).then(res => {
//     console.log(res.count);})
//     .catch(err => {
//       console.log(err)});

module.exports = {
  populateDatabase
};