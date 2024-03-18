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

    invokeEffectMethod (oEffect, sMethod, target, source) {
        const ee = this.getEffectEngine(oEffect.type)
        if (sMethod in ee) {
            return ee[sMethod]({ effect: oEffect, target, source })
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

    killEffect (oEffect, target, source) {
        this.setEffectDuration(oEffect, 0, target, source)
    }

    processEffect (oEffect, target, source) {
        if (target && source) {
            this.invokeEffectMethod(oEffect, 'mutate', target, source)
            this.setEffectDuration(oEffect, oEffect.duration - 1, target, source)
        } else {
            this.killEffect(oEffect, target, source)
        }
    }

    /**
     *
     * @param sType
     * @param amp {number | string}
     * @param oParams
     * @returns {BFEffect}
     */
    createEffect (sType, amp = 0, oParams = null) {
        const ept = this._effectPrograms[sType]
        if (ept) {
            const oEffect = {
                id: uuidv4({}, null, 0),
                type: sType,
                subtype: CONSTS.EFFECT_SUBTYPE_MAGICAL,
                amp,
                duration: 0,
                source: null,
                data: {}
            }
            if ('init' in ept) {
                ept.init(oEffect, oParams)
            }
            return oEffect
        } else {
            throw new Error('Unknown effect type : ' + sType)
        }
    }

    applyEffect(oEffect, target, duration = 0, source = null) {
        if (!source) {
            source = target
        }
        oEffect.duration = duration
        oEffect.source = source.id
        if (oEffect.duration > 0) {
            oEffect = target.mutations.addEffect({ effect: oEffect })
        } else {
            this.invokeEffectMethod(oEffect, 'mutate', target, source)
        }
        this._events.emit('effect-applied', {
            effect: oEffect,
            target,
            source
        })
        return oEffect
    }
}

module.exports = EffectProcessor