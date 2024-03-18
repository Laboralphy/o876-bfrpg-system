const {v4: uuidv4} = require("uuid");

function getId () {
    return uuidv4({}, null, 0)
}

module.exports = {
    getId
}
