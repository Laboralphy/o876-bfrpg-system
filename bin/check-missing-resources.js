const oStrings = {
    fr: {
        itemProperties: require('../src/public-assets/strings/fr/item-properties.json'),
        effects: require('../src/public-assets/strings/fr/effects.json')
    },
    en: {
        itemProperties: require('../src/public-assets/strings/en/item-properties.json'),
        effects: require('../src/public-assets/strings/en/effects.json')
    }
}

const oItemProperties = require('../src/item-properties')
const oEffects = require('../src/effects')

function getDifference(a1, a2) {
    const s1 = new Set(a1)
    const s2 = new Set(a2)
    return {
        in1notin2: a1.filter(x => !s2.has(x)),
        in2notin1: a2.filter(x => !s1.has(x))
    }
}

function check (o1, o2, s1, s2) {
    const x = getDifference(
        Object.keys(o1),
        Object.keys(o2)
    )
    if (x.in1notin2.length > 0) {
        console.log(s1, 'not in', s2, x.in1notin2)
    }
    if (x.in2notin1.length > 0) {
        console.log(s2, 'not in', s1, x.in2notin1)
    }
}

check(oItemProperties, oStrings.fr.itemProperties, 'item properties', 'item property strings (fr)')
check(oEffects, oStrings.fr.effects, 'effect', 'effect strings (fr)')
check(oItemProperties, oStrings.en.itemProperties, 'item properties', 'item property strings (en)')
check(oEffects, oStrings.en.effects, 'effect', 'effect strings (en)')
