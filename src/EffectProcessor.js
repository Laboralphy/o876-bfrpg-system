const Events = require('node:events')
const { v4: uuidv4 } = require('uuid')
const CONSTS = require('./consts')
require('./effect.doc')

class EffectProcessor {
    constructor () {
        this._events = new Events()
        this._effectPrograms = {}
    }

    get events () {
        return this._events
    }

    get effectPrograms () {
        return this._effectPrograms
    }

    set effectPrograms (value) {
        this._effectPrograms = value
    }

    getEffectEngine (sType) {
        const ee = this._effectPrograms[sType]
        if (!ee) {
            throw new Error('Unknown effect type : ' + sType)
        }
        return ee
    }

    invokeEffectMethod (oEffect, sMethod, target, source, oParams = {}) {
        const ee = this.getEffectEngine(oEffect.type)
        if (sMethod in ee) {
            return ee[sMethod]({
                effect: oEffect,
                effectProcessor: this,
                target,
                source,
                ...oParams
            })
        }
        return undefined
    }

    setEffectDuration (oEffect, nDuration, target, source) {
        target.mutations.setEffectDuration({ effect: oEffect, duration: Math.max(0, nDuration) })
        if (nDuration <= 0) {
            this.invokeEffectMethod(oEffect, 'dispose', target, source)
            this._events.emit('effect-disposed', {
                effect: oEffect,
                target,
                source
            })
        }
    }

    removeEffect (oEffect, target, source) {
        const oEffectRegistry = target.getters.getEffectRegistry
        const aEffects = oEffect.siblings.length > 0
            ? oEffect
                .siblings
                .map(effId => effId in oEffectRegistry
                    ? oEffectRegistry[effId]
                    : null
                )
                .filter(eff => eff !== null)
            : [oEffect]
        aEffects.forEach(effect => {
            this.setEffectDuration(effect, 0, target, source)
        })
    }

    processEffect (oEffect, target, source) {
        if (target && source) {
            this.invokeEffectMethod(oEffect, 'mutate', target, source)
            this.setEffectDuration(oEffect, oEffect.duration - 1, target, source)
        } else {
            this.removeEffect(oEffect, target, source)
        }
    }

    /**
     *
     * @param sType
     * @param amp {number | string}
     * @param oParams
     * @returns {BFEffect}
     */
    createEffect (sType, amp = 0, oParams = {}) {
        const ept = this._effectPrograms[sType]
        if (ept) {
            const oEffect = {
                id: uuidv4({}, null, 0),
                type: sType,
                subtype: CONSTS.EFFECT_SUBTYPE_MAGICAL,
                amp,
                duration: 0,
                target: null,
                source: null,
                data: {},
                stackingRule: CONSTS.EFFECT_STACKING_RULE_STACK,
                siblings: [],
                tags: [],
                key: '' // Utiliser pour affiner les stacking rules
            }
            this.invokeEffectMethod(oEffect, 'init', null, null, oParams)
            // if ('init' in ept) {
            //     ept.init(oEffect, oParams)
            // }
            return oEffect
        } else {
            throw new Error('Unknown effect type : ' + sType + ' - maybe effectPrograms not initialized')
        }
    }

    _groupEffects (aEffects, tags = []) {
        const aSiblings = aEffects.map(({ id }) => id)
        aEffects.forEach(effect => {
            effect.siblings = aSiblings
            effect.tags.push(...tags)
        })
    }

    _forceArray (x) {
        return Array.isArray(x) ? x : [x]
    }

    applyEffectGroup (aEffects, tags, target, duration = 0, source = null) {
        this._groupEffects(aEffects, this._forceArray(tags))
        aEffects.forEach(effect => {
            this.applyEffect(effect, target, duration, source)
        })
    }

    /**
     * Return true if effect is rejected by immunity
     * @param oEffect {BFEffect}
     * @param target {Creature}
     */
    isImmuneToEffect (oEffect, target) {
        const aImmunitySet = target.getters.getImmunitySet
        switch (oEffect.type) {
            case CONSTS.EFFECT_STUN: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_STUN)
            }

            case CONSTS.EFFECT_PARALYSIS: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_PARALYSIS)
            }

            case CONSTS.EFFECT_DAZE: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_DAZED)
            }

            case CONSTS.EFFECT_BLINDNESS: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_BLINDNESS)
            }

            case CONSTS.EFFECT_CHARM: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_CHARM)
            }

            case CONSTS.EFFECT_NEGATIVE_LEVEL: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_NEGATIVE_LEVEL)
            }

            case CONSTS.EFFECT_DISEASE: {
                return aImmunitySet.has(CONSTS.IMMUNITY_TYPE_DISEASE)
            }

            case CONSTS.EFFECT_ABILITY_MODIFIER: {
                return oEffect.amp < 0 && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_ABILITY_DECREASE)
            }

            case CONSTS.EFFECT_ARMOR_CLASS_MODIFIER: {
                return oEffect.amp < 0 && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_AC_DECREASE)
            }

            case CONSTS.EFFECT_ATTACK_MODIFIER: {
                return oEffect.amp < 0 && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_ATTACK_DECREASE)
            }

            case CONSTS.EFFECT_DAMAGE_MODIFIER: {
                return oEffect.amp < 0 && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_DAMAGE_DECREASE)
            }

            case CONSTS.EFFECT_DEATH: {
                return oEffect.subtype === CONSTS.EFFECT_SUBTYPE_MAGICAL && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_DEATH)
            }

            case CONSTS.EFFECT_DAMAGE: {
                return oEffect.data.damageType === CONSTS.DAMAGE_TYPE_POISON && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_POISON)
            }

            case CONSTS.EFFECT_SPEED_FACTOR: {
                return (oEffect.amp === -Infinity && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_ENTANGLE)) ||
                    (oEffect.amp < 0 && oEffect.amp > -Infinity && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_SLOW))
            }

            case CONSTS.EFFECT_SAVING_THROW_MODIFIER: {
                return oEffect.amp < 0 && aImmunitySet.has(CONSTS.IMMUNITY_TYPE_SAVING_THROW_DECREASE)
            }

            default: {
                return false
            }
        }
    }

    static sameEffects (eff1, eff2) {
        return eff1.stackingRule === eff2.stackingRule &&
            eff1.type === eff2.type &&
            eff1.key === eff2.key
    }

    /**
     * This method apllies effect on target, and return the true applied effect
     * If the effect is rejected (immunity, stacking rules), the method returns null
     * @param oEffect
     * @param target
     * @param duration
     * @param source
     * @returns {*|null}
     */
    applyEffect(oEffect, target, duration = 0, source = null) {
        if (target.getters.isDead) {
            // ne pas affecter d'effet si la créature est morte
            return null
        }
        if (!source) {
            source = target
        }
        oEffect.duration = duration
        oEffect.source = source.id
        oEffect.target = target.id
        if (this.isImmuneToEffect(oEffect, target)) {
            this._events.emit('effect-immunity', { effect: oEffect, target })
            return null
        }
        if (oEffect.duration > 0) {
            switch (oEffect.stackingRule) {
                case CONSTS.EFFECT_STACKING_RULE_NO_STACK: {
                    // Will not replace same effect
                    if (!target.getters.getEffects.find(eff => EffectProcessor.sameEffects(eff, oEffect))) {
                        oEffect = target.mutations.addEffect({ effect: oEffect })
                    } else {
                        oEffect = null
                    }
                    break
                }

                case CONSTS.EFFECT_STACKING_RULE_REPLACE: {
                    const oOldEffect = target.getters.getEffects.find(eff => EffectProcessor.sameEffects(eff, oEffect))
                    if (oOldEffect) {
                        this.removeEffect(oOldEffect, target, source)
                        target.mutations.addEffect({ effect: oEffect })
                        oEffect = null
                    } else {
                        oEffect = target.mutations.addEffect({ effect: oEffect })
                    }
                    break
                }

                case CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION: {
                    const oOldEffect = target.getters.getEffects.find(eff => EffectProcessor.sameEffects(eff, oEffect))
                    if (oOldEffect) {
                        target.mutations.setEffectDuration({ effect: oOldEffect, duration: Math.max(oEffect.duration, oOldEffect.duration) })
                        oEffect = null
                    } else {
                        oEffect = target.mutations.addEffect({ effect: oEffect })
                    }
                    break
                }

                default: {
                    oEffect = target.mutations.addEffect({ effect: oEffect })
                    break
                }
            }
        } else {
            this.invokeEffectMethod(oEffect, 'mutate', target, source)
        }
        if (oEffect) {
            this._events.emit('effect-applied', {
                effect: oEffect,
                target,
                source
            })
        }
        return oEffect
    }
}

module.exports = EffectProcessor