const path = require('node:path')
const fs = require('node:fs')
const TreeSync = require('../src/libs/o876-xtree/sync')

function getLastReturnTagOfFile (sFile) {
    const regType = /@returns? +(.*)$/
    return fs
        .readFileSync(sFile, { encoding: 'utf-8'})
        .split('\n')
        .filter(l => l.includes('@return'))
        .map(l => {
            const a = l.trim().match(regType)
            if (a) {
                return a[1]
            } else {
                return ''
            }
        })
        .filter(l => l !== '')
        .pop()
}

function generateGetterReturnType (aPaths) {
    const aProperties = aPaths.map(sPath => {
        return TreeSync.ls(sPath)
            .filter(f => f.name !== 'index.js')
            .map(f => path.basename(f.name, '.js'))
            .map(f => {
                const sFile = path.join(sPath, f) + '.js'
                const sType = getLastReturnTagOfFile(sFile)
                if (!sType) {
                    console.error('This file has no valid @return tag : ' + sFile)
                }
                return ' * @property ' + f + ' ' + sType
            })
    }).flat()
    aProperties.unshift( ' * @typedef BFStoreGetters {object}')
    aProperties.unshift( '/**')
    aProperties.push(' */')
    return aProperties.join('\n')
}

console.log(generateGetterReturnType(process.argv.slice(2)))