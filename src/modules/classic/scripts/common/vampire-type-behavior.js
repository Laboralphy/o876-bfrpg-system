/**
 * This behavior :
 * 1) check if target is charmed
 * 2) if not charmed then try to charm
 * 3) if charmed then attempt to drain level
 * 4) if not charmable, or too hard to charm then attack
 */
const {isCharmedByMe} = require('./is-charmed-by-me')

/**
 *
 * @param combat {Combat}
 * @param creature {Creature}
 * @param target {Creature}
 * @param charm {string}
 * @param drain {string}
 * @param attack {string}
 * @returns {string} action name
 */
function vampireTypeBehavior ({
    combat,
    creature,
    target,
    charm,
    drain,
    attack
}) {
    // target is charmed ?
    if (isCharmedByMe(target, creature)) {
        // yes : drain level plz
        return drain
    }
    // target no charmed : try to charm, if fail, then retry next odd-turn, if fail again, uses normal attack
    if (combat.turn % 2 === 0 && combat.turn < 5) {
        return charm
    }
    if (combat.nextActionName !== combat.defaultActionWeapon.name) {
        return attack
    }
}

module.exports = {
    vampireTypeBehavior
}