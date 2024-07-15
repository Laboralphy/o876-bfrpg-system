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
        const oAttackOutcome = Comparator.configAttackOutcome(oAttacker, oDefender,  {
            action
        })
        oAttacker._attackUsingAction(oAttackOutcome)
        return  Comparator.extractDamagesFromOutcome(oAttackOutcome)
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
            return Comparator.getUnarmedStats(c, d)
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
        c.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        return Comparator.getActionStats(c, d, DEFAULT_ACTION_UNARMED)
    }

    /**
     * Renvoie les dégâts moyens de l'arme à distance actuellement équippée
     * Renvoie null si on n'est pas equipé d'arme de melée
     * @param c {Creature}
     * @param d {Creature}
     * @returns {WeaponOrActionStats}
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
     * @returns {{attackType: string, dpt: number}|null}
     */
    static getActionListStats (c, d, aActions) {
        const aProcessedActions = aActions.map(a => ({
            ...Comparator.getActionStats(c, d, a),
            cooldown: a.cooldown
        }))
        if (aProcessedActions.length > 1) {
            const { amount } = Comparator.blendDPT(
                aProcessedActions.map(({ dpt, cooldown }) => ({
                    damage: dpt,
                    cooldown: cooldown,
                    _lastTime: 0,
                }))
            )
            return {
                ...aProcessedActions[0],
                dpt: amount,
            }
        } else {
            return null
        }
    }

    /**
     * Compute average damages of all melee actions
     *
     * @param c {Creature}
     * @param d {Creature}
     * @returns {{ amount: number, damageMap: [], actions: { damage: number, cooldown: number}[] } }
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
     * @returns {{ amount: number, damageMap: [], actions: { damage: number, cooldown: number}[] } }
     */
    static getAllRangedActionsStats (c, d) {
        return Comparator.getActionListStats(c, d, c
            .getters
            .getRangedActions
            .map(s => c.getters.getActions[s]))
    }

    /**
     *
     * @param aDPT {{ damage: number, cooldown: number, _lastTime: number }[]}
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
                    console.log(ai)
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
        const turns = Math.ceil(nTargetHP / nAttackerDPT)
        return {
            toHit,
            turns
        }
    }

    static considerP2 (oAttackingCreature, oTargetCreature) {
    }





    static considerP1 (oAttackingCreature, oTargetCreature) {





        const r = {
            attacker: Comparator.getWeaponActionStatus(oAttackingCreature),
            target: Comparator.getWeaponActionStatus(oTargetCreature)
        }
        const ryou = r.you.weapon.ranged
            ? Comparator.getRangedWeaponStats(you, adv)
            : r.you.action.ranged
                ? Comparator.getAllRangedActionsStats(you, adv)
                : null
        const radv = r.adv.weapon.ranged
            ? Comparator.getRangedWeaponStats(adv, you)
            : r.adv.action.ranged
                ? Comparator.getAllRangedActionsStats(adv, you)
                : null
        const ranged = ryou
            ? Comparator.computeTurnsToKill({
                you: ryou,
                adv: radv
            })
            : null
        const melee = Comparator.computeTurnsToKill({
            you: r.you.weapon.melee
                ? Comparator.getMeleeWeaponStats(you, adv)
                : r.you.action.melee
                    ? Comparator.getAllMeleeActionsStats(you, adv)
                    : Comparator.getUnarmedStats(you, adv), // unarmed
            adv: r.adv.weapon.melee
                ? Comparator.getMeleeWeaponStats(adv, you)
                : r.adv.action.melee
                    ? Comparator.getAllMeleeActionsStats(adv, you)
                    : Comparator.getUnarmedStats(adv, you)
        })
        return {
            melee,
            ranged
        }
    }

    static considerHPLeft (nAttackerHP, nAttackerTurns, nTargetDPT, nTargetToHit) {
        // Combien de HP vont être emportés le temps que vous mettez à terminer votre adversaire
        const nAdvDamages = nAttackerTurns * nTargetDPT * nTargetToHit
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
     * @property hasWeapon {boolean} true si une arme est utilisée pour ce type d'attaque
     *
     * @typedef ComparatorConsiderCombatType {{you : ComparatorConsiderAttackType, adv : ComparatorConsiderAttackType}}
     *
     * @typedef ComparatorConsiderResult {{ranged: ComparatorConsiderCombatType, melee: ComparatorConsiderCombatType}}
     *
     * @param c1 {Creature}
     * @param c2 {Creature}
     * @returns {ComparatorConsiderResult}
     */
    static consider (c1, c2) {
        const info1 = Comparator.gatherCreatureInformation(c1, c2)
        const c1melee = info1.weapons.melee || info1.actions.melee
        const c1ranged = info1.weapon.ranged || info1.actions.ranged
        const info2 = Comparator.gatherCreatureInformation(c2, c1)
        const c2melee = info2.weapons.melee || info2.actions.melee
        const c2ranged = info2.weapon.ranged || info2.actions.ranged
        const c1MeleeHPLeft = Comparator.considerHPLeft(c2melee.targetHP,  c1.getters.getHitPoints, c1melee.turns, nTargetDPT, nTargetToHit        c1melee, c2melee)
        const c2MeleeHPLeft = Comparator.considerHPLeft(c2melee, c1melee)
        const c1RangedHPLeft = Comparator.considerHPLeft(c1ranged, c2ranged)
        const c2RangedHPLeft = Comparator.considerHPLeft(c2ranged, c1ranged)
        /*
            tohit,
            dpa,
            dpt,
            hp,
            apt,
            turns,
            attacks
         */
        const c1hpmax = c1.getters.getMaxHitPoints
        const c1hp = c1.getters.getHitPoints
        const c2hpmax = c2.getters.getMaxHitPoints
        const c2hp = c2.getters.getHitPoints
        return {
            melee: {
                you: {
                    toHit: cc1.melee.tohit,
                    turns: cc1.melee.turns,
                    dpt: cc1.melee.dpt,
                    hp: {
                        before: c1hp,
                        after: c1MeleeHPLeft,
                        lost: c1hp - c1MeleeHPLeft,
                        lost100: (c1hp - c1MeleeHPLeft) / c1hpmax
                    },
                    hasWeapon: cc1.melee.hasWeapon
                },
                adv: {
                    toHit: cc2.melee.tohit,
                    turns: cc2.melee.turns,
                    dpt: cc2.melee.dpt,
                    hp: {
                        before: c2hp,
                        after: c2MeleeHPLeft,
                        lost: c2hp - c2MeleeHPLeft,
                        lost100: (c2hp - c2MeleeHPLeft) / c2hpmax,
                    },
                    hasWeapon: cc2.melee.hasWeapon
                }
            },
            ranged: {
                you: {
                    toHit: cc1.ranged.tohit,
                    turns: cc1.ranged.turns,
                    dpt: cc1.ranged.dpt,
                    hp: {
                        before: c1hp,
                        after: c1RangedHPLeft,
                        lost: c1hp - c1RangedHPLeft,
                        lost100: (c1hp - c1RangedHPLeft) / c1hpmax
                    },
                    hasWeapon: cc1.ranged.hasWeapon
                },
                adv: {
                    toHit: cc2.ranged.tohit,
                    turns: cc2.ranged.turns,
                    dpt: cc2.ranged.dpt,
                    hp: {
                        before: c2hp,
                        after: c2RangedHPLeft,
                        lost: c2hp - c2RangedHPLeft,
                        lost100: (c2hp - c2RangedHPLeft) / c2hpmax
                    },
                    hasWeapon: cc2.ranged.hasWeapon
                }
            }
        }
    }
}

module.exports = Comparator