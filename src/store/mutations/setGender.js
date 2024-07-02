/**
 * Sets the creature gender.
 * This usually apply on player characters.
 * Gender has no effect on combat rules however knowing gender may be useful for combat or data description in language
 * where gender affects text.
 * When gender is not useful, we use the value GENDER_NONE. This is the case for monsters like, undead, animals or other aberrations
 *
 * @param state {BFStoreState}
 * @param value {string} GENDER_*
 */
module.exports = ({ state }, { value }) => {
    state.gender = value
}