/**
 * Sets the environment value (check ENVIRONMENT_* constant group)
 * @param state {BFStoreState}
 * @param environment
 * @param value
 */
module.exports = ({ state }, { environment, value }) => {
    if (environment in state.environment) {
        state.environment[environment] = value
    } else {
        throw new Error('Unknown environment ' + environment + ' - valid environments are : ' + Object.keys(state.environment))
    }
}