const path = require('node:path')
const fs = require('node:fs')
const TreeSync = require('../src/libs/o876-xtree/sync')
const util = require('node:util')

function processContent (sContent) {
    const aDescription = []
    const aVars = []
    let bDescribing = false
    sContent
        .split('\n')
        .forEach(s => {
            let r
            r = s.match(/^\s+\*\s+@description\s(.*)$/)
            if (r) {
                bDescribing = true
                aDescription.push(r[1])
                return
            }
            r = s.match(/^\s+\*\s+@var\s+(\S+)\s\{([^}]+)}\s+(.*)$/)
            if (r) {
                bDescribing = false
                aVars.push({
                    name: r[1],
                    type: r[2],
                    description: r[3]
                })
                return
            }
            r = s.match(/^\s+\*\s+(.*)$/)
            if (bDescribing && !!r) {
                aDescription.push(r[1])
            }
        })
    return {
        description: aDescription,
        variables: aVars
    }
}

function processScripts (sPath) {
    return TreeSync
        .tree(sPath)
        .filter(sFile => sFile !== 'index.js' && path.extname(sFile).match(/\.js$/))
        .map(sFile => {
            const sContent = fs.readFileSync(path.join(sPath, sFile)).toString()
            return {
                script: path.basename(sFile, '.js'),
                ...processContent(sContent)
            }
        })
}

function main (sPath) {
    console.log(util.inspect(processScripts(sPath), { depth: 5 }))
}

main(process.argv[2])