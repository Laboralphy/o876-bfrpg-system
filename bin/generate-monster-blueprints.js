const { loadCSV } = require('../src/libs/load-csv')
const SmartData = require('../src/libs/smart-data')
const fs = require("fs");
const path = require("path");

function main() {
    const sd = new SmartData()
    const t = loadCSV(path.join(__dirname, 'monsters.csv'))
    const output = sd.run(t)
    console.log(output)
    output.forEach(o => {
        if (o.name) {
            fs
                .writeFileSync(
                    path.join(__dirname, './generated-blueprints', o.name + '.json'),
                    JSON.stringify(o, null, '  ')
                )
        }
    })
}

main()
