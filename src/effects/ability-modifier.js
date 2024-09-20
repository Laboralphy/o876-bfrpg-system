function init ({ effect, ability }) {
    effect.data.ability = ability
    effect.key = ability
}

module.exports = {
    init
}