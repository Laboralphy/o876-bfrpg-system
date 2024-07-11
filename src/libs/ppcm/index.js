function ppcm (a, b, x, ...y) {
    if ((a * b) === 0) {
        throw new Error('ppcm does not accept null parameters')
    }
    if (a === 1 || b === 1) {
        a *= b
    } else {
        let c = a, d = b
        while (a !== b) {
            if (a > b) {
                b += d
            } else if (a < b) {
                a += c
            }
        }
    }
    return x !== undefined
        ? ppcm(a, x, ...y)
        : a
}

module.exports = ppcm
