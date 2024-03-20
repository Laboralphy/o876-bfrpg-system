const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

function loadCSV (sFile) {
    return parse(fs
        .readFileSync(sFile)
        .toString(), {
        delimiter: ',',
        columns: false,
        skip_empty_lines: true
    })
}

module.exports = { loadCSV }
