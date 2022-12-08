const express      = require("express");
const cors         = require("cors");
const bodyParser   = require("body-parser");
const API       = require("./routes/router");
                     require("dotenv").config();

const app  = express();
const port = process.env.NODE_PORT || 3000;


/**
 * @function startServer
 * @returns {void}
 * @description Starts the HTTP Express server.
 */
function startServer() {

  return  app.use(cors())
             .use(bodyParser.urlencoded({ extended: false }))
             .use(bodyParser.json())
             .use("/countries",API.app)
             .use((_req, res) => res.status(404).json({ success: false,error: "Route not found" }))
             .listen(port, () => console.log(`Server ready on port ${port}`));
}


module.exports = {
  startServer
};