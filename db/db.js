const loki = require("lokijs");
const db = new loki("courier.json");

const couriers = db.addCollection("couriers");
couriers.insert(
    [...Array(15)].map(() => {
        return ({
            max_capacity: Math.round(Math.random() * 100),
            used_capacity: 0
        })
    })
);
db.saveDatabase();
module.exports = couriers;
