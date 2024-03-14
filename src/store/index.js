const getters = require('./getters')
const mutations = require('./mutations')
const buildState = require('./state')
const Store = require('@laboralphy/store')
const externals = require('../data')

function buildStore () {
    return new Store({
        state: buildState(),
        getters,
        mutations,
        externals
    })
}

module.exports = {
    buildStore
}