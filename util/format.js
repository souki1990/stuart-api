

const format = {
    validateCapacity: (value) => {

        return !(Object.is(value, NaN) || isNaN(value, NaN) || value < 0)
    }
}

module.exports = format;