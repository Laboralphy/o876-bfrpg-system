const CONSTS = require('./consts')
const { DEFAULT_ACTION_WEAPON, DEFAULT_ACTION_UNARMED } = require('./data/default-actions.json')
const { shallowMap } = require("@laboralphy/object-fusion");
const ppcm = require('./libs/ppcm')

/**
 * @typedef DamagePerTypeRegistry {{[p: string]: number}}
 *
 * @typedef WeaponOrActionStats {{damages: number, damageTypes: DamagePerTypeRegistry}}
 */

class Comparator {
    /**
     * Configure un attack outcome avec target et attacker
     * @param oAttacker
     * @param oDefender
     * @param oDefault
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
     * Estime les dégat infligé par une attaque à partir de l'attack outcome spécifié
     * @param oAttackOutcome
     * @returns {DamagePerTypeRegistry}
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
        return shallowMap(damageTypes, ((n, sDamType) => sDamType in oDamageMitigation
                ? oDamageMitigation[sDamType].factor * n
                : n
        ))
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
        const oDamageTypes = Comparator.extractDamagesFromOutcome(oAttackOutcome)
        return {
            damageTypes: oDamageTypes,
            damages: Comparator.getObjectValueSum(oDamageTypes) * action.count
        }
    }

    /**
     * Renvoie les dégâts moyen occasionné par l'arme actuellement équipée et selectionnée
     * @param oAttacker {Creature}
     * @param oDefender {Creature}
     * @returns {WeaponOrActionStats}
     */
    static getWeaponStats (oAttacker, oDefender) {
        const oAttackOutcome = Comparator.configAttackOutcome(oAttacker, oDefender, {
            action: DEFAULT_ACTION_WEAPON
        })
        oAttacker._attackUsingWeapon(oAttackOutcome)
        if (!oAttackOutcome.weapon) {
            return {
                damageTypes: {},
                damages: 0
            }
        }
        const oDamageTypes = Comparator.extractDamagesFromOutcome(oAttackOutcome)
        return {
            damageTypes: oDamageTypes,
            damages: Comparator.getObjectValueSum(oDamageTypes)
        }
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






























    /**
     * compute chance to hit target with atk and ac
     * @param nAtkBonus
     * @param nAdvAC
     * @returns {number}
     */
    static computeHitProbability (nAtkBonus, nAdvAC) {
        const nAtkDelta = nAdvAC - nAtkBonus
        let nProbToHit = 0
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

    static computeDamagePerTurn(nChanceToHit, nAverageDamage, nAttackCount) {
        return nChanceToHit * nAverageDamage * nAttackCount
    }

    /**
     * @typedef ComparatorTTK {object}
     * @property hp {number}
     * @property ac {number}
     * @property damageMitigation {Object<string, D20OneDamageMitigation>}
     * @property atk {number}
     * @property atkCount {number}
     * @property damages {Object<string, number>}
     *
     *
     *
     * @param adv {ComparatorTTK}
     * @param you {ComparatorTTK}
     * @return {*}
     */
    static computeTurnsToKill({ adv, you }) {
        const hp = adv.hp
        const tohit = Comparator.computeHitProbability(you.atk, adv.ac)
        const dpa = Comparator.computeMitigatedDamage(you.damages, adv.damageMitigation)
        const apt = you.atkCount
        const dpt = Comparator.computeDamagePerTurn(tohit, dpa, apt)
        const attacks = Math.ceil(hp / (tohit * dpa))
        const turns = Math.ceil(hp / dpt)
        return {
            hasWeapon: !!you.weapon,
            tohit,
            dpa,
            dpt,
            hp,
            apt,
            turns,
            attacks
        }
    }




    static getAllMeleeActionsStats (c, d) {
        const aMeleeActions = c
            .getters
            .getMeleeActions
            .map(s => c.getters.getActions[s])
        const aActions = aMeleeActions.map(a => {
            return {
                ...Comparator.getActionStats(c, d, a),
                cooldown: a.cooldown
            }
        })
        return {
            actions: aActions,
            ...Comparator.blendDPT(aActions)
        }
    }

    static getAllRangedActionsStats (c, d) {
        const aRangedActions = c
            .getters
            .getRangedActions
            .map(s => c.getters.getActions[s])
        const aActions = aRangedActions.map(a => ({
            ...Comparator.getActionStats(c, d, a),
            cooldown: a.cooldown
        }))
        return {
            actions: aActions,
            ...Comparator.blendDPT(aActions)
        }
    }
    /**
     *
     * @param aDPT {{ damages: number, cooldown: number, _lastTime: number }[]}
     */
    static blendDPT (aDPT) {
        const nPPCM = Math.max(aDPT.length, ppcm(...aDPT.map(({ cooldown }) => cooldown + 1)))
        aDPT.forEach(d => {
            d._lastTime = -Infinity
        })
        let time = 0
        const a = []
        for (let i = 0; i < nPPCM; ++i) {
            const ai = aDPT
                .filter(d => i - d._lastTime >= d.cooldown)
                .sort((da, db) => da._lastTime - db._lastTime)
            if (ai.length === 0) {
                a.push(0)
            } else {
                a.push(ai[0].damages)
                ai[0]._lastTime = i
            }
        }
        return {
            damageMap: a,
            mean: a.length > 0
                ? a.reduce((prev, curr) => prev + curr) / a.length
                : 0
        }
    }

    static getWeaponActionStatus (c) {
        return {
            action: {
                ranged: c.getters.getRangedActions.length > 0,
                melee: c.getters.getMeleeActions.length > 0,
            },
            weapon: {
                ranged: c.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED] !== null,
                melee: c.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE] !== null
            }
        }
    }

    static considerP1 (you, adv) {
        const r = {
            you: Comparator.getWeaponActionStatus(you),
            adv: Comparator.getWeaponActionStatus(adv)
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

    static considerHPLeft (you, adv) {
        const youHP = adv.hp
        const advHP = you.hp
        // Combien de HP vont être emportés le temps que vous mettez à terminer votre adversaire
        const nTurns = you.turns
        const nAdvDamages = nTurns * adv.dpt
        return youHP - nAdvDamages
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
        const cc1 = Comparator.considerP1(c1, c2)
        const cc2 = Comparator.considerP1(c2, c1)
        const c1MeleeHPLeft = Comparator.considerHPLeft(cc1.melee, cc2.melee)
        const c2MeleeHPLeft = Comparator.considerHPLeft(cc2.melee, cc1.melee)
        const c1RangedHPLeft = Comparator.considerHPLeft(cc1.ranged, cc2.ranged)
        const c2RangedHPLeft = Comparator.considerHPLeft(cc2.ranged, cc1.ranged)
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