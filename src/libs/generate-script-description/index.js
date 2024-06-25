const path = require('node:path')
const fs = require('node:fs')
const TreeSync = require('../o876-xtree/sync')

/**
 * Will process a script content
 * @param sContent
 * @returns {{parameters: {name:string, type:string, description: string}[], description: string[]}}
 */
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
    return aDescription.length > 0
        ? {
            description: aDescription,
            parameters: aVars
        }
        : null
}

/**
 * Will process all scripts in specified directory
 * @param aPaths {string} path to script - scripts are scanned recursively
 * @returns {{parameters : {name:string, type:string, description: string}[], description: string[], script: string}[]}
 */
function processScripts (...aPaths) {
    const oResult = {}
    aPaths.forEach(sPath => {
        const x = Object.fromEntries(TreeSync
            .tree(sPath)
            .filter(sFile => sFile !== 'index.js' && path.extname(sFile).match(/\.js$/))
            .map(sFile => {
                const sContent = fs.readFileSync(path.join(sPath, sFile)).toString()
                return [
                    path.basename(sFile, '.js'),
                    processContent(sContent)
                ]
            })
            .filter(([, oDescription]) => !!oDescription)
        )
        Object.assign(oResult, x)
    })
    return oResult
}

module.exports = {
    processScripts
}