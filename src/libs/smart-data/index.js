const vm = require('node:vm')

// const { parse } = require('csv-parse/sync')


class SmartData {
    /**
     *
     * @param oCodes {Object<string, string>}
     * @return {vm.Script[]}
     */
    compile (oCodes) {
        const aCompiled = []
        for (const [, sCode] of Object.entries(oCodes)) {
            aCompiled.push(new vm.Script(sCode))
        }
        return aCompiled
    }

    createContext () {
        const oContext = {
            c: null,
            value: '',
            leftValue: '',
            _output: [],
        }

        /**
         * Set property name and value.
         * The property name will be the string value of the previous column
         * The property value will be the current column value (if JSON, then it will be parsed)
         * @param obj
         */
        function kv (obj) {
            if (typeof oContext.value === "number") {
                obj[oContext.leftValue] = oContext.value
                return
            }
            const sTrimmedValue = oContext.value.trim()
            const c0 = sTrimmedValue.charAt(0)
            const sSigns = '[{"\''
            obj[oContext.leftValue] = sSigns.includes(c0) ? JSON.parse(sTrimmedValue) : sTrimmedValue
        }

        /**
         * Return the last item of an array
         * @param arr {[]}
         * @returns {any}
         */
        function last (arr) {
            return arr.slice(-1).pop()
        }

        /**
         * Commit the current object
         */
        function output () {
            if (oContext.c) {
                oContext._output.push(oContext.c)
            }
            oContext.c = {}
        }

        oContext.kv = kv
        oContext.output = output
        oContext.last = last
        oContext.c = {}

        return vm.createContext(oContext)
    }

    runRow (aRow, aScripts, oContext) {
        if (!Array.isArray(aRow)) {
            console.error(aRow)
            throw new TypeError('ERR_ARRAY_EXPECTED')
        }
        aRow.forEach((value, i) => {
            if (value !== '') {
                value = isNaN(+value) ? value : parseInt(value)
                oContext.value = value
                try {
                    if (aScripts[i]) {
                        aScripts[i].runInContext(oContext)
                    }
                } catch (e) {
                    console.error(e)
                    console.error(aRow)
                    console.error('COLUMN ' + i + ' : ' + value)
                    throw e
                } finally {
                    oContext.leftValue = value
                }
            }
        })
    }

    run (aRows) {
        const [aHeader, aScripts, ...aData] = aRows
        if (!aHeader) {
            throw new Error('no header defined')
        }
        const oScripts = aHeader.reduce((prev, curr, i) => {
            prev[curr] = aScripts[i]
            return prev
        }, {})
        const oCompiledScripts = this.compile(oScripts)
        const oContext = this.createContext()
        aData.forEach(row => {
            this.runRow(row, oCompiledScripts, oContext)
        })
        oContext.output()
        return oContext._output
    }
}

module.exports = SmartData