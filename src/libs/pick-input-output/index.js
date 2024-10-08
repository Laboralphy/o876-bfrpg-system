/**
 * Une classe spécialisée qui va chercher dans une structure la bonne valeur de sortie (output)
 * en fonction d'une valeur d'entrée (input)
 *
 * La structure "S" est idéalement un Array dont chaque élément "S[i]" possèdera deux propriétés exploitées par cette classe
 * - une propriété d'entrée, qui sera un tableau de une ou deux valeurs numériques (représentant une valeur min et max)
 * - une propriété de sortie de n'importe quel type.
 *
 * la fonction principale est getValue qui accepte une valeur numérique "X" comme paramètre
 * On recherchera parmi les S[i], l'élément ayant la propriété d'entrée dont les valeurs min/max incluent X
 * Si un tel élément est trouvé, getValue renvoi la valeur de la propriété de sortie.
 *
 * Structure d'exemple
 * const data = [
 *     {
 *         inputValues: [ 1, 3 ],
 *         outputValue: 10
 *     },
 *     {
 *         inputValues: [ 4 ],
 *         outputValue: 20
 *     },
 *     {
 *          inputValues: [ 5, 10 ],
 *          outputValue: 30
 *     }
 * ]
 * dans cet exemple on construit l'instance ainsi : new PickInputOutput(data, 'inputValues', 'outputValue')
 *
 * un appel à    renvoie
 * -----------   -------
 * getValue(1)   10
 * getValue(2)   10
 * getValue(3)   10
 * getValue(4)   20
 * getValue(5)   30
 * getValue(6)   30
 * ...
 * getValue(10)  30
 */
class PickInputOutput {
    constructor (data, input, output) {
        this._checkAllItems(data, input, output)
        this._input = input
        this._output = output
        this._data = data
        this._minInputValue = this._getMinNumArray(data.map(({ [input]: [min] }) => min))
        this._maxInputValue = this._getMaxNumArray(data.map(({ [input]: [min, max = undefined] }) => max === undefined ? min : max))
        const aOutputValues = data.map(({ [output]: o }) => o)
        this._minOutputValue = this._getMinNumArray(aOutputValues)
        this._maxOutputValue = this._getMaxNumArray(aOutputValues)
    }

    _getMinNumArray (array) {
        return array.reduce((prev, curr) => prev === undefined ? curr : Math.min(prev, curr), undefined)
    }

    _getMaxNumArray (array) {
        return array.reduce((prev, curr) => prev === undefined ? curr : Math.max(prev, curr), undefined)
    }

    _checkAllItems (items, input, output) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new TypeError('pick-input-output: data should be an non empty array')
        }
        // check format
        if (!items.every(item => this._checkItem(item, input, output))) {
            throw new Error('pick-input-output: unsupported format. each item must be : { ' + input + ': [number, number], ' + output + ': number')
        }
        // check bounds
        if (items.some(({ [input]: inp }) => inp[0] > inp[1])) {
            throw new Error('pick-input-output: input bounds order error - input[0] must be <= input[1]')
        }
        // checking overlap
        const oRegistry = new Set()
        for (const item of items) {
            let [min, max = undefined] = item[input]
            if (max === undefined) {
                max = min
            }
            for (let x = min; x <= max; ++x) {
                if (oRegistry.has(x)) {
                    throw new Error('pick-input-output: overlapping inputs')
                }
                oRegistry.add(x)
            }
        }
    }

    _checkItem (item, input, output) {
        const inp = item[input]
        const outp = item[output]
        return Array.isArray(inp) && inp.length <= 2 && (!isNaN(outp))
    }

    getValue (input) {
        if (input <= this._minInputValue) {
            return this._minOutputValue
        }
        if (input >= this._maxInputValue) {
            return this._maxOutputValue
        }
        for (let { [this._input]: [min, max = undefined], [this._output]: output } of this._data) {
            if (max === undefined) {
                max = min
            }
            if (input >= min && input <= max) {
                return output
            }
        }
        return undefined
    }
}

module.exports = PickInputOutput
