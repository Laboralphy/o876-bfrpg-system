const Events = require('node:events')
const { v4: uuidv4 } = require('uuid')
const EFFECTS = require('./effects')

class EffectProcessor {
    constructor () {
        this._events = new Events()
        this._horde = null
    }

    get horde () {
        return this._horde
    }

    set horde (value) {
        this._horde = value
    }

    getEffectEngine (sType) {
        const ee = EFFECTS[sType]
        if (!ee) {
            throw new Error('Unknown effect type : ' + sType)
        }
        return ee
    }

    getEffectTarget(oEffect) {
        return this._horde.creatures[oEffect.target]
    }

    getEffectSource(oEffect) {
        return this._horde.creatures[oEffect.source]
    }

    invokeEffectMethod (oEffect, sMethod) {
        const ee = this.getEffectEngine(oEffect.type)
        if (sMethod in ee) {
            const target = this.getEffectTarget(oEffect)
            const source = this.getEffectSource(oEffect)
            return ee[sMethod]({ effect: oEffect, target, source })
        }
        return undefined
    }

    processEffect (oEffect) {
        const target = this.getEffectTarget(oEffect)
        const source = this.getEffectSource(oEffect)
        if (target && source) {
            this.invokeEffectMethod(oEffect, 'mutate')
            const nNewDuration = oEffect.duration - 1
            target.store.mutations.setEffectDuration({ effect: oEffect, duration: nNewDuration })
            if (nNewDuration <= 0) {
                this.invokeEffectMethod(oEffect, 'dispose')
            }
        } else {
            // The effect has no source or target, look like someone got kicked from the horde
            // -> ending effect
            target.store.mutations.setEffectDuration({ effect: oEffect, duration: 0 })
            this.invokeEffectMethod(oEffect, 'dispose')
        }
    }

    createEffect (sType, oParams) {
        if (EFFECTS[sType]) {
            const oEffect = {
                id: uuidv4({}, null, 0),
                type: '',
                amp: 0,
                duration: 0,
                source: null,
                target: null,
                data: {}
            }
            EFFECTS[sType].create(oEffect, oParams)
            return oEffect
        } else {
            throw new Error('Unknown effect type : ' + sType)
        }
    }

    applyEffect(oEffect, target, duration = 0, source = null) {
        oEffect.target = target.id
        oEffect.duration = duration
        oEffect.source = (source || target).id
        if (oEffect.duration > 0) {
            target.store.mutations.addEffect({ effect: oEffect })
        } else {
            this.invokeEffectMethod(oEffect, 'mutate')
        }
        this._events.emit('effect-applied', {
            effect: oEffect
        })
    }
}

module.exports = EffectProcessor