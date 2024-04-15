const { loadCSV } = require('../src/libs/load-csv')
const SmartData = require('../src/libs/smart-data')
const fs = require("fs");
const path = require("path");
const CONSTS = require('../src/consts')

/**
 * Turns a string from camel case (lower case + dash) to snake case (uppercase + underscore)
 * @param s {string} input string as lower camel case
 * @returns {string} output string as snake case
 */
function toSNAKECASE (s) {
    return s.replace(/-/g, '_').toUpperCase()
}

/**
 * Search for a constant
 * @param sSearch {string}
 * @returns {*|string|string|number}
 */
function searchConst (sSearch) {
    if (Array.isArray(sSearch)) {
        return sSearch.map(s => searchConst(s))
    }
    if (typeof sSearch === "number") {
        return sSearch
    }
    let sSearchUpper = toSNAKECASE(sSearch)
    let sFound = Object.values(CONSTS).find(s => s.endsWith(sSearchUpper))
    if (sFound) {
        return sFound
    }
    sSearchUpper = '_' + toSNAKECASE(sSearch)
    sFound = Object.values(CONSTS).find(s => s.endsWith(sSearchUpper))
    return sFound === undefined ? sSearch : sFound
}

function changeDataConstants (data) {
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
            data[key] = searchConst(value)
        }
    })
}

function changeBlueprintConstants (oInput) {
    if (oInput.classType) {
        oInput.classType = searchConst('class-type-' + oInput.classType)
    } else {
        oInput.classType = CONSTS.CLASS_TYPE_MONSTER
    }
    if (oInput.saveAs?.classType) {
        oInput.saveAs.classType = searchConst('class-type-' + oInput.saveAs.classType)
    }
    if (oInput.specie) {
        oInput.specie = searchConst('specie-' + oInput.specie)
    }
    const modifiers = oInput.modifiers
    delete oInput.modifiers
    if (modifiers.hp) {
        oInput.properties.push({
            property: CONSTS.ITEM_PROPERTY_EXTRA_HITPOINTS,
            data: {
                value: modifiers.hp
            }
        })
    }
    if (modifiers.attack) {
        oInput.properties.push({
            property: CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
            data: {
                value: modifiers.attack
            }
        })
    }
    oInput.actions.forEach(action => {
        action.attackType = searchConst(action.attackType)
        action.conveys.forEach(convey => {
            changeDataConstants(convey.data)
        })
    })
    oInput.properties.forEach(ip => {
        ip.property = searchConst(ip.property.startsWith('ITEM_PROPERTY_')
            ? ip.property
            : 'item-property-' + ip.property
        )
        changeDataConstants(ip.data)
    })
    oInput.entityType = CONSTS.ENTITY_TYPE_ACTOR
    return oInput
}


function main() {
    const sd = new SmartData()
    const t = loadCSV(path.join(__dirname, 'monsters.csv'))
    const output = sd.run(t)
    output.forEach(o => {
        if (o.name) {
            fs
                .writeFileSync(
                    path.join(__dirname, './generated-blueprints', o.name + '.json'),
                    JSON.stringify(changeBlueprintConstants(o), null, '  ')
                )
        }
    })
}

main()
