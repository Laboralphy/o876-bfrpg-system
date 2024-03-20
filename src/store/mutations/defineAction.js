module.exports = ({ state }, { count = 1, name, script = 'damage', amp = 0, parameters = {} }) => {
    state.monsterData.actions.push({
        name,
        count,
        script,
        amp
    })
}