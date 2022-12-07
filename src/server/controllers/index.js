const { chmodSync } = require("fs");
const model = require("../models");
const data = require("../../data");

/** The controlles duty is to pass the requests that arrived
 * from the API through the router to the model after validating the requests.
 */



async function populateDB(req, res) {
  if (!req.query.text) {
    const done = await data.populateDatabase();
    if (done) {
      res.status(201).json({ success: true, data: "Database populated." });
      return;
    }
  }

  else {
    res.status(500).json({
      error: true,
      data: "Somtething went wrong."
    });
  }
}




/**
 * @function getCountry
 * This function should get as a request a 2D point representing
 * a point in the real world as the -> @req parameter.
 * @res -> is the asnwer of the query.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {void}
 */
async function getCountry(req, res) {
  const query  = req.query;

  if (!query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text"
    });

    return;
  }

  try {

    const result = await model.getCountry(req.query);
    res.status(200).json({ success: true, data: result });

  } catch (err) {
    res.status(500).json({ success: false, error: "Get country failed -> Unknown error."});
  }
}



/**
 * @function getCountryFromName
 * This function should get as a request the 
 * name of the desired country as the -> @req parameter.
 * @res -> is the asnwer of the query.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {void}
 */
async function getCountryFromName(req, res) {
  const query  = req.query;

  if (!query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text"
    });

    return;
  }

  try {

    const result = await model.getCountryFromName(query);
    res.status(200).json({ success: true, data: result });

  } catch (err) {
    res.status(500).json({ success: false, error: `${query.text} wasn't found as a country in the database.`});
  }
}



/**
 * @function addCountry
 * This function adds a new country to the DB
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 */
async function addCountry(req, res) {

  const body = req.body;

  if (!body.name || !body.geometry || !body.geometry.type || !body.geometry.coordinates ) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter(s): 'name' or 'geo_shape'"
    });

    return;
  }

  try {

    const result = await model.insertNewCountry(body.name, body.geometry);
    res.json({ 
      success: true, 
      data: {
        id:   result.body._id,
        name: result.body.name,
        geoshape: result.body.geoshape
      } 
    });

  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to insert -> Unknown error."});
  }

}



/**
 * @function deleteCountry
 * This function removes a given country from the DB
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 */
async function deleteCountry(req, res) {

  const query  = req.query;

  if (!query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text"
    });

    return;
  }

  try {

    const result = await model.deleteCountry(query);
    res.json({ success: true, data: result });

  } catch (err) {
    res.status(500).json({ success: false, error: "Delete country failed -> Unknown error."});
  }

}

module.exports = {
  getCountry,
  getCountryFromName,
  addCountry,
  deleteCountry,
  populateDB
};