const { esclient, index, type } = require("../../elastic");

/** The model duty is to perform the requests sent from the controller
 *  in the database.
 */


async function getCountry(req) {
  const q = JSON.parse(req.text);

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

  const { body: { hits } } = await esclient.search({
    from:  req.page  || 0,
    size:  req.limit || 100,
    index: index, 
    type:  type,
    body:  query
  });

  const results = hits.total.value;

  const values  = hits.hits.map((hit) => {
    return {
      id:     hit._id,
      country:  hit._source.name,
      type: hit._source.geometry.type,
      score:  hit._score
    }
  });

  return {
    results,
    values
  }

}


async function getCountryFromName(req){
  const query = {
    query: {
      query_string: {
        query: (req.text + "").toLowerCase(),
        default_field: "name"
      }
    }
  }

  const { body: { hits } } = await esclient.search({
    from:  req.page  || 0,
    size:  req.limit || 100,
    index: index, 
    type:  type,
    body:  query
  });

  const results = hits.total.value;
  if (results == 0) {
    throw TypeError;
  }

  const values  = hits.hits.map((hit) => {
    return {
      id:     hit._id,
      country:  hit._source.name,
      type: hit._source.geometry.type,
      score:  hit._score
    }
  });

  // console.log("############################################################");
  // console.log("1 " + values);
  // console.log("2 " + values[0]);
  // console.log("3 " + values[0].country);
  // console.log("4 " + values[0].id);
  // console.log("############################################################");
  return {
    results,
    values
  }
}


async function insertNewCountry(name, geoshape) {
  return esclient.index({
    index,
    type,
    body: {
      name,
      geoshape
    }
  })
  .then(
    function(resp) {
    console.log(resp);
    },
    function(err) {
    console.trace(err.message);
    }
    );
}


async function deleteCountry(name) {
  var id = 0
  try {

    const result = await getCountryFromName(name);
    id = result.values[0].id

  } catch (err) {
    return { _id: id, result: 'not_exists', statusCode: 200, reason: `${name} wasn't found as a country in the database.` };
  }
  console.log("############################################################");
  console.log("1 " + id);
  // // console.log("2 " + id.values);
  // // console.log("3 " + id.values[0]);
  // // console.log("4 " + id.values[0].id);
  console.log("############################################################");
  let exists = false;
  if (id) {
    exists = await esclient.exists({index: index, type: type, id: id});
  }
  if (exists) {
    return await esclient.delete({
      index: index,
      type: type,
      id: id
    });
  }
  return { _id: id, result: 'not_exists', statusCode: 200, reason: 'Does not exist' };
}


module.exports = {
  getCountry,
  getCountryFromName,
  insertNewCountry,
  deleteCountry
}