const CONSTS = require('../consts')

function init (oItemProperty, {
    effects,
    savingThrow = null,
    duration = 0,
    tags = [],
    stackingRule = CONSTS.EFFECT_STACKING_RULE_STACK
}) {
    const sType = typeof savingThrow
    switch (sType) {
        case 'string': {
            const sThreat = savingThrow
            savingThrow = {
                threat: sThreat
            }
            break
        }

        case 'object': {
            const oST = savingThrow || { savingThrow: '' }
            savingThrow = {
                adjustment: 0,
                ability: '',
                ...oST
            }
            break
        }
    }
    Object.assign(oItemProperty.data, {
        effects,
        savingThrow,
        duration,
        tags,
        stackingRule
    })
}

module.exports = {}