# Rules

## Abilities

### Strength

#### Attack bonus
In getter `getAttackBonus`, strength modifier is used to increase attack bonus in melee attacks.

#### Melee weapon damage bonus
In method `Creature.bonus`, strength is used to increase __MELEE__ weapon damage output.
Does not increase ranged weapon damage output.

#### Get rid of paralysis effect
In effect `paralysis.js`, strength is used as a bonus to saving throw against paralysis.
This saving throw is rolled each combat turn. If saving throw is a success the paralysis effect is removed.

#### Carrying more stuff
In getter `getEncumbrance`, strength (pure) is used (with the `carrying-capacity` data file) 
to determine how much stuff one can carry before having problems.

### Dexterity

#### Armor class bonus
In getter `getArmorClass`, dexterity modifier is used to increase armor class against VISIBLE opponents.
This bonus is negated if one is unable to fight (paralyzed, stunned, petrified, incapacitated...),
or blinded.

#### Attack bonus
In getter `getAttackBonus`, dexterity modifier is used to increase attack bonus with
ranged weapon, or finesse weapon (dagger, shortsword).

### Constitution

#### Avoid poison
In method `Creature.rollSavingThrow`, constitution is used as bonus ability to avoid poison threats.

#### Avoid disease
In effect `disease`, function `doMutationStage`, constitution is used as a bonus to
saving throw against poison, in order to counteract disease effect.

#### Max hit points
In getter `getMaxHitPoints`, constitution modifier will increase max hit points per level.

### Intelligence

#### Avoid illusions
In method `Creature.rollSavingThrow`, intelligence is used as bonus ability to saving throw 
against illusion spells.

### Wisdom

#### Avoid mind spells
In method `Creature.rollSavingThrow`, wisdom is used as bonus ability to saving throw
against mind spells.

### Charisma

Charisma is not used in combat.
