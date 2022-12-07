const express    = require("express");
const controller = require("../controllers");
const routes     = express.Router();

routes.route("/country").get(controller.getCountry);
routes.route("/id").get(controller.getCountryFromName);
routes.route("/add").post(controller.addCountry);
routes.route("/delete").delete(controller.deleteCountry);
routes.route("/populate").get(controller.populateDB);
routes.route("/clear").get(controller.populateDB);

module.exports = routes;