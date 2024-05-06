
function init (oItemProperty, { condition, savingThrow, savingAbility, duration }) {
    Object.assign(oItemProperty.data, {
        condition,
        savingThrow,
        savingAbility,
        duration
    })
}



module.exports = {}