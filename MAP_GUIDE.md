# Cartman Royale map guide

This is the complete map reference for Cartman Royale. It covers every map
registered by the game, every map exposed by the menus, the separate Cartman
Roulette party-room event, the Endless Rosenthal variant, and the two Career
boss arenas. The descriptions are based on the current runtime behavior rather
than only the button labels.

## Shared rules

Most maps use the same third-person movement and knockback simulation. Holding
WASD accelerates the character, releasing a direction lets momentum coast, and
velocity damping gradually slows the character. A collision transfers
knockback based on approach speed and can stun the receiving character. On a
standard arena, crossing the active boundary eliminates a contestant.

Normal Mode ends when only one contestant remains. Stock Mode gives each
contestant multiple lives and respawns them while stocks remain. Teams Mode
assigns red and blue teams to its supported maps. Capture the Flag and Soccer
assign teams automatically even when launched from the normal map list.

The player normally fights up to twelve CPU contestants, receives a
five-second countdown, and can collect Speed Boost and Power Punch pickups.
Map-specific rules can replace the normal edge test, add health, change the
objective, or disable combat entirely. The HUD's score text changes to show
the rule that matters most for the current map.

## Free-play map reference

### 1. Classic Arena — `classic`

Classic Arena is the baseline map: a flat, wood-brown circular platform with
a radius of about 20 units and a thin red torus marking the fatal edge. It has
no walls, ramps, moving hazards, objective objects, or special health system.
The open floor makes momentum and positioning easy to read.

The goal is to knock every other contestant beyond the boundary. Fighting near
the center gives room to recover from a missed attack. Fighting near the edge
is dangerous but lets a short, controlled hit finish an opponent. The CPU
keeps away from the perimeter, predicts a target's movement, and accelerates
into attacks when it has a safe approach.

Classic Arena is available in Normal, Stock, Teams, and online play. It is
also the fallback used when another map fails during construction.

### 2. Sewer Surge — `sewer`

Sewer Surge is a dark olive, circular service tunnel with a 29-unit floor,
green boundary ring, translucent water, three ripple rings, and four large
radial service pipes. The water starts shallow but rises continuously after
the first four seconds. It reaches a maximum level of 4.2 world units.

The safe ground is a sequence of temporary earthen mounds. A large central
mound begins with an 11.5-unit radius and 4.5-unit height. Every 8–13 seconds,
a new mound appears 9–20 units from the center. New mounds grow from 18%
scale over 2.2 seconds while the previous mound melts over 6.5 seconds.
Because the mound is sloped, its lower edge becomes unsafe before its summit.

Once the water rises above 0.52, a character must have more than 0.12 units
of mound surface above the water to survive. Drowned characters lie flat and
float as dark green corpses rather than using the ordinary fall animation.
Living players can bump those bodies around. The HUD reports water
percentage, current mound number, and knockouts.

The important decision is choosing the next high point before the current
mound disappears. CPUs evaluate height above water, distance, growth or melt
state, and nearby corpses. They circle safe summits and only pursue a player
on the same mound when there is enough vertical headroom for a shove to matter.

### 3. Icefall Pits — `icepits`

Icefall Pits is a cold, blue-gray circular arena with a 29-unit frozen floor,
a cyan perimeter, four tall perimeter beams, and holes that open through the
floor. The player starts on the rim of a broad central pit at
`(0, 0.5, 10.5)`. The initial pit has an 11.5-unit radius and a depth of
3.8 units.

The floor is rebuilt around every active pit, so a pit is a real opening rather
than a dark decal. After ten seconds, new pits begin forming every 8–13
seconds at non-overlapping positions 10–20 units from center. Their radii
range from 6.1 to 8.3 units and their depths range from 1.05 to 4.95 units.
They grow over 2.2 seconds. The previous active pit melts and shrinks over
6.5 seconds, making shelter temporary.

Eight overhead ice spikes run staggered 7.4-second cycles. They descend from
height 14, hold near the arena, then retract. The required shelter depth
starts at 0.12 after the first four seconds and rises to a maximum of 3.6.
Once the required depth exceeds 0.55, a contestant is eliminated unless the
pit beneath them is deeper than the required depth plus 0.14. The visible
spikes telegraph the storm; the authoritative lethal rule is exposed-floor
depth.

Characters descend into pits and lose a little horizontal momentum when
entering deeper ice. CPUs move quickly toward deep pits while exposed and
orbit near a selected pit's center once safe. The HUD shows spike-depth
percentage, current pit number, and knockouts.

### 4. Ice Factory — `icefactory`

Ice Factory keeps Classic Arena's roughly 20-unit circular footprint but
replaces the brown floor with a pale metallic ice surface, cyan edge ring,
bright background, and cold fog. It has no extra structures or objective.

Movement is 15% faster and velocity damping is reduced, so characters slide
longer after releasing a direction. This changes both attack timing and
recovery: a collision that would be harmless on Classic can carry an attacker
over the edge here. Turn early, leave braking room, and avoid correcting a
bad approach at the last moment.

It uses ordinary knockout rules and is available in the Teams selector,
Normal, Stock, and online play.

### 5. Shrinking Platform — `shrinking`

Shrinking Platform begins as a large purple circular arena with a radius of
about 35 units and a magenta boundary ring. During the first 120 seconds the
safe radius continuously shrinks from 35 to 5 units. The visible platform and
ring scale with the same radius, so the pressure is easy to see.

There are no added hazards. The shrinking boundary is the hazard: early play
allows separation, pickups, and long approaches, while late play compresses
everyone into a crowded center where every collision has more value. CPUs
update their edge avoidance as the radius changes. Stock Mode can extend the
event because contestants may respawn while lives remain.

### 6. Synthetic — `synthetic`

Synthetic is a circular field made from cyan four-unit square tiles rather
than one solid platform. The grid fills a roughly 50-unit circular area. A
red outer ring warns about the overall boundary, but the individual tiles are
the real floor.

When a living contestant occupies a stable tile, that tile begins sinking.
It takes about 0.5 seconds to disappear, then stays absent for ten seconds
before regenerating. Falling through a missing tile eliminates the character.
Standing still is not safe because the occupied tile still starts its timer.

The strongest tactic is to push opponents onto tiles that are already
falling, or to remove the tiles around them and deny escape routes. The
overhead camera makes the remaining floor readable. CPU contestants seek
visible safe tiles instead of relying only on target pursuit.

### 7. Highway — `highway`

Highway is an 80-by-40 rectangular road with white cross markings and yellow
center dashes. Its rectangular bounds make the short front and back edges just
as dangerous as the long sides. Eight cars and buses are present at the
start; new vehicles enter from either side as old vehicles leave.

Cars are smaller and faster. Yellow buses are larger and apply more force.
Vehicle contact pushes a character in the vehicle's travel direction and
stuns them for roughly two seconds. A traffic hit can chain into a wall,
another fighter, or the road edge.

This remains a knockout map, but traffic is a third combatant. Fighting in a
lane while watching only the target is a reliable way to be blindsided. CPUs
avoid the edge and react to nearby traffic. Highway is available in Normal,
Stock, Teams, and online play.

### 8. Volcano — `volcano`

Volcano is a dark, rough circular rock platform with a radius of about 25 and
a bright orange-red perimeter. Meteors fall from above at roughly two-second
intervals. A direct hit applies sideways knockback and a temporary stun.

When a meteor reaches the floor, it leaves a glowing lava puddle with a
roughly two-unit radius. Puddles last about eight seconds, gradually filling
the arena with short-lived danger zones. The same impact is much more
dangerous near the boundary than near the center because the follow-up
knockback has less recovery space.

Contestants still die by leaving the circular boundary. Particle settings can
reduce meteor visuals, but the gameplay hazard remains. CPUs combine normal
target selection with edge and impact avoidance.

### 9. Hot Potato — `hotpotato`

Hot Potato is a compact orange circular platform with a red edge. After the
countdown, a black bomb with a sparking fuse is assigned to a random living
contestant. Its timer begins at 15 seconds.

The bomb follows its holder. Touching another living contestant passes it
immediately. A CPU holding it seeks a nearby recipient after about two
seconds, while other CPUs try to avoid the holder. When the timer reaches
zero, the holder is eliminated and a new bomb appears after a short delay.

The map still has ordinary edge knockouts and collisions. A holder should
preserve central space and pass deliberately; a player without the bomb
usually wants to stay just outside passing range instead of chasing directly
into the holder.

### 10. King of the Hill — `kingofhill`

King of the Hill is a large olive-green circular arena with a radius of about
25. A raised-looking gold hill occupies the center, with four brown ramps
pointing toward it. The hill is visually elevated, but the logical movement
plane remains flat.

The central eight-unit radius is the scoring zone. A contestant inside it
earns one point per objective tick; 100 points represents about ten seconds
of total control and wins the event. The HUD lists the leading contestants.
Knockouts can help clear the hill, but knockouts alone do not decide the
winner.

CPUs converge on the hill instead of wandering through normal target combat.
The map is currently reached through the Teams selection flow, where team
assignment is enabled, rather than through its own normal menu button.

### 11. Rosenthal's Basement — `lockdown`

Rosenthal's Basement is a 60-by-60 concrete interior divided by foundation
walls into a central corridor, storage rooms, a utility room, and a boiler
room. Shelves, crates, workbenches, overhead pipes, and a glowing boiler
provide cover and create narrow routes. Walls block movement and stop
Vaseline projectiles.

After the countdown, Mr. Rosenthal enters as a larger brown-tinted Cartman
with a launcher. He uses grid-based pathfinding, pursues the nearest living
contestant, recalculates about once per second, and fires a Vaseline blob
roughly every 1.2 seconds. A blob hit causes knockback and a short stun; its
milk trail slows anyone standing in it. Direct contact with Rosenthal is
fatal. He also accelerates as the event continues.

Use rooms and corners to break projectile lines, but avoid dead ends because
the shooter can navigate around walls. The standard mode ends when one
contestant remains. The HUD reports survival time.

### 12. Endless Rosenthal's Basement — `lockdown` with Endless option

The Endless variant uses the same basement geometry, pathfinding shooter,
projectiles, milk trails, acceleration, and fatal direct contact. Its
difference is the round lifecycle: eliminated contestants stay out, the
camera can follow surviving contestants, and the game does not show a normal
winner or game-over resolution. It is a single-player menu option and does
not enter online matchmaking.

### 13. Spikes — `spikes`

Spikes is a dark circular arena with a radius of about 25 and a red boundary.
Warning rings appear at random locations before each spike cluster emerges.
The warning flashes and pulses for about 1.1 seconds, giving characters time
to move. Six metal spikes then rise for about 0.85 seconds before retracting.

Up to seven hazard groups can be active. An active cluster kills a contestant
within roughly 1.55 units. The standard collision and edge rules continue
between spike events, so a warning ring can be used to force an opponent into
another fighter or toward the boundary.

### 14. Infection — `infection`

Infection uses a Classic-style circular platform with a deep red atmosphere.
The first CPU begins infected; the player and other CPUs begin as survivors.
An infected contestant spreads the condition by touching a survivor.

Infected CPUs chase the nearest survivor. Survivors try to create distance
from infected contestants rather than seek ordinary fights. The normal phase
lasts up to five minutes. If every living contestant becomes infected, a
50-second finale begins. If a survivor remains when the applicable timer
resolves, that survivor wins; otherwise an infected contestant can win.

The HUD changes to a finale display when the last-survivor phase starts.
Infection is a pursuit and contact game: red-tinted characters are the threat,
and a survivor who willingly closes distance can spread the problem to
themselves.

### 15. Royalty — `royalty`

Royalty is a larger dark-blue-fog circular arena with a radius of about 25,
a gold edge, and six floating swords around a radius of about 15. Swords
rotate and bob until claimed.

Every contestant begins with 100 health. Touching a sword attaches it to the
character and grants `hasSword`. A sword holder deals five health damage on
close contact. After roughly ten seconds, the sword detaches and returns to
the arena. Reaching zero health eliminates the contestant; the outer edge is
also fatal.

Unarmed players should route toward a sword while armed players choose
engagements carefully because ownership expires. CPUs seek swords when
unarmed and pursue opponents when armed.

### 16. City Escape — `cityescape`

City Escape starts on a gray 30-by-30 rooftop in an open sky scene. After ten
seconds, it creates a new 20-by-20 rooftop in a random cardinal direction
and connects the two with a brown bridge. The active route moves forward:
the current and previous buildings remain while older buildings are removed.

Each transition also schedules three falling debris blocks, one per second.
Debris falls from height 20, rotates, and applies knockback plus a one-second
stun on contact. A contestant standing on neither a building nor the active
bridge is eliminated immediately.

Move toward the newest rooftop before the crossing becomes unsafe, then use
open roof space to avoid debris and opponents. CPUs target the newest
building. The current runtime is structured for repeated transitions but
retains the active bridge reference after the first generated crossing, so the
documentation should not promise an endless city chain without changing the
implementation.

### 17. Giant Circuit — `circuit`

Giant Circuit is a dedicated three-lap race, not a knockout arena. It is a
large closed course on a dark green base with a fast straight, S-section,
elevated back section, tunnel, and tight hairpin-like turns. The road has
cyan and coral curbs, dark shoulders, guard posts, center dashes, a
checkered start line, and a start gantry.

The track is sampled into 192 points from a closed spline. Five item boxes
alternate between lanes near braking zones and corner exits. Three checkpoint
gates divide a lap. A tunnel uses repeating dark frames and cyan ceiling
lights.

The player auto-accelerates. A/D or left/right steers, S or Down brakes, and
Space uses the collected race item. Limited off-road travel is allowed, but
a large grass shortcut is corrected back toward the nearest road point.
Drivers do not knock one another out. Position is calculated from completed
laps and forward path progress.

There are exactly three laps. A lap counts only after a forward crossing from
the final track section into the first; reversing across the line cannot
create a lap. The HUD shows lap, checkpoint, position, item, and elapsed
time. The first finisher is frozen and added to the results order. Giant
Circuit is single-player against CPU drivers.

### 18. Bleeding — `bleeding`

Bleeding is a compact dark-red circular arena with a red perimeter. Every
contestant starts at 100 health and loses two health per second. Five glowing
red health packets spawn within the inner arena. A packet restores 30 health,
up to the 100-point cap, disappears, and respawns after about two seconds.

Health reaching zero eliminates a contestant, and the boundary remains fatal.
Normal collisions can still push a low-health contestant off the arena. The
best route is not always the nearest packet: the path to it may expose the
player to a collision or the edge.

### 19. Fridge — `fridge`

Fridge is a pale metallic circular arena with a radius of about 25. A yellow
five-unit spotlight travels around the arena on a 15-unit orbit. A matching
light from above makes the safe zone visible.

Characters inside the spotlight gain five health per second. Characters
outside it lose three health per second. Health starts and caps at 100; zero
health eliminates a contestant, while the outer edge is still fatal.

The moving center of the light is safer than following its rim. CPUs head
toward the spotlight when outside it and damp their movement once inside.

### 20. Pillar — `pillar`

Pillar is a gray circular platform with a radius of about 20 and a yellow
edge, suspended on a gray cylindrical support about 50 units tall. The active
hazard is a large four-bladed fan that rotates and orbits around the arena.

The fan influences characters within 15 units. Its wind pushes directly away
from the fan, with force increasing as distance closes. It does not deal
health damage; it changes velocity and can launch a character over the edge.

Watch the fan's orbit rather than treating the yellow ring as the only
danger. CPUs retreat from the fan and otherwise prefer the center.

### 21. Capture the Flag — `ctf`

Capture the Flag is a 100-by-60 rectangular field with red and blue bases at
opposite ends, outer walls, center obstacles, partial barriers, and side
corridors. The player is assigned to blue and CPUs alternate between red and
blue.

Touching the opposing flag picks it up. The flag follows its carrier. Bringing
it to the carrier's own base scores one point. If the carrier is eliminated,
the flag returns home. The match lasts five minutes; the higher score wins,
and a tie is resolved randomly.

CPU attackers pursue the opposing flag and return home with it. Defenders
guard their own flag and chase carriers. Knockback, walls, and positioning
can stop a run without requiring a direct flag interception.

### 22. Soccer — `soccer`

Soccer is a 60-by-40 green enclosed field with a white center line, red and
blue goal markers, and low dark perimeter walls. Each goal opening is ten
units wide along the z-axis. The player is blue; CPUs alternate teams.

The ball begins at center, slows through friction, bounces off walls, and is
kicked when a contestant approaches within range. Kick strength increases
with player movement speed. A ball crossing the left goal line scores for
blue; crossing the right goal line scores for red, after which it resets to
center.

The match lasts five minutes. The HUD shows Red, Blue, and remaining time.
CPUs approach from behind the ball and steer the kick toward their team's
goal. The higher score wins and ties are random.

### 23. Dice Hazard — `dice`

Dice Hazard places contestants on the upper face of a giant dark 34-by-34
cube suspended above a void. The cube is centered at `(0, -17, 0)`, putting
the initial play surface at y=0. The player starts at `(-12, 0.5, -12)`.

The opening face is Spike Grid. The die remains still for 6.5–9.0 seconds,
then flips to another face over 1.65 seconds. The face queue is shuffled so
each face appears once before the cycle repeats and the current face cannot
be selected immediately. During a flip, living contestants are anchored to
safe clamped positions inside ±15.75, movement and ordinary combat are
paused, and the camera rises to show the full die. After the flip, the next
interval is 5.8–9.4 seconds. Crossing ±15.9 on x or z is fatal.

The six hazards are:

- **Spike Grid:** eleven glowing cones scattered across the face; contact is
  lethal.
- **Lava Pools:** nine fixed orange pools with radii from 2.6 to 4.2; they
  pulse and kill on contact.
- **Falling Stars:** eight orange-tailed stars descend toward the face and
  respawn overhead after reaching it.
- **Gravity Wells:** five purple wells pull characters inward, stun them for
  0.45 seconds, and kill only inside their 1.6-unit inner radius.
- **Laser Sweep:** three gold beams slide laterally across the face; contact
  is lethal.
- **Giant Spinner:** four long teal blades rotate around the face center,
  apply strong push, and kill when they intersect a character.

Each hit has a 0.65-second per-player cooldown. CPUs flee the nearest active
hazard, return toward center when approaching an edge, and otherwise circle a
small central route. Dice Hazard is single-player only.

### 24. Warehouse — `warehouse`

Warehouse is a 60-by-60 gray square enclosed by four red grinder assemblies.
Each grinder has a long base and five rotating blades. Eight brown boxes begin
near the center; more drift in over time up to a limit of 15.

Touching a box stuns a contestant for about five seconds. A yellow van
occasionally enters from a random edge, targets a grinder, collects nearby
boxes and contestants, and eliminates anything it carries when it reaches the
grinder. Overhead cranes periodically target living contestants and crush
them. Flying circular saws enter from random sides.

The grinders and van delivery are immediate-kill hazards. There is no
permanent safe corner: the center is disturbed by boxes, the perimeter is
dangerous, and cranes and saws punish predictable routes. CPUs avoid the
nearest active hazard before returning toward center.

### 25. Cartman Roulette — `roulette`

Cartman Roulette is a separate single-player event rather than an ordinary
movement arena. It opens a dedicated Three.js birthday room with a desk, cake,
presents, balloons, bunting, two imported PlayStation-style Cartmans, a
revolver, two wall-mounted information panels, and two mom audience figures.

The player and CPU Cartman take turns. Both danger values begin at 16%, and
the wall panel updates them after every move:

- **Shoot It:** test the acting Cartman's current danger. A miss advances the
  turn and raises that Cartman's danger.
- **Reroll:** independently shifts both danger values.
- **Shoot Opponent:** tests the target first; a surviving target forces the
  shooter to take a higher-risk recoil shot.
- **Eat It:** randomly guarantees a death, changes both odds, raises the odds,
  or wastes the move.
- **Spam It:** subtracts 12 percentage points from the target's danger and
  adds them to the shooter's danger, then resolves target and recoil shots.

Cartmans display `MOM!!!` and `MOM HELP!`, sweat, tears, and blue tear puddles
on the desk. Their shaking and tears increase with the round. When danger
passes the escape threshold, a Cartman rises and lunges forward as if trying
to get out of the chair.

Both moms use `Liane_Cartman0.webp` and hold `download__9_.png` as a camera.
Their recording lights blink throughout the round, and they turn toward the
desk as danger rises. The birthday song loops while the map is open. The
supplied revolver, pistol, flesh, blood-splatter, and blood-scream files are
used for actions and impacts.

Normal hits create airborne blood, desk pools, wall splats, flesh impacts,
and the supplied blood sounds. Winning triggers a camera push-in with
flickering party lights, the moms turning fully toward the action, and an
ecstatic victory result. Losing ends plainly, but the player's mom gets a
visible `HAHA!` reaction. If the active turn is ignored for 14 seconds, a mom
stops just behind the target, bashes the target's head into the desk three
times, then takes the revolver and fires six shots. This intervention ends
with `MOM HAD ENOUGH`.

## Career arenas

### 26. Mega Cartman — `megacartman`

Mega Cartman is the first Career boss arena: a dark rocky circular platform
with a radius of about 30 and a glowing orange boundary. Six highway vehicles
spawn at the beginning, while the shared meteor system continues to drop
hazards.

Mega Cartman has 150 health, chases the player, and periodically enters a
four-second spinning attack. Contact during the spin removes five player
health and applies heavy knockback. A moving player collision deals ten boss
damage, after which the boss is invulnerable for about 1.5 seconds. The boss
can also be defeated by crossing its arena boundary.

Career gives the player a separate 100-point health pool. The stage ends when
the boss loses all health or the player's health reaches zero. Vehicles and
meteors make direct boss approaches risky.

### 27. Kyle — `kyleboss`

Kyle is the final Career arena: a much larger dark-blue circular platform
with a radius of about 50 and a green edge. Kyle is rendered as a large
billboard sprite from `IMG_5949.png`; a generated green fallback texture is
used if the image cannot load. Meteors continue to fall, but the stage starts
without highway traffic.

Kyle has 1,500 health and chooses from a rotating set of attacks: green puke
projectiles, a repeated jump-and-slam sequence, a spinning charge, a direct
chase, a radial projectile wave, a teleport behind the player, and an
expanding spiral projectile pattern. Projectiles and contact attacks damage
the player's separate Career health pool. The slam deals heavier damage and
knockback.

Kyle becomes temporarily invulnerable after taking damage. He can be defeated
by reducing health to zero or by forcing him beyond the large platform's
boundary. Defeating him completes Career Mode.

## Availability summary

The normal paginated menu exposes Classic Arena, Sewer Surge, Icefall Pits,
Ice Factory, Shrinking Platform, Synthetic, Highway, Volcano, Hot Potato,
Rosenthal's Basement, Endless Rosenthal's Basement, Spikes, Infection,
Royalty, City Escape, Giant Circuit, Bleeding, Fridge, Pillar, Capture the
Flag, Soccer, Dice Hazard, Warehouse, and Cartman Roulette.

The Teams selector offers Classic Arena, Ice Factory, Highway, Volcano, Hot
Potato, and King of the Hill. Giant Circuit, Dice Hazard, and Cartman Roulette
are single-player events. Mega Cartman and Kyle are reached through Career
Mode.
