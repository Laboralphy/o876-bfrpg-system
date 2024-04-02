const path = require('node:path')
const fs = require('node:fs')
const TreeSync = require('../src/libs/o876-xtree/sync')

const TYPES = {
    RAW: 'RAW',
    TYPE_KEY_BASED: 'TYPE_KEY_BASED',
    TYPE_SPREAD: 'TYPE_SPREAD',
    TYPE_UPPER_KEY_PREFIXED: 'TYPE_UPPER_KEY_PREFIXED',
    TYPE_GENERATE_CONSTS_PREFIXED: 'TYPE_GENERATE_CONSTS_PREFIXED'
}


function buildLine (sFile, sType) {
    switch (sType) {
        case TYPES.TYPE_KEY_BASED: {
            return '\'' + path.basename(sFile, path.extname(sFile)) + '\': require(\'./' + sFile + '\')'
        }

        case TYPES.TYPE_UPPER_KEY_PREFIXED: {
            return '\'' + process.argv[4] + '_' + path.basename(sFile, path.extname(sFile)).toUpperCase().replace(/-/g, '_') + '\': require(\'./' + sFile + '\')'
        }

        case TYPES.TYPE_GENERATE_CONSTS_PREFIXED: {
            const s = '"' + process.argv[4] + '_' + path.basename(sFile, path.extname(sFile)).toUpperCase().replace(/-/g, '_') + '"'
            return s + ': ' + s
        }

        case TYPES.TYPE_SPREAD: {
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
