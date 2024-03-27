const fs = require('fs/promises')
const path = require('path');

const EXTENSION_JS = '.js'
const EXTENSION_JSON = '.json'

class TreeAsync {
    static async exists (sPath) {
        try {
            return !!await fs.stat(sPath)
        } catch (e) {
            return false
        }
    }

    static async ls (sPath) {
        const list = await fs.readdir(sPath, {
            withFileTypes: true
        })
        return list.map(f => ({
            name: f.name,
            dir: f.isDirectory()
        }))
    }

    static async tree (sPath) {
        const aFiles = await TreeAsync.ls(sPath)
        const aEntries = []
        for (let i = 0, l = aFiles.length; i < l; ++i) {
            const { name, dir } = aFiles[i]
            if (dir) {
                const sDirName = path.join(sPath, name)
                const aSubList = await TreeAsync.tree(sDirName)
                aEntries.push(...aSubList.map(f => path.join(name, f)))
            } else {
                aEntries.push(name)
            }
        }
        return aEntries
    }

    /**
     * @typedef FormatTreeStruct {Object<string, Object>}
     *
     *
     * @param aTree
     * @param sBasePath
     * @param bRemovePath
     * @returns {Promise<FormatTreeStruct>}
     */
    static async formatTree (aTree, sBasePath = '', bRemovePath = false) {
        const t1 = aTree.filter(x => x.endsWith(EXTENSION_JS) || x.endsWith(EXTENSION_JSON)).map(x => {
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
        t1.forEach(({ id, module: m }) => {
            t3[id] = m
        })
        return t3
    }

    /**
     *
     * @param sBasePath
     * @param bRemovePath
     * @returns {Promise<FormatTreeStruct>[]|Promise<FormatTreeStruct>}
     */
    static async recursiveRequire (sBasePath = '.', bRemovePath = false) {
        if (Array.isArray(sBasePath)) {
            const prr = sBasePath
                .map(s => TreeAsync.recursiveRequire(s, bRemovePath))
            const rr = await Promise.all(prr)
            return rr.flat()
        }
        const t1 = await TreeAsync.tree(sBasePath)
        return TreeAsync.formatTree(t1, sBasePath, bRemovePath)
    }
}

module.exports = TreeAsync
