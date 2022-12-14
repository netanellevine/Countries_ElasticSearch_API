const data = require("../../data");
const { esclient, index, type } = require("../../elastic");
var COUNT_DOCS = 0;

/** The controlles duty is to pass the requests that arrived
 * from the API through the router to the DB after validating the requests.
 */



/**
 * @function populateDB
 * This function populates the database with the 178 countries in the countries.geo.json file.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function populateDB(req, res) {
  if (!req.query.text) {
    esclient.count({index: index,type: type})
    .then(function (response) {
      COUNT_DOCS = response.body.count;
      if (COUNT_DOCS == 178) {
        res.status(403).json({success: false, status: 403, error: `${index} index is already populated.`});
        return;
      }
      const done = data.populateDatabase();
      if (done) {
        res.status(201).json({ success: true, status: 201, data: "Database populated." });
        return;
      }
    }, function (error) { 
    console.trace(error.message)
    }).catch((err) => {
    console.log("Elasticsearch ERROR - data not present");
    }); 
  }
  else {
    res.status(409).json({
      error: true,
      status: 409,
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
  esclient.count({index: index,type: type})
  .then(function (response) {
    COUNT_DOCS = response.body.count;
    if (COUNT_DOCS == 0) {
      res.status(403).json({success: false, status: 403, error: `${index} index is already clear.`});
      return;
    }
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
      res.status(200).json({success: true, status: 200, data: {values}});
    }, function (error) {
        console.trace(error.message)
      }).catch((err) => {
        console.log("Elasticsearch ERROR - data not present");
      });  
  }, function (error) {
      console.trace(error.message)
  }).catch((err) => {
      console.log("Elasticsearch ERROR - data not present");
  }); 
  } 



/**
 * @function getCount
 * This function returns the amount of documents in that index
 * @res -> is the asnwer of the query.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {void}
 */
async function getCount(req, res) {
  return esclient.count({index: index,type: type})
  .then(function (response) {
    COUNT_DOCS = response.body.count;
    res.status(200).json({success: true, status: 200, count: COUNT_DOCS});
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
    res.status(400).json({
      error: true,
      status: 400,
      data: "Missing required parameter: text"
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
    const amount = hits.total.value;
    if (amount == 0) throw TypeError;
    const data  = hits.hits.map((hit) => {
      return {
        id:     hit._id,
        country:  hit._source.name,
        type: hit._source.geometry.type,
      };
    });
    res.status(200).json({success: true, status: 200, amount, data});
}, function (error) {
    console.trace(error.message);
}).catch((err) => {
  res.status(404).json({ success: false, status: 404, error: "Get country failed -> couldn't find the country in the database."});
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
    res.status(400).json({
      error: true,
      status: 400,
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
    const amount = hits.total.value;
    if (amount == 0) throw TypeError;
    const data  = hits.hits.map((hit) => {
      return {
        id:     hit._id,
        country:  hit._source.name,
        type: hit._source.geometry.type,
      };
    });
    res.status(200).json({success: true, status: 200, amount, data});
}, function (error) {
    console.trace(error.message);
}).catch((err) => {
  res.status(404).json({ success: false, status: 404, error: "Get country failed -> couldn't find the country in the database."});
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
  const data  = {
        took:     response.body.took,
        timed_out: response.body.timed_out,
        amount: response.body.deleted,
        deleted: (response.body.deleted == 1),
        country:  req.body.name,
        message: `${req.body.name} removed from the index.`
    };
    if (response.body.deleted == 0) {
      data.message = `${req.body.name} was not removed from the index.`;
      res.status(400).json({success: false, status: 400, data});
    } else {
      res.status(200).json({success: true,  status: 200, data});
    }
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
      const data  = {
            index: response.body._index,
            type: response.body._type,
            id: response.body._id,
            result: response.body.result,
            sequence_number: response._seq_no,
            country:  req.body.name,
            message: `${req.body.name} sucessfully added to the index.`
        };
        if (response.body.result != 'created') {
          data.message = `${req.body.name} was not  sucessfully added to the index.`;
          res.status(400).json({success: false, status: 400, data});
        } else {
          res.status(201).json({success: true, status: 201, data});
        }
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
  getCount,
  deleteCountry,
  insertNewCountry
};