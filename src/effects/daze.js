function attacked ({ effect, target, attackOutcome }) {
    // effect is over
    if (attackOutcome.hit && attackOutcome.damages.amount > 0) {
        target.mutations.removeEffect({ effect })
    }
}

module.exports = {
    attacked
}
