function computePlanning (nAttackPerTurn, nTurnTickCount, reverseOrder = false) {
    const aPlan = new Array(nTurnTickCount)
    aPlan.fill(0)
    for (let i = 0; i < nAttackPerTurn; ++i) {
        const iRank = Math.floor(aPlan.length * i / nAttackPerTurn)
        const nIndex = reverseOrder
            ? nTurnTickCount - 1 - iRank
            : iRank
        ++aPlan[nIndex]
    }
    return aPlan
}

module.exports = {
    computePlanning
}