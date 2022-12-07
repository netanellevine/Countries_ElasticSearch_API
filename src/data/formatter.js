const fs = require("fs");
const data = require("./countries.geo.json");
const path = "./formatted_countries.geo.json"

const new_data = [];
// count = 0;
// var demo = 0;
function start(){
    return new Promise(async (resolve) => {
    for (const country of data){
        try {
            const to_write = {
                name: country.properties.name.toLowerCase(),
                geometry: {
                    type: country.geometry.type,
                    coordinates: country.geometry.coordinates
                }
            };
            // console.log(count++, ": ",  to_write);
            new_data.push(to_write);
            // break;
        }
        catch (err) {
            console.log("An error occured!");
            // console.log(country.id);
            // count++;
        }
    }
    try {
        fs.writeFileSync(path, JSON.stringify(new_data));
    } catch (error) {
        console.log("Something went wrong when writing to file!");
                console.log(error);
    }
    resolve(true);
});

}
// start();
module.exports = {
    start
};