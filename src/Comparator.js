const CONSTS = require('./consts')
const { DEFAULT_ACTION_WEAPON, DEFAULT_ACTION_UNARMED } = require('./data/default-actions.json')
const ppcm = require('./libs/ppcm')

/**
 * @typedef DamagePerTypeRegistry {{[p: string]: number}}
 *
 * @typedef WeaponOrActionStats {Object}
 * @property dpt {number} average amount of damage that can deliver this weapon or action
 * @property attack {number} attack bonus when using this weapon or action
 * @property ac {number} target armor class when attacker uses this weapon or action
 * @property hp {number}
 * @property toHit {number}
 * @property turn {number}
 */

class Comparator {
    /**
     * Configure un attack outcome avec target et attacker
     * @param oAttacker {Creature}
     * @param oDefender {Creature}
     * @param oDefault {*}
     * @returns {BFAttackOutcome}
     */
    static configAttackOutcome(oAttacker, oDefender, oDefault = {}) {
        if (!oAttacker || !oDefender) {
            throw new Error('target or attacker not specified')
        }
        return oAttacker._createAttackOutcome({
            attacker: oAttacker,
            target: oDefender,
            ...oDefault
        })
    }

    /**
     * Estime les dégats infligés par une attaque à partir de l'attack outcome spécifié
     * @param oAttackOutcome {BFAttackOutcome}
     * @returns {WeaponOrActionStats}
     * @private
     */
    static extractDamagesFromOutcome (oAttackOutcome) {
        oAttackOutcome.hit = true
        const oAttacker = oAttackOutcome.attacker
        const oDefender = oAttackOutcome.target
        oAttacker.dice.cheat('avg')
        oDefender.dice.cheat('avg')
        const { types: damageTypes } = oAttacker.rollDamage(oAttackOutcome)
        const oDamageMitigation = oDefender.getters.getDamageMitigation
        oAttacker.dice.cheat(false)
        oDefender.dice.cheat(false)
        const dpt = Comparator.computeMitigatedDamage(damageTypes, oDamageMitigation)
        const atk = oAttackOutcome.bonus
        const ac = oAttackOutcome.ac
        const hp = oAttackOutcome.target.getters.getHitPoints
        const { toHit, turns } = Comparator.computeTurnsToKill(dpt, atk, ac, hp)
        return {
            attack: atk,
            targetAC: oAttackOutcome.ac,
            targetHP: hp,
            dpt,
            toHit,
            turns
        }
    }

    /**
     * Renvoie la somme de toutes les valeurs de l'objet spécifié
     * @param oObject
     * @returns {number}
     */
    static getObjectValueSum (oObject) {
        return Object
            .values(oObject)
            .reduce((prev, curr) => curr + prev, 0)
    }

    /**
     * Renvoie les dégâts moyens occasionnés par une action spécifiée contre un adversaire donné
     * @param oAttacker {Creature}
     * @param oDefender {Creature}
     * @param action {BFStoreStateAction}
     * @returns {WeaponOrActionStats}
     */
    static getActionStats (oAttacker, oDefender, action) {
        if (!action) {
            throw new Error('this action is undefined')
        }
        const oAttackOutcome = Comparator.configAttackOutcome(oAttacker, oDefender,  {
            action
        })
        oAttacker._attackUsingAction(oAttackOutcome)
        return Comparator.extractDamagesFromOutcome(oAttackOutcome)
    }

    /**
     * Renvoie les dégâts moyen occasionné par l'arme actuellement équipée et selectionnée
     * @param oAttacker {Creature}
     * @param oDefender {Creature}
     * @returns {WeaponOrActionStats|null}
     */
    static getWeaponStats (oAttacker, oDefender) {
        const oAttackOutcome = Comparator.configAttackOutcome(oAttacker, oDefender, {
            action: DEFAULT_ACTION_WEAPON
        })
        oAttacker._attackUsingWeapon(oAttackOutcome)
        if (!oAttackOutcome.weapon) {
            return null
        }
        return Comparator.extractDamagesFromOutcome(oAttackOutcome)
    }

    /**
     * Revoie les dégâts moyen de l'arme de mélée actuellement équipée
     * Renvoie null s'il n'y a pas d'arme de mélée equipée
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats|null}
     */
    static getMeleeWeaponStats (c, d) {
        if (!c.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]) {
            return null
        }
        c.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        return Comparator.getWeaponStats(c, d)
    }

    /**
     * Renvoie les dégâts moyens d'une attaque non armée
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats}
     */
    static getUnarmedStats (c, d) {
        return Comparator.getActionStats(c, d, DEFAULT_ACTION_UNARMED)
    }

    /**
     * Renvoie les dégâts moyens de l'arme à distance actuellement équippée
     * Renvoie null si on n'est pas equipé d'arme de melée
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats|null}
     */
    static getRangedWeaponStats (c, d) {
        if (!c.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]) {
            return null
        }
        c.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        return Comparator.getWeaponStats(c, d)
    }

    static avg (aObjects, key) {
        let n = 0
        for (const oObject of aObjects) {
            n += oObject[key]
        }
        return n / aObjects.length
    }

    /**
     * @param c {Creature}
     * @param d {Creature}
     * @param aActions {BFStoreStateAction[]}
     * @returns {WeaponOrActionStats|null}
     */
    static getActionListStats (c, d, aActions) {
        const aProcessedActions = aActions.map(a => {
            const action = Comparator.getActionStats(c, d, a)
            const blend = {
                cooldown: a.cooldown,
                _lastTime: 0,
                damage: action.dpt
            }
            return {
                action,
                blend
            }
        })
        if (aProcessedActions.length > 1) {
            const { amount } = Comparator.blendDPT(
                aProcessedActions.map(({ blend}) => blend)
            )
            return {
                ...aProcessedActions[0].action,
                dpt: amount,
            }
        } else if (aProcessedActions.length === 1) {
            return aProcessedActions[0].action
        } else {
            return null
        }
    }

    /**
     * Compute average damages of all melee actions
     *
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats|null}
     */
    static getAllMeleeActionsStats (c, d) {
        return Comparator.getActionListStats(c, d, c
            .getters
            .getMeleeActions
            .map(s => c.getters.getActions[s]))
    }

    /**
     * Compute average damages of all ranged actions
     *
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats|null}
     */
    static getAllRangedActionsStats (c, d) {
        return Comparator.getActionListStats(c, d, c
            .getters
            .getRangedActions
            .map(s => c.getters.getActions[s]))
    }

    /**
     * this function will blend all DPT and theirs cooldowns to get an average DPT
     * this returns the average amount, and the damage map (maximum damage done each turn)
     * @param aDPT {{ damage: number, cooldown: number, _lastTime: number }[]}
     * @return {{ amount: number, damageMap: number[] }}
     */
    static blendDPT (aDPT) {
        if (aDPT.length === 0) {
            return {
                damageMap: [],
                amount: 0
            }
        }
        if (aDPT.length === 1) {
            aDPT.push({ ...aDPT[0] })
        }
        // we need to compute PPCM to get an accurate number of turns
        const nPPCM = Math.max(aDPT.length, ppcm(...aDPT.map(({ cooldown }) => cooldown + 1)))
        aDPT.forEach(d => {
            d._lastTime = -Infinity
        })
        const a = []
        for (let i = 0; i < nPPCM; ++i) {
            const ai = aDPT
                .filter(d => i - d._lastTime >= d.cooldown)
                .sort((da, db) => da._lastTime - db._lastTime)
            if (ai.length === 0) {
                a.push(0)
            } else {
                if (ai[0].damage === undefined) {
                    console.error(ai)
                    throw new Error('ERR_UNDEFINED damage')
                }
                a.push(ai[0].damage)
                ai[0]._lastTime = i
            }
        }
        return {
            damageMap: a,
            amount: a.length > 0
                ? a.reduce((prev, curr) => prev + curr) / a.length
                : 0
        }
    }

    /**
     *
     * @param oDamageBonus {Object<string, number>}
     * @param oDamageMitigation {Object<string, BFOneDamageMitigation>}
     * @returns {number}
     */
    static computeMitigatedDamage (oDamageBonus, oDamageMitigation) {
        // pour chaque damage bonus, voir s'il existe une mitigation
        let nTotalDamage = 0
        for (const [sDamType, nDamage] of Object.entries(oDamageBonus)) {
            const { factor = 1, reduction = 0 } = sDamType in oDamageMitigation
                ? oDamageMitigation[sDamType]
                : { factor: 1, reduction: 0 }
            nTotalDamage += Math.max(0, factor * nDamage - reduction)
        }
        return nTotalDamage
    }

    /**
     * compute chance to hit target with atk and ac
     * @param nAtkBonus
     * @param nAdvAC
     * @returns {number}
     */
    static computeHitProbability (nAtkBonus, nAdvAC) {
        const nAtkDelta = nAdvAC - nAtkBonus
        let nProbToHit
        if (nAtkDelta >= 20) {
            nProbToHit = 5
        } else if (nAtkDelta <= 1) {
            nProbToHit = 95
        } else {
            // entre 2 et 19
            nProbToHit = (20 - nAtkDelta) * 5
        }
        return nProbToHit / 100
    }

    /**
     *
     * @param oAttacker
     * @param oTarget
     * @returns {{actions: {ranged: WeaponOrActionStats[], melee: WeaponOrActionStats[]}, weapons: {ranged: WeaponOrActionStats|null, melee: (WeaponOrActionStats|null)}}}
     */
    static gatherCreatureInformation (oAttacker, oTarget) {
        return {
            actions: {
                ranged: Comparator.getAllRangedActionsStats(oAttacker, oTarget),
                melee: Comparator.getAllMeleeActionsStats(oAttacker, oTarget)
            },
            weapons: {
                ranged: Comparator.getRangedWeaponStats(oAttacker, oTarget),
                melee: Comparator.getMeleeWeaponStats(oAttacker, oTarget)
            }
        }
    }

    /**
     * Compute number of turn to kill target using the given DPT, atk, hp...
     * @param nAttackerDPT {number}
     * @param nAttackerAtkBonus {number}
     * @param nTargetAC {number}
     * @param nTargetHP {number}
     * @return {{ toHit: number, turns: number }}
     */
    static computeTurnsToKill(nAttackerDPT, nAttackerAtkBonus, nTargetAC, nTargetHP) {
        const toHit = Comparator.computeHitProbability(nAttackerAtkBonus, nTargetAC)
        const turns = Math.ceil(nTargetHP / (nAttackerDPT * toHit))
        return {
            toHit,
            turns
        }
    }

    static considerHPLeft (nAttackerHP, nAttackerTurns, nTargetDPT, nTargetToHit) {
        const nHPPerTurn = nTargetDPT * nTargetToHit
        // Combien de HP vont être emportés le temps que vous mettez à terminer votre adversaire
        const nAdvDamages = nHPPerTurn === 0 ? 0 : Math.round(nAttackerTurns * nTargetDPT * nTargetToHit)
        return nAttackerHP - nAdvDamages
    }

    /**
     * @typedef ComparatorConsiderHP {object}
     * @property before {number} nombre de hp avant combat
     * @property after {number} nombre de hp après combat
     * @property lost {number} nombre de hp perdus
     * @property lost100 {number} ratio de hp perdu /hp max
     *
     * @typedef ComparatorConsiderAttackType {object}
     * @property toHit {number} probabilité de toucher
     * @property advDamage {number} dégâts moyen par tour
     * @property turns {number} nombre de tours nécessaires pour tuer l'adversaire
     * @property hp {ComparatorConsiderHP}
     *
     * @typedef ComparatorConsiderCombatType {{you : ComparatorConsiderAttackType, adv : ComparatorConsiderAttackType}}
     *
     * @typedef ComparatorConsiderResult {{ranged : ComparatorConsiderCombatType, melee : ComparatorConsiderCombatType}}
     *
     * @param c1 {Creature}
     * @param c2 {Creature}
     * @returns {ComparatorConsiderResult}
     */
    static consider (c1, c2) {
        /**
         * Takes 2 creatures and computes melee/ranged information gathering
         * competes info with HP data (curret and max)
         * @param creature1 {Creature}
         * @param creature2 {Creature}
         * @returns {{r: (*|WeaponOrActionStats[]), m: (*|WeaponOrActionStats[])}}
         */
        const f0 = (creature1, creature2) => {
            const info = Comparator.gatherCreatureInformation(creature1, creature2)
            const m = info.weapons.melee || info.actions.melee || Comparator.getUnarmedStats(creature1, creature2)
            const r = info.weapons.ranged || info.actions.ranged
            if (m) {
                m.hp = creature1.getters.getHitPoints
                m.hpmax = creature1.getters.getMaxHitPoints
            }
            if (r) {
                r.hp = creature1.getters.getHitPoints
                r.hpmax = creature1.getters.getMaxHitPoints
            }
            return { m, r }
        }

        /**
         * Takes 2 weaponORActionStats and computes a "considerHPLeft" to get how many HP is left with the
         * attackinbg creature.
         * @param x1 {WeaponOrActionStats}
         * @param x2 {WeaponOrActionStats}
         * @returns {{before: number, lost: number, lost100: number, after: number}|null}
         */
        const f1 = (x1, x2) => {
            if (x1 && x2) {
                const hp = x1.hp
                const hpmax = x1.hpmax
                const hp1left = Comparator.considerHPLeft(hp, x2.turns, x2.dpt, x2.toHit)
                const hp1lost = hp - hp1left
                const hp1lost100 = (hp - hp1left) / hpmax
                return {
                    before: hp,
                    after: hp1left,
                    lost: hp1lost,
                    lost100: hp1lost100
                }
            } else {
                return null
            }
        }

        /**
         * Takes 2 WeaponOrActionStats and compose a structure which enlights about how long a combat will last
         * @param x1 {WeaponOrActionStats}
         * @param x2 {WeaponOrActionStats}
         * @returns {{hp: ({before: number, lost: number, lost100: number, after: number}|null), dpt: (number|*|number), toHit: (number|*), turns: (number|*)}|null}
         */
        const f2 = (x1, x2) => {
            if (x1?.toHit === undefined) {
                return null
            } else {
                return {
                    toHit: x1?.toHit,
                    turns: x1?.turns,
                    dpt: x1?.dpt && Math.round(x1?.dpt * 10) / 10,
                    hp: f1(x1, x2)
                }
            }
        }
        const { m: m1, r: r1 } = f0(c1, c2)
        const { m: m2, r: r2 } = f0(c2, c1)
        return {
            melee: {
                you: f2(m1, m2),
                adv: f2(m2, m1)
            },
            ranged: {
                you: f2(r1, r2),
                adv: f2(r2, r1)
            }
        }
    }
}

module.exports = Comparator