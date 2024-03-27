const fs = require('fs')
const path = require('path');

const EXTENSION_JS = '.js'
const EXTENSION_JSON = '.json'

class TreeSync {
    static exists (sPath) {
        try {
            return !!fs.statSync(sPath)
        } catch (e) {
            return false
        }
    }

    static ls (sPath) {
        const list = fs.readdirSync(sPath, {
            withFileTypes: true
        })
        return list.map(f => ({
            name: f.name,
            dir: f.isDirectory()
        }))
    }

    static tree (sPath) {
        const aFiles = TreeSync.ls(sPath)
        const aEntries = []
        for (let i = 0, l = aFiles.length; i < l; ++i) {
            const { name, dir } = aFiles[i]
            if (dir) {
                const sDirName = path.join(sPath, name)
                const aSubList = TreeSync.tree(sDirName)
                aEntries.push(...aSubList.map(f => path.join(name, f)))
            } else {
                aEntries.push(name)
            }
        }
        return aEntries
    }

    static recursiveRequire (sBasePath, bRemovePath) {
        if (Array.isArray(sBasePath)) {
            return sBasePath
                .map(s => TreeSync.recursiveRequire(s, bRemovePath))
                .flat()
        }
        const t1 = TreeSync.tree(sBasePath)
        const t2 = t1.filter(x => x.endsWith(EXTENSION_JS) || x.endsWith(EXTENSION_JSON)).map(x => {
            const filename = x
            const dir = path.dirname(x)
            const oModule = require(path.resolve(sBasePath, filename))
            const name = x.endsWith(EXTENSION_JS)
                ? path.basename(filename, EXTENSION_JS)
                : path.basename(filename, EXTENSION_JSON)
            const id = bRemovePath ? name : path.posix.join(dir, name)
            return {
                id,
                module: oModule
            }
        })
        const t3 = {}
        t2.forEach(({ id, module: m }) => {
            t3[id] = m
        })
        return t3
    }
}

module.exports = TreeSync
