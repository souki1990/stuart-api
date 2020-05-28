const loki = require("lokijs");
const db = new loki("courier.json");

const couriers = db.addCollection("couriers");
couriers.insert(
    [...Array(15)].map(() => {
        let random = Math.round(Math.random() * 100);
        return {
            max_capacity: random,
            capacity: random
        }
    })
);
db.saveDatabase();
module.exports = couriers;
