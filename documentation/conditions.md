# Conditions

## Conditions description

### CONDITION_BLINDED

The blinded creature cannot clearly see its surroundings and get penalties
while fighting.

This condition is applied when EFFECT_BLINDNESS is present.

- attack roll -4
- armor class -4
- initiative -2
- surprised on 1-4 *Not supported

### CONDITION_CHARMED

The charmed creature cannot attack its charmer.

The creature cannot fight against a creature who is the source 
of one of its charm effect.

This condition is applied when EFFECT_CHARM is present.

### CONDITION_INCAPACITATED

This condition prevents the creature from doing anything. This happens when
creature's HP reach 0.

This condition is automatically applied and removed according to hp value.

### CONDITION_PARALYZED

The creature cannot do anything.

This condition is applied when EFFECT_PARALYSIS is present.

### CONDITION_PETRIFIED

The creature cannot do anything.

This condition is applied when EFFECT_PETRIFICATION is present.

### CONDITION_POISONED

The creature regularly loses HP.

This condition is applied when EFFECT_DAMAGE is present with duration > 0 and damageType is POISON.

### CONDITION_RESTRAINED

The creature cannot move, but may attack.

This condition is applied when EFFECT_SPEED_MODIFIER is present and getSpeed getter returns 0.

### CONDITION_DAZED

The creature is dazed and cannot fight, but can move and leave the room.

This condition is applied when EFFECT_STUN is present.
