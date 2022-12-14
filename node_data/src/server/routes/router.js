const express    = require("express");
const controller = require("../controllers/APIrequests");

const app = express();

    // Populate the database with the countries.geo.json
app.get('/data/start', (req, res) => {  
    controller.populateDB(req, res);
 });

    // Delete the entire index
app.get('/data/clear', (req, res) => { 
    controller.clearIndex(req, res);
 });
 
    // Get country grom a given point (as text not json)
app.get('/search/point', (req, res) => {  
    controller.getCountry(req, res);
 });

    // Get country grom a given name (as text not json)
 app.get('/search/name', (req, res) => {  
    controller.getCountryFromName(req, res);
 });

    // Get the amount of countries in the countries index
    app.get('/count', (req, res) => {  
    controller.getCount(req, res);
    });

    // Delete single country from a given name (as ajson body)
app.delete('/delete/data', (req, res) => {  
    controller.deleteCountry(req, res);
 });

    // Insert single country from a given json body
app.post('/insert/single/data', (req, res) => { 
    controller.insertNewCountry(req, res);
 });


module.exports = {
    app
};
