const TreeAsync = require('./async')

async function main() {
    const t = await TreeAsync.recursiveRequire('../../libs/o876-xtree')
    console.log(t)
}

main().then(() => console.log('done'))