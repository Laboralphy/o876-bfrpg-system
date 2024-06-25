const { processScripts } = require('../src/libs/generate-script-description')
const util = require('node:util')

function main (sPath) {
    console.log(util.inspect(processScripts(sPath), { depth: 5 }))
}

main(process.argv[2])
