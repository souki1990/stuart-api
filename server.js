
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const couriers = require("./db/db");
const format = require("./util/format")
const swaggerOptions = require("./swagger/options");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const specs = swaggerJsDoc(swaggerOptions);

app.get(
    "/docs",
    swaggerUi.setup(specs, {
        explorer: true
    })
);
app.use("/docs", swaggerUi.serve);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => console.log(`listening on port ${port}`));

/**
 * @swagger
 *
 * /couriers/lookup:
 *   get:
 *     description: Return courier with a minium specified capacity
 *     parameters:
 *       - in: query
 *         name: capacity_required
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Couriers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 $loki:
 *                      type:integer
 *                      example:1
 *                 max_capacity:
 *                      type:integer
 *                      example:40
 *                 used_capacity:
 *                      type:integer
 *                      example:40
 *       400:
 *         description: Invalid Parameters Format
 */
app.get("/couriers/lookup", (req, res) => {
    const capacity_required = req.query.capacity_required;
    console.log(capacity_required);
    if (!format.validateCapacity(capacity_required)) {
        res.status(400).send("Invalid parameters format");
    }
    else {
        res.status(200).send({ data: couriers.where((courier) => ((courier.max_capacity - courier.used_capacity == capacity_required) || (courier.max_capacity - courier.used_capacity > capacity_required))) });
    }
});

/**
 * @swagger
 *
 * /couriers/:
 *   post:
 *     description: Create a new courier
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *             max_capacity:
 *               type: integer
 *               required: true
 *     responses:
 *       200:
 *         description: Courier added ccessfully
 *       400:
 *         description: Invalid parameter format
 */
app.post("/couriers", (req, res) => {
    const { max_capacity } = req.body;
    if (format.validateCapacity(max_capacity)) {
        couriers.insert({ max_capacity: max_capacity, used_capacity: 0 })
        res.sendStatus(200);
    }
    else {
        res.status(400).send("Invalid parameters format");

    }
});

/**
 * @swagger
 *
 * /couriers/:
 *   delete:
 *     description: Delete a courier
 *     parameters:
 *       - name: id
 *         description: ID of the courier
 *         in:  query
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Courier deleted successfully
 *       400:
 *         description: Invalid parameter format
 */
app.delete("/couriers", (req, res) => {
    couriers.remove({ $loki: req.query.id });
    res.sendStatus(200);
});

/**
 * @swagger
 *
 * /couriers/:
 *   put:
 *     description: Update a courier
 *     parameters:
 *       - name: max_capacity
 *         description: Max capacity of the courier
 *         required: false
 *         in: query
 *       - name: id
 *         description: ID of the courier
 *         required: true
 *         in: query
 *       - name: capacity
 *         description: Current capacity of the courier
 *         in:  query
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Courier updated successfully
 *       400:
 *         description: Invalid Parameters Format
 */
app.put("/couriers", (req, res) => {
    let { id, max_capacity, used_capacity } = req.query;
    id = Number(id);
    max_capacity = Number(max_capacity);
    used_capacity = Number(used_capacity);

    let validParams = (used_capacity ? format.validateCapacity(used_capacity) : true)
        && (max_capacity ? format.validateCapacity(max_capacity) : true)
        && ((used_capacity && max_capacity) ? (max_capacity > used_capacity) || (used_capacity == max_capacity) : true)
        && (used_capacity || max_capacity);

    if (validParams && id) {
        let courier = couriers.findOne({ $loki: id });
        console.log("courier", courier);
        if (!courier) {
            res.status(400).send("Courier not found");
        } else {
            courier.used_capacity = used_capacity ? used_capacity : courier.used_capacity;
            courier.max_capacity = max_capacity ? max_capacity : courier.max_capacity;
            couriers.update(courier);
            res.sendStatus(200);
        }
    }
    else {
        res.status(400).send("Invalid parameters");
    }
});




