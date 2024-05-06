const path = require('node:path')
const fs = require('node:fs')
const TreeSync = require('../src/libs/o876-xtree/sync')

const TYPES = {
    RAW: 'RAW',
    REQUIRE: 'REQUIRE',
    SPREAD: 'SPREAD',
    CONST_REQUIRE: 'CONST_REQUIRE',
    CONST_FILENAME: 'CONST_FILENAME'
}

function filenameToPrefixedConst (sFile, sPrefix) {
    return sPrefix.toUpperCase() + '_' + path.basename(sFile, path.extname(sFile)).toUpperCase().replace(/-/g, '_')
}

function buildLine (sFile, sType) {
    switch (sType) {
        case TYPES.REQUIRE: { // REQUIRE
            return '\'' + path.basename(sFile, path.extname(sFile)) + '\': require(\'./' + sFile + '\')'
        }

        case TYPES.CONST_REQUIRE: { // CONST_REQUIRE
            return '\'' + filenameToPrefixedConst(sFile, process.argv[4]) + '\': require(\'./' + sFile + '\')'
        }

        case TYPES.CONST_FILENAME: { // CONST_FILENAME
            const s = '"' + filenameToPrefixedConst(sFile, process.argv[4]) + '"'
            return s + ': ' + s
        }

        case TYPES.SPREAD: { // SPREAD
            return '...require(\'./' + sFile + '\')'
        }

        default: {
            console.error('allowed type (2nd param) are', Object.values(TYPES).join(', '))
        }
    }
}

function buildRequireIndex (sPath, sType) {
    const aRequires = TreeSync
        .tree(sPath)
        .filter(sFile => sFile !== 'index.js' && path.extname(sFile).match(/\.js(on)?$/))
        .map(sFile => buildLine(sFile, sType))
    const d = new Date()
    const aOutput = [
        '// AUTOMATIC GENERATION : DO NOT MODIFY !',
        '// Date : ' + d.toJSON(),
        '// List of files in ' + sPath,
        '',
        'module.exports = {',
        aRequires.map(s => '  ' + s).join(',\n'),
        '}'
    ]
    const sOutput = aOutput.join('\n')
    console.log(sOutput)
}

buildRequireIndex(process.argv[2], process.argv[3])
