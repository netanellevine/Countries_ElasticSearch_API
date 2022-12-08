const { chmodSync } = require("fs");
const data = require("../../data");
const { esclient, index, type } = require("../../elastic");


/** The controlles duty is to pass the requests that arrived
 * from the API through the router to the DB after validating the requests.
 */



/**
 * @function populateDB
 * @param {*} req 
 * @param {*} res 
 * @returns 
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
 * @function clearIndex
 * This function clears all the documnets from this index.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function clearIndex (req, res, next) {
  return esclient.deleteByQuery({
    index: index,
    type: type,
    body: {
        query: {
            match_all: {}
        }
    }
}).then(function (response) {
  const values  = {
      took:     response.body.took,
      timed_out: response.body.timed_out,
      deleted: response.body.deleted,
      message: `${index} index cleared succsesfully.`
    };
  res.status(200).json({success: true, data: {values}});
}, function (error) {
    console.trace(error.message)
}).catch((err) => {
    console.log("Elasticsearch ERROR - data not present");
});   
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

  if (!req.query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text or body"
    });
    return;
  }
  const q = JSON.parse(req.query.text);
  const query = {
    query: {
      bool: {
         must: {
           match_all: {}
         },
         filter: {
           geo_shape: {
             geometry: {
               shape: {
                 type: "point",
                 coordinates:  [q.coordinates.lon, q.coordinates.lat]
               },
               relation: "contains"
             }
           }
         }
       }
     }
  }
  await esclient.search({
    index: index,
    type: type,
    body: query
}).then(function ({ body: { hits } }) {
    const results = hits.total.value;
    const values  = hits.hits.map((hit) => {
      return {
        id:     hit._id,
        country:  hit._source.name,
        type: hit._source.geometry.type,
        score:  hit._score
      };
    });
    res.status(200).json({success: true, data: {results, values}});
}, function (error) {
    console.trace(error.message);
}).catch((err) => {
  res.status(500).json({ success: false, error: "Get country failed -> Unknown error."});
});
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

  if (!req.query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text"
    });

    return;
  }

  const query = {
    query: {
      query_string: {
        query: (req.query.text + "").toLowerCase(),
        default_field: "name"
      }
    }
  }
  await esclient.search({
    index: index,
    type: type,
    body: query
}).then(function ({ body: { hits } }) {
    const results = hits.total.value;
    const values  = hits.hits.map((hit) => {
      return {
        id:     hit._id,
        country:  hit._source.name,
        type: hit._source.geometry.type,
        score:  hit._score
      };
    });
    res.status(200).json({success: true, data: {results, values}});
}, function (error) {
    console.trace(error.message);
}).catch((err) => {
  res.status(500).json({ success: false, error: "Get country failed -> Unknown error."});
});
}



/**
 * @function deleteCountry
 * This function deletes a document of a country give the country name.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteCountry (req, res, next) {
  return esclient.deleteByQuery({
      index: index,
      type: type,
      body: {
          query: {
              match: { "name": req.body.name }
          }
      }
}).then(function (response) {
  const values  = {
        took:     response.body.took,
        timed_out: response.body.timed_out,
        deleted: (response.body.deleted == 1),
        country:  req.body.name,
        message: `${req.body.name} removed from the index.`
    };
    res.status(200).json({success: true, data: {values}});
  }, function (error) {
      console.trace(error.message)
  }).catch((err) => {
      console.log("Elasticsearch ERROR - data not present");
  }); 
}



/**
 * @function insertNewCountry
 * This function adds a new country to the DB
 * @param {*} req -> The body must be json with a geojson format
 * @param {*} res 
 * @returns {void}
 */
async function insertNewCountry (req, res, next) {
  return esclient.index({
      index: index,
      type: type,
      body : {
            name: req.body.name,
            geometry: req.body.geometry
      }
    }).then(function (response) {
      const values  = {
            index: response.body._index,
            type: response.body._type,
            id: response.body._id,
            result: response.body.result,
            "sequence number": response._seq_no,
            country:  req.body.name,
            message: `${req.body.name} sucessfully added to the index.`
        };
        res.status(200).json({success: true, data: {values}});
  }, function (error) {
      console.trace(error.message)
  }).catch((err) => {
      console.log("Elasticsearch ERROR - data not fetched");
  }) 
}



module.exports = {
  populateDB,
  clearIndex,
  getCountry,
  getCountryFromName,
  deleteCountry,
  insertNewCountry
};