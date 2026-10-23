# Cartman Royale

Cartman Royale is a browser-based Three.js arena game served directly from the
project root. It does not use a build step, package manager, bundler, or local
runtime server. The live preview serves the files in `/workspace` as-is, while
`.js` modules are loaded by the browser.

The game began as a knock-out arena: move around a platform, collide with
opponents, and be the last Cartman standing. It now also includes **Giant
Circuit**, a dedicated single-player racing event in which you and CPU drivers
share a long closed circuit and race for three complete laps, plus **Cartman
Roulette**, a separate single-player party-room map built around escalating
odds, fear, and a loaded gun.

## What the game is

Cartman Royale is a collection of small, deliberately chaotic 3D events built
around one shared idea: movement has weight, the arena is dangerous, and a
good escape route is often more valuable than a direct attack. Most events
use the same character controller and knockback physics, so every map is easy
to enter but changes what “safe” means.

In a normal arena, the goal is to be the last living contestant. You steer
with a continuous acceleration model rather than snapping from one grid
square to another. Holding a direction builds velocity, releasing the key
lets the character coast while damping reduces that velocity, and a collision
can turn a harmless approach into a launch toward the edge. The player and CPU
contestants share this simulation.

The map roster then bends that formula in different directions:

- some maps add a changing boundary or unstable floor;
- some replace fighting with survival, pursuit, or resource control;
- some turn the arena into a team field with a ball or flags;
- Giant Circuit removes knockouts entirely and measures racing progress;
- Cartman Roulette replaces movement with a turn-based desk game and live
  danger odds;
- Career Mode strings selected events together and ends with two boss fights.

The game is intentionally arcade-like rather than a realistic simulation.
Visual geometry communicates the threat, while the HUD reports the rule that
matters most in the current event. A red ring usually means “the edge is
fatal”; a special object, moving light, timer, or score display identifies the
map-specific objective.

## Quick start

1. Open the live preview for this project.
2. Choose **Single Player (vs CPU)**.
3. Use the paginated map menu to select a map.
4. For the race event, choose **Giant Circuit — 3 Laps**, or choose
   **Cartman Roulette** for the birthday-party gun game.
5. Wait through the short starting countdown, then drive with `WASD`, or use
   the Roulette action buttons when the desk map is open.

The direct entry point is [index.html](./index.html). It loads the runtime from
[game.js](./game.js), and all local media assets are referenced with relative
URLs from the project root.

There is no `npm install`, `npm run build`, or generated `dist` directory.
Changes to `index.html`, `game.js`, `roulette-map.js`, or documentation files
are immediately visible in the preview.

## Portable export

[portable.html](./portable.html) is a generated, self-contained page copy of
the game logic. It keeps the normal Three.js CDN imports, inlines
`countdown.js` and `game.js`, and resolves the project's existing media files
relative to the page. It does not require the generated `portable-parts/`
directory, but the media files must remain beside it at the same relative
paths. Because Three.js is still loaded from a CDN, the portable page needs
network access unless those imports are replaced with local copies.

When local assets change, regenerate it with:

```sh
node build-portable.js
```

The portable export does not connect to Tenslant ID. Cloud sync requires the published Cartman Royale origin; local progress remains in browser localStorage when the service is unavailable.

## The shape of a round

Every ordinary map follows the same broad lifecycle:

1. The player chooses a game mode and a map.
2. The previous map's geometry, actors, timers, hazards, and objective state
   are cleared.
3. The player and CPU contestants are placed on the new map.
4. A five-second countdown runs in standard play. Career levels use a
   shorter three-second countdown.
5. The map-specific event begins. Powerups are spawned for ordinary
   single-player events; Giant Circuit uses its own item-box system instead.
6. Each frame updates input, movement, AI, collisions, map hazards, objective
   scores, the camera, and the renderer.
7. A win, loss, stock exhaustion, race finish, or boss defeat ends the event.

The standard knockout check awards a point when the player was the last
contestant to touch a CPU before that CPU falls. The score is therefore a
knockout tally, not always a complete description of the objective. On
Bleeding, Fridge, Royalty, and the boss maps, for example, health or boss
state can end a fight without a conventional edge launch.

When a contestant falls, the game plays a fall animation and removes the
character after the animation completes. Fall/death sounds use a boosted
global mix and remain audible across a larger distance, while still fading as
the camera moves away. In Stock Mode, CPU contestants respawn after three
seconds while they still have stocks; the player is respawned at the center
while player stocks remain. A final player stock loss opens the normal
game-over flow. Endless Rosenthal's Basement keeps eliminated contestants out
and hands the camera to surviving contestants without ending the session.

The sound roles include Tom's scream and Bart's fart as randomized power-punch
impacts, Squidward/horror/Werehog screams as additional fall-off sounds, and
Lancer's splat whenever Rosenthal launches a Vaseline blob.

## Controls

### Desktop

- `W` — move/steer toward the top of the world
- `A` — move/steer left
- `S` — move/steer toward the bottom of the world
- `D` — move/steer right
- `Q` / `E` — rotate the chase camera left/right

The arena controls are intentionally direct rather than vehicle-simulation
controls. Giant Circuit uses the same movement language: hold a direction to
build velocity, release it to coast, and combine keys to take a smoother line
through bends. In regular arena play, movement is camera-relative, so rotating
the camera changes the direction that `W` and `S` travel. WASD headings are
normalized, while camera rotation supplies continuous 360-degree direction
control without a diagonal speed boost.

In regular arena events, the two ability cards are also interactive. Picking
up a green speed pickup activates a short speed boost. Picking up a power
punch pickup strengthens the player's next combat interactions and briefly
marks the character as active in the HUD. CPU contestants can collect the
same pickups. Abilities are disabled visually in Giant Circuit because the
race has its own item rules.

### Cartman Roulette controls

Cartman Roulette is a single-player, turn-based map. It does not use WASD.
Choose one action from the desk controls:

- **Shoot It** — test the current danger chance on yourself. A miss advances
  the table; a hit ends the game.
- **Reroll** — independently shifts both danger percentages.
- **Shoot Opponent** — tests the opponent's danger first. If they live, the
  shooter immediately takes a higher-risk recoil shot.
- **Eat It** — applies a random table mutation. It can guarantee a death,
  raise both odds, change everything, or waste the turn.
- **Spam It** — lowers the target's chance by the same percentage it adds to
  the shooter's own danger, then resolves the target and recoil shots.

The birthday-room wall shows live self/opponent odds, round, fear, shaking,
and tears-piling percentages. Both Cartmans call for their moms as danger
rises. Their moms hold cameras with blinking recording lights and turn toward
the table. Waiting for 14 seconds on an available turn triggers the mom
intervention: three desk bashes followed by repeated close-range shots.

### Mobile

On an Android or iOS user agent, a virtual joystick is created in the lower-left
corner. Drag the stick to move relative to the camera: pushing up always moves
away from the camera's current facing direction. The lower-right camera buttons
rotate the chase camera left or right. The existing ability cards also accept
touch input in arena modes.

### VR

If the browser exposes WebXR, the game adds a VR button. The left controller
stick moves the player relative to the headset direction. The right controller
can aim the teleport marker. VR keeps the same map simulation and uses the
existing camera rig.

## Game modes

### Giant Circuit — 3 Laps

Giant Circuit is a race rather than a knock-out arena.

- The track is a large closed loop built from a Catmull-Rom spline.
- The road has cyan and coral curbs, dashed center markings, guard posts, a
  checkered start line, and a broad grass infield/outfield.
- You race against the CPU drivers in a staggered two-column starting grid.
- The race always lasts exactly three laps.
- The HUD shows the current lap, live position, and elapsed time.
- Finishing a lap is detected by crossing the start/finish section in the
  correct direction. Driving backward cannot accidentally award a lap.
- A forgiving off-road margin allows a driver to clip the edge of a corner,
  but a large shortcut across the grass is corrected back toward the nearest
  tarmac point.
- Drivers do not knock each other off the course in this mode. Placement is
  based on forward race progress, not arena combat.
- The first player to complete three laps is shown the race results screen
  immediately. CPU finishers are recorded so the player's final position is
  meaningful.
- The current version is intentionally single-player. The menu shows the mode
  in online menus, but selecting it online explains that it is currently
  available against CPU drivers only.

The race HUD is deliberately separate from the normal `Knocked Off` score. At
the starting grid it reads `Lap 1 / 3`, then advances after each valid crossing.
The results screen reports ordinal placement, total race time, and the number
of racers.

### Normal Mode

The standard arena format has no stock limit. Knock opponents off the playable
area until only one contestant remains.

### Stock Mode

Each player receives a configurable number of lives. A player who falls loses
one stock and respawns while stocks remain. The default is three lives, but the
selection prompt accepts one through ten.

### Teams Mode

Teams Mode opens a second selection screen so a team match can be started on
several supported maps. Players are assigned to red or blue teams and the
selected map's objective rules determine the win condition.

Teams Mode is separate from the map called **Capture the Flag**. It assigns
red/blue teams to the selected event, while Capture the Flag and Soccer
automatically use teams even when launched from the regular map menu.

### Multiplayer

Online Multiplayer repeats the normal/stock/teams selection before opening
Quick Play, Host Game, or Join Game. The online room synchronizes player
position, rotation, skin, team, lives, and alive state. Giant Circuit is
deliberately single-player against CPU drivers at present; selecting it from
the online flow explains that limitation rather than creating an
unsynchronized race.

### Career Mode

Career Mode is a short campaign with an intro scene, level introductions,
progression screens, rewards, and a final ending. The current sequence is:

1. Classic Arena — defeat 3 Cartmans.
2. Ice Factory — defeat 5 Cartmans.
3. Highway Mayhem — defeat 7 Cartmans.
4. Volcano Arena — defeat 9 Cartmans.
5. Shrinking Platform — defeat 10 Cartmans.
6. Hot Potato — defeat 12 Cartmans.
7. Boss: Mega Cartman.
8. Final Boss: Kyle.

Career uses the same map builders as free play, but supplies its own enemy
counts and a shorter countdown. The boss stages replace the normal enemy
roster with one boss and track the player's separate health pool.

## Map atlas

The following descriptions document the maps as they are implemented, not
just the names shown in the menu. “Standard knockout” means that the shared
collision and edge rules remain important. A map can still show the
`Knocked Off` counter while its special objective is doing most of the work.

### Classic Arena (`classic`)

Classic Arena is the reference map for the entire game. It is a circular
wood-brown platform with a radius of about 20 world units and a thin red torus
around the perimeter. There are no walls, ramps, hazards, or objective
objects. The open floor makes the relationship between steering, momentum,
collision angle, and edge positioning easy to read.

The best beginner tactic is to fight near the middle, where a missed approach
does not immediately become a self-elimination. The best advanced tactic is to
pressure an opponent toward the red ring, then use a short, controlled
collision instead of chasing them all the way to the edge. The CPU uses the
same broad safety behavior: it backs away from the edge, predicts a target's
movement, and accelerates when it is close enough to attack.

Classic Arena is available in Normal, Stock, Teams, and online play. It is
also the fallback map used if another builder throws an error while loading.

### Ice Factory (`icefactory`)

Ice Factory keeps the same circular footprint and radius as Classic Arena but
changes the floor to a pale blue, semi-metallic ice surface. The cyan edge
ring and bright fog give the map a cold, high-contrast silhouette. There are
no extra structures to hide behind, so the entire challenge comes from
handling.

The controller uses less velocity damping on this map, and movement receives a
small speed increase. As a result, a player who releases a key continues to
slide farther, and a collision carries more momentum into the next exchange.
Turning early is safer than trying to correct at the last second. The map is
especially good at exposing oversteering: an approach that would stop safely
on Classic Arena can continue past the opponent and take the attacker with it.

Ice Factory uses standard knockout rules and is one of the maps offered by the
Teams selector.

### Shrinking Platform (`shrinking`)

Shrinking Platform starts as the largest ordinary circular arena, with a
purple floor and a magenta perimeter ring at roughly 35 units. The platform
does not stay that size. Once the round starts, its logical safe radius shrinks
linearly from 35 to 5 over 120 seconds, or two minutes, and the visible floor
and ring scale down with it.

The shrinking is not a sudden event or a sequence of arbitrary safe-zone
jumps. It is a continuous pressure curve. Early in the round, there is room
to separate from a fight and collect powerups. Later, the center becomes
crowded and every collision has greater positional value because there is less
space to recover. The CPU continually updates its idea of the safe edge as
the radius changes.

The map still ends contestants who cross the current safe boundary. Stock Mode
can make the shrinking arena last longer because players and CPUs may return
while stocks remain.

### Synthetic (`synthetic`)

Synthetic is a circular field assembled from cyan square tiles rather than a
single solid disk. The grid uses four-unit tiles and fills most of a roughly
50-unit circular footprint. The red perimeter ring remains as an outer visual
warning, but the floor itself is the real hazard.

A tile becomes unstable when a living contestant occupies it. It sinks for
about half a second, disappears, and leaves a hole. A vanished tile begins a
ten-second regeneration cycle before returning to its original height. The
player is eliminated as soon as the controller detects that there is no solid
tile beneath them. This means a route that is safe now may be unavailable a
moment later, while a tile that looks lost can become a future escape route.

Synthetic changes the usual combat priority. Pushing someone onto an already
falling tile is often more effective than winning a direct collision, and
standing still is not safe because the tile under a stationary character still
starts its fall cycle. CPU contestants search for visible safe tiles and try
to move away from unstable ground. Their route is intentionally opportunistic,
so the player can create traps by claiming the tiles around an opponent.

### Highway (`highway`)

Highway is a long rectangular road, approximately 80 units wide by 40 units
deep. The dark platform is painted with repeated white cross markings and
yellow center dashes. Unlike circular arenas, the road has rectangular
bounds, so the dangerous directions are the long left/right ends and the
short front/back edges rather than one continuous curved perimeter.

Eight vehicles are present at the start. Cars and yellow buses enter from
either side, travel horizontally across randomly chosen lanes, and are
replaced when they leave the scene. Buses are larger and apply stronger
knockback; ordinary cars are smaller and faster. Vehicle contact stuns a
contestant for roughly two seconds and pushes them in the vehicle's direction.
That shove can chain into a wall, another contestant, or the edge of the road.

Highway is still a knockout event, but traffic is a third party: it can
separate opponents, interrupt a collision, or punish a player who is focused
only on CPU movement. Keep one eye on the lane markings and avoid fighting in
the path of a bus. The map is available in the main menu and the Teams
selector.

### Volcano (`volcano`)

Volcano is a dark, rough circular rock platform with a radius of about 25 and
a glowing orange-red perimeter. The brown-black floor and deep red
atmosphere make incoming hazards easier to spot as bright objects.

Meteors spawn above random locations about every two seconds and fall
straight down. A direct meteor hit produces a strong sideways knockback and a
temporary stun. When a meteor reaches the floor, it leaves an orange lava
puddle with a radius of about two units. Each puddle remains for approximately
eight seconds, so the map gradually fills with short-lived no-go zones. The
hazard is about displacement rather than a traditional health bar: being hit
near the perimeter is much worse than being hit in the center.

Contestants who leave the circular boundary are eliminated. Particle settings
can reduce or disable meteor visuals on lower graphics presets, but the map's
ordinary movement and edge rules remain.

### Hot Potato (`hotpotato`)

Hot Potato uses a compact orange circular platform with a red edge. At the
start of the active round, a black bomb with a sparking fuse is assigned to a
random living contestant. Its timer begins at 15 seconds.

The bomb follows its holder. Touching another living contestant passes it
immediately, and a CPU holder also seeks a nearby recipient after about two
seconds. When the timer reaches zero, the current holder is eliminated by the
explosion. The bomb is removed and a replacement appears after a short delay
if the round is still active. The countdown therefore resets around the
arena, but never resets while someone is still holding it.

The map still has standard edge knockouts. A strong strategy is to preserve
central space while the bomb is yours, then use a controlled pass near the
middle instead of drifting into an opponent at the edge. When another player
has the bomb, do not automatically chase them: the holder is trying to touch
someone, while you are usually better off staying just outside passing range.

### Sewer Surge (`sewer`)

Sewer Surge is a 29-unit circular service tunnel that has flooded up through
the floor. The arena is a dark olive concrete disk with a moss-green rim,
three expanding ripple rings, and four large horizontal service pipes around
the perimeter. The water begins as a shallow glossy layer, but it is the
clock: after the first four seconds it rises at 0.04 world units per second
until it reaches a 4.2-unit maximum.

The floor is not the safe surface for the whole round. A broad earthen mound
starts at the center with an 11.5-unit base radius and a 4.5-unit summit
height. Every 8–13 seconds, a new mound forms 9–20 units from the center. The
new mound grows from a small 18% scale over 2.2 seconds; the previous current
mound then melts over 6.5 seconds and disappears. As the flood rises, the
lower slopes become submerged first, leaving only the highest part of a mound
safe. The character controller climbs the sloped surface and shows that
height in the camera, so reaching a summit is a movement problem rather than a
teleport.

Once the water is above 0.52, a contestant must have more than 0.12 units of
terrain height above the water to remain alive. Drowned contestants do not use
the normal falling animation: their model is laid flat, tinted dark green,
floats at the waterline, bobs, and can be nudged by living contestants. The
round still ends through the ordinary last-contestant check. The HUD reports
the flood percentage, current mound number, and knockouts.

Sewer Surge rewards early route planning. Climb before the next mound becomes
necessary, then move toward the tallest surviving summit instead of assuming
the newest mound is safest. CPU contestants score candidate mounds using
height above water, distance, forming/melting state, and nearby corpse
debris. They circle the summit when safe and attack the player only when both
contestants have enough high ground for a shove to matter.

### Icefall Pits (`icepits`)

Icefall Pits is the cold counterpart to Sewer Surge: it is a 29-unit frozen
disk with a blue emissive boundary, four tall perimeter beams, and holes that
open through the floor. The opening pit is centered on the arena, has an
11.5-unit radius, and descends 3.8 units. The player starts at
`(0, 0.5, 10.5)`, on the rim of that pit, so the first decision is whether to
drop into cover before the overhead icefall reaches the floor.

The floor is rebuilt as a circular shape with a hole for every active pit.
Each later pit appears 10 seconds into the round and then every 8–13 seconds.
Its radius is randomized from 6.1 to 8.3 units and its depth from 1.05 to
4.95 units. New pits form from 18% scale over 2.2 seconds. The previous
current pit rotates and melts for 6.5 seconds, shrinking to 12% scale before
it is removed. A pit is therefore both a shelter and a temporary route: a
deep pit can become the best location while the player is exposed on the
surface, but its predecessor may be disappearing.

Eight ice spikes cycle above the map. Each uses a 7.4-second cycle with a
staggered initial offset, starts at height 14, descends toward a target height
between 3.1 and 5.3, holds there, and retracts. Separately, the required
shelter depth rises from 0.12 after the first four seconds at 0.033 units per
second, capped at 3.6. Once the required depth exceeds 0.55, any contestant
not standing over a pit deep enough to provide `depth > required depth + 0.14`
is eliminated. The spike meshes telegraph the storm; the runtime's lethal
test is the exposed-floor/depth test, not a separate spike-health system.

The controller lowers the character into a pit and slows movement slightly
when crossing into deeper ice. CPU contestants choose a pit using depth,
distance, forming/melting risk, and the current required shelter depth. They
move quickly when exposed, then orbit near the selected pit's center so they
do not wander back onto the surface. The HUD reports the current spike-depth
percentage, pit number, and knockouts.

### King of the Hill (`kingofhill`)

King of the Hill places a raised-looking gold circular hill in the center of
a larger olive-green circular arena. The hill is about eight units in radius,
and four sloped brown ramps point toward it from the cardinal directions. A
red outer ring marks the roughly 25-unit arena boundary.

The scoring zone is the central hill footprint. A contestant earns one point
per objective tick while inside it, and 100 points represents approximately
ten seconds of total control. The HUD lists the leading contestants and their
progress toward 100. Contestants can fight over the hill, but the event is
won by reaching the score target rather than by simply collecting knockouts.

The elevated mesh is primarily a visual landmark. Because the game uses a
flat movement plane, the logical scoring test treats the central area as the
hill zone rather than simulating a fully physical ramp climb. CPUs converge
on the center instead of wandering into ordinary arena combat. Falling beyond
the outer boundary still removes a contestant.

### Rosenthal's Basement (`lockdown`)

Rosenthal's Basement is a 60-by-60 concrete floor beneath a dark foundation
interior. Thick perimeter walls divide it into a central corridor, cramped
storage rooms, a utility room, and a boiler room. Metal shelving, stacked
crates, workbenches, overhead pipes, and a glowing boiler make the space feel
like someone's private basement rather than an open arena. The walls are not
decoration: the movement controller slides along them, and projectiles can be
stopped by them.

When the countdown ends, Mr. Rosenthal enters as a brown-tinted, slightly
larger Cartman model carrying a Vaseline launcher. He uses grid-based A* pathing
to pursue the nearest living contestant, recalculates his route once per
second, and fires a Vaseline blob roughly every 1.2 seconds. Each blob leaves
a short-lived milk trail: contestants standing in it become very slow, while
a direct blob hit applies knockback and a brief stun without killing them.
Rosenthal steadily gets faster as the basement remains occupied. Direct
contact with Mr. Rosenthal is still fatal and triggers the detention message
for the human player. In the regular mode, the event ends when one contestant
remains.

The objective is survival and evasion. Use corners and storage-room walls to
break projectile lines, but do not trap yourself in a dead-end: the pursuer
can navigate around walls. The basement boundary is also fatal, so fleeing in
a straight line is not enough. CPUs try to move toward the center and run away
when the shooter gets close.

### Endless Rosenthal's Basement

The menu also offers an endless version of the same basement. It uses the same
Vaseline launcher, milk trails, accelerating Rosenthal, and map layout, but
eliminated contestants stay out and the session never shows a winner or
game-over screen.

### Infection (`infection`)

Infection reuses the circular Classic-style platform but changes its
atmosphere to dark red. The first CPU is infected when the round is created;
the remaining contestants, including the player, begin as survivors.

An infected contestant spreads the infection by touching a survivor. Infected
CPUs actively seek the nearest survivor, while uninfected CPUs attempt to
create distance from the nearest infected contestant. When no survivors
remain, the event enters a finale state and starts a 50-second final timer.
The normal survival phase has a five-minute limit. If a survivor is still
alive and uninfected when the applicable timer resolves, that survivor wins;
the HUD changes to a `FINALE!` display when the last-survivor phase begins.

Infection is a pursuit event rather than a standard knockback duel. The key
decision is whether to approach another character at all: survivors want
space, while infected players need contact. Watch the red tint on infected
characters and avoid routes that let the infection chain corner you.

### Royalty (`royalty`)

Royalty is a larger, dark-blue-fog circular arena with a gold edge and six
floating swords distributed around a radius of about 15 units. Swords rotate
and bob while unclaimed, making them visible as pickups rather than static
weapons.

Touching a sword attaches it to the contestant and sets `hasSword`. A sword
holder deals five health damage on close contact. Every contestant begins with
100 health in this mode, and reaching zero removes them. After a sword has
been held for about ten seconds, it detaches and returns to the arena,
allowing another contestant to claim it.

Royalty rewards route planning. An unarmed contestant should prioritize the
nearest sword, while an armed contestant should choose engagements carefully
and use the weapon's limited ownership window. The outer boundary is still
dangerous, so chasing an opponent while armed can backfire if the target
sidesteps toward the ring.

### City Escape (`cityescape`)

City Escape begins on a gray 30-by-30 rooftop-like building in an open sky
scene. After ten seconds, the runtime generates a 20-by-20 building in one of
four cardinal directions from the current building and creates a brown bridge
across the gap. The level keeps the current and previous building while older
buildings are removed, creating a forward-moving route rather than a permanent
city grid. The builder is structured for repeated bridge transitions; in the
current runtime, the first generated crossing is the active timed transition
for the round.

Each new crossing also schedules three falling debris pieces, one per second.
The debris drops from high above the current building, rotates while falling,
and applies a knockback/stun on contact. A contestant standing on neither a
building nor the active bridge is eliminated immediately, so the gap is a
real gameplay boundary rather than an ornamental void.

The map is a race against the next bridge cycle even though it is still
presented as a knockout event. Move toward the newest building before the
bridge disappears from relevance, then use the rooftop's open space to avoid
debris and opponents. CPUs select the newest building as their objective.

### Giant Circuit (`circuit`)

Giant Circuit is the game's dedicated racing map. It is a large closed Grand
Prix-style course on a dark green grass base, with a fast opening straight,
an S-shaped section, an elevated back section, a tunnel, and two tighter
hairpin-like turns. The road is a wide dark ribbon with cyan and coral curbs,
dark shoulders, guard posts, center dashes, a checkered start line, and a
start gantry.

The course is sampled into 192 path points. Five item boxes alternate between
the left and right lanes at braking and corner-exit locations. Three glowing
checkpoint gates divide the lap. The tunnel occupies the middle portion of
the course and uses repeating dark frames with cyan overhead lights. These
objects are route-reading aids as much as decoration: the checkpoint gates
show where progress is measured, and the item boxes ask the player to choose
between a shorter line and a safer line.

The player auto-accelerates. `A`/`D` or the left/right arrow keys steer,
`S`/Down brakes or reverses the throttle, and `SPACE` uses a collected item.
The player's heading is gently corrected toward the track tangent, but the
driver can still take a wider or tighter line through a corner. Off-road
travel is tolerated briefly; a large shortcut across the grass is corrected
back toward the nearest tarmac point.

Race items are collected by driving through a box. The five item boxes are
cycling tactical pickups rather than arena powerups: the item HUD tells the
player what is held, and the item can be used with `SPACE`. Items can affect
the player's acceleration or a nearby racer, so timing matters more than
simply collecting the first box available. CPU drivers use the same item
state and race around the spline without arena knockback.

The race is three laps. A lap counts only when the racer has started moving
and crosses from the final section of the sampled loop into the first section
in the forward direction. Reversing across the line cannot create a false
lap. The HUD reports lap, checkpoint, position, and elapsed time. Once a
racer completes lap three, it is frozen and added to the finish order. The
results screen reports placement, time, and field size, with a larger reward
for first place.

### Bleeding (`bleeding`)

Bleeding uses a compact dark-red circular arena with a red perimeter. Every
living contestant starts at 100 health, but health drains continuously at
two points per second. Five glowing red health packets spawn at random
positions within the inner area. Touching a packet restores 30 health, capped
at 100, removes the packet, and causes another packet to appear after about
two seconds.

The HUD shows the player's current health. This makes the map a moving
resource problem: health packets are safe only if the route to them does not
expose the player to an opponent or the edge. A contestant who reaches zero
health is eliminated. The arena boundary also eliminates contestants, and
ordinary collisions can still turn a low-health scramble into a knockout.

### Fridge (`fridge`)

Fridge is a pale metallic circular arena approximately 25 units in radius.
Its defining object is a yellow five-unit spotlight that orbits around the
arena on a 15-unit radius. A matching spotlight shines down from above, so
the safe zone is visible even when characters are spread out.

Inside the spotlight, a contestant gains five health per second. Outside it,
the contestant loses three health per second. Health is capped at 100 and
starts at 100 for everyone. Reaching zero eliminates the contestant, while
crossing the outer ring is also fatal.

The best route is not a straight chase to the light's current location. The
spotlight moves continuously, so intercepting its orbit and staying near its
center is more efficient than following its edge. CPUs target the moving
spotlight when they are outside it and slow down when they have reached a
safe position.

### Pillar (`pillar`)

Pillar is a gray circular platform with a yellow edge, suspended on a tall
gray cylindrical column roughly 50 units high. The drop is mostly a visual
reminder that the edge is final; the active hazard is a large four-bladed fan
that begins near one side of the platform.

The fan rotates and orbits around the arena. Within about 15 units, it applies
a repelling wind force that increases as the distance closes. The force does
not directly remove health; it changes velocity and can push a contestant
over the edge. The controller eliminates anyone beyond the roughly 19.5-unit
safe radius.

Keep the fan between the player and the center only if there is enough space
to absorb the push. When the fan is near the edge, it can create an unexpected
launch angle, so watch its orbit rather than treating the yellow ring as the
only threat. CPUs retreat from the fan and otherwise hover near the center.

### Capture the Flag (`ctf`)

Capture the Flag is a 100-by-60 rectangular field with red and blue bases at
the far left and far right. The field has outer walls, partial mid-field
barriers, center obstacles, and side corridors. Those barriers make the route
between bases less direct and give defenders several lanes to patrol.

Each team has a pole and flag. A contestant can take the opposing flag by
touching it, carry it back through their own base, and score one point. The
flag follows its carrier. If the carrier is eliminated, the flag returns home.
The five-minute match timer is visible in the HUD; when it expires, the higher
team score wins, with a random team selected to resolve a tie.

The player is assigned to blue in the current single-player setup, while CPU
contestants alternate between red and blue. CPU attackers target the enemy
flag and return home while carrying it. CPU defenders patrol their own flag
and chase an opposing carrier. Because the mode still uses player collisions,
knockback and the outer boundary, a flag run can be stopped by positioning and
combat even before a defender reaches the carrier.

### Soccer (`soccer`)

Soccer is a green 60-by-40 enclosed field with a white center line, red and
blue goals at opposite ends, and low dark perimeter walls. Each goal has a
ten-unit opening along the z-axis, making the center lane the most obvious
scoring route while still leaving room for angled approaches.

The ball starts in the center and uses simple arcade physics. It slows through
friction, bounces from walls, and is kicked when a contestant approaches it.
Kick strength increases with the player's movement speed. A ball crossing the
left goal line scores for blue; crossing the right goal line scores for red.
After a goal, the ball resets to the center.

Soccer is a five-minute team match. The HUD shows Red, Blue, and remaining
time; the higher score wins when the clock reaches zero, with a random team
chosen on a tie. The player is blue in the current single-player setup, and
CPU behavior attempts to approach the ball from behind so contact pushes it
toward the CPU's target goal.

### Dice Hazard (`dice`)

Dice Hazard replaces the arena floor with one giant, dark 34-by-34 cube
floating over a void. The cube's center is at `(0, -17, 0)`, so its upper
face initially sits at world `y = 0`. Six colored panels are mounted to the
faces, each with pale pips and a different hazard. The first active face is
the top **Spike Grid**. The player begins at `(-12, 0.5, -12)` so the opening
spawn is away from the first face's center hazard.

The die stays still for a random 6.5–9.0 seconds, then flips to another face
over 1.65 seconds. The next face is selected from a shuffled queue that
contains every face once, so a complete queue cycle never repeats the current
face immediately. During the flip, all living contestants are anchored to
clamped world-space landing points inside ±15.75 on x/z; their character
updates and ordinary combat collisions are paused, while the camera lifts to
show the whole cube. When the flip completes, the active hazard is revealed,
the HUD timer resets, and the next interval is randomized to 5.8–9.4 seconds.
Crossing ±15.9 on x or z is a cube-edge elimination.

The six faces are:

- **Spike Grid:** 11 glowing cones are scattered over the panel. Contact is
  lethal.
- **Lava Pools:** nine orange pools occupy fixed positions with radii between
  2.6 and 4.2 units. They pulse and kill on contact.
- **Falling Stars:** eight orange-tailed star shapes fall toward the panel,
  respawning high above after reaching the surface. Their hit radius is 1.8.
- **Gravity Wells:** five purple wells sit at `(-7,6)`, `(7,6)`, `(-7,-6)`,
  `(7,-6)`, and `(0,0)` in face-local coordinates. They pull contestants
  inward, stun them for 0.45 seconds, and only become lethal within 1.6 units.
- **Laser Sweep:** three horizontal gold beams at x `-7`, `0`, and `7` slide
  laterally by up to 3.8 units. Contact is lethal, so the safe line changes
  continuously.
- **Giant Spinner:** a four-blade teal spinner turns around the face center.
  Its long blades cover almost 15 units from the hub, push with stronger
  knockback, and are lethal when they intersect a contestant.

Every hazard hit has a 0.65-second per-player cooldown. The HUD block labels
the active face and shows the time until the next flip. CPU contestants flee
the nearest active hazard, return toward the center when they approach an
edge, and otherwise circle a small central route. Dice Hazard is deliberately
single-player: the menu explains that restriction instead of entering the
online matchmaking flow.

### Warehouse (`warehouse`)

Warehouse is a 60-by-60 gray square enclosed by four red grinder assemblies,
one on each side. Each grinder has a long red base and five dark spinning
blades. Eight brown boxes begin scattered around the center, with more boxes
appearing over time up to a limit of 15. Overhead cranes periodically target
living contestants, drop from the ceiling, clamp down, and crush their target.
Flying circular saws also enter from random sides of the map.

Boxes drift and rotate across the floor. Touching one stuns a contestant for
about five seconds, which is especially dangerous near a grinder. A yellow
van occasionally enters from a random edge and drives toward one of the four
grinders. It can collect nearby boxes and contestants on its way; anything
carried when the van reaches the grinder is eliminated.

The grinders themselves are immediate-kill hazards, as is being delivered to
one by the van. There is no safe corner for long: the four grinders define
the perimeter, boxes disturb the center, the van creates a moving cross-map
threat, and cranes and saws punish predictable routes. CPUs avoid grinders,
boxes, and the van when those hazards are close, then return toward the center.
Warehouse is dynamically added to the paginated map menu and is also wired for
online matchmaking.

### Cartman Roulette (`roulette`)

Cartman Roulette is a single-player map-like event that replaces arena
movement with a birthday-party desk. The 3D room contains two imported
`playstation_1_-_south_park_-_eric_cartman.glb` characters, a loaded revolver,
a cake, gifts, balloons, bunting, and two in-world wall panels. The left panel
shows live danger, round, fear, and tears-piling values. The right panel
documents the five actions and shows that both moms are recording.

The player starts at 16% self-danger and the opponent starts at 16% danger.
Each turn offers:

- **Shoot It:** test the active self-danger value. A miss advances the round
  and raises that character's danger.
- **Reroll:** randomly shifts both displayed danger values.
- **Shoot Opponent:** test the target first; if the target survives, the
  shooter immediately takes a recoil shot with increased self-danger.
- **Eat It:** randomly guarantees a death, changes both odds, raises the odds,
  or wastes the move.
- **Spam It:** lowers the target's danger by 12 percentage points and adds
  those points to the shooter's danger, then resolves target and recoil shots.

The Cartmans call for their moms, sweat, cry, and shake harder as the round
count rises. Tears accumulate as blue puddles on the desk. The two mom
figures hold the supplied camera artwork with blinking red recording lights
and gradually turn toward the game. A normal hit creates airborne blood,
desk pools, wall splats, flesh impacts, and the supplied gun/blood sounds.

If the player wins, the birthday-room cutscene pushes in on the table, turns
the moms toward the action, flickers the party lights, and ends with an
ecstatic `YOU WIN!!!` result. If the player loses, the result is intentionally
plain and the player's mom gets a visible `HAHA!` reaction. If the active
turn is ignored for 14 seconds, one mom stops just behind the target, bashes
the target's head into the desk three times, then takes the revolver and fires
six close-range shots. That intervention adds additional blood and ends the
event with `MOM HAD ENOUGH`.

### Spikes (`spikes`)

Spikes is a dark circular arena where warning rings appear on the floor before
clusters of spikes shoot upward. The warning flashes briefly, giving players a
chance to move, but an active cluster is lethal on contact. The standard
knockback and edge rules remain active between spike events.

### Career boss: Mega Cartman (`megacartman`)

Mega Cartman is a Career-only boss arena. It is a dark rocky circular
platform about 30 units in radius with a glowing orange edge, visually mixing
the Volcano and Highway themes. Six traffic vehicles are spawned at the
beginning, while the shared meteor system adds falling hazards during the
fight.

The boss has 150 health, chases the player, and periodically enters a
four-second spinning attack. Contact during the spin removes player health
and applies heavy knockback. Mega Cartman becomes temporarily invulnerable
after taking damage, flashes while invulnerable, and can also be defeated by
being knocked beyond the boss arena's boundary. The player has a separate
100-point health pool in Career. The stage ends when the boss is defeated or
the player's health is exhausted.

### Career final boss: Kyle (`kyleboss`)

Kyle's final arena is a much larger dark-blue circular platform with a radius
of about 50 units and a green edge. The boss is rendered from the local
`IMG_5949.png` image as a large billboard sprite rather than a GLB character
model. There are no starting traffic vehicles on this stage, but falling
meteors continue to make the open arena unsafe.

Kyle has 1,500 health and chooses attacks from a rotating set: green puke
projectiles, a repeated jump-and-slam sequence, a spinning charge, a direct
chase, a radial projectile wave, a teleport behind the player, and an
expanding spiral projectile pattern. Projectiles and contact attacks reduce
the player's separate health pool, while the slam deals heavier damage and
knockback. Kyle becomes temporarily invulnerable after taking damage and can
also be defeated by falling beyond the huge platform.

This is the final Career encounter rather than a normal free-play map. Its
purpose is to combine the game's learned skills—edge awareness, hazard
reading, movement timing, and selective aggression—into a single boss fight.

### Map availability at a glance

The ordinary map builder registry contains the arena maps in the atlas. The
paginated menu exposes Classic Arena, Sewer Surge, Icefall Pits, Ice Factory,
Shrinking Platform, Synthetic, Highway, Volcano, Hot Potato, Rosenthal's
Basement, Endless Rosenthal's Basement, Spikes, Infection, Royalty, City
Escape, Giant Circuit, Bleeding, Fridge, Pillar, Capture the Flag, Soccer,
Dice Hazard, Warehouse, and the separate Cartman Roulette event. The Teams
selector currently offers Classic Arena, Ice Factory, Highway, Volcano, Hot
Potato, and King of the Hill. King
of the Hill is therefore an objective map reached through the Teams selection
flow rather than a standalone main-menu button. Mega Cartman and Kyle are
reached through Career Mode.

The online flow can matchmake the ordinary maps, including Sewer Surge and
Icefall Pits. Giant Circuit, Dice Hazard, and Cartman Roulette are
single-player-only. Giant Circuit needs its local CPU race field, Dice Hazard
pauses and repositions all local contestants during its die flips, and
Cartman Roulette runs its own party-room scene and turn state. The standard
map builder also has a safe fallback: if a requested map fails during setup,
it clears the failed scene and attempts to load Classic Arena.

## Map implementation dossiers

The atlas above is written for players. This section is the full map-by-map
reference for anyone trying to understand how an event is assembled. Every
dossier follows the same order:

- **Builder and layout** — the static geometry created when the map loads.
- **Live state** — the collections and timers that change during play.
- **Rules and AI** — the update function, elimination test, and CPU behavior.

This makes the documentation consistent across the whole roster. Giant
Circuit appears here as one dossier alongside the arena, objective, survival,
team, Career, and boss maps; its spline and lap system are summarized in the
same builder/state/rules format as every other map.

The complete roster has an additional detailed reference in
[MAP_GUIDE.md](./MAP_GUIDE.md). It explains the layout, objective, hazards,
elimination rules, CPU behavior, and availability of every map.

### Classic Arena implementation

- **Builder and layout:** `createClassicPlatform()` replaces the previous
  platform and edge with a `CylinderGeometry` of radius 20 and height 1. The
  platform is placed at `y = -0.5`, while a red `TorusGeometry` at `y = 0`
  marks the playable boundary. No walls or map-specific meshes are added.
- **Live state:** Classic Arena does not own a hazard collection or objective
  timer. It relies on the shared `gameState.player`, `gameState.enemies`,
  `gameState.powerups`, and `gameState.score`.
- **Rules and AI:** `Player.update()` checks the circular radius and calls
  `fall()` when a contestant crosses the 19.5-unit safe radius. The animation
  loop runs the ordinary `checkCollisions()` path, and CPU contestants use
  target prediction plus edge avoidance from `updateAI()`. `victory()` fires
  when the player is the last living contestant.

### Ice Factory implementation

- **Builder and layout:** `createIceFactoryPlatform()` uses the same 20-unit
  cylinder and edge ring as Classic Arena, but gives the floor a pale
  blue-white material with low roughness and some metalness. It also sets a
  pale cyan background and fog so the flat arena reads as an ice field.
- **Live state:** There is no separate ice hazard object. The map changes the
  shared movement constants instead of adding a per-frame map collection.
- **Rules and AI:** `Player.updatePlayer()` multiplies movement input by
  `1.15` on this map, and the shared velocity damping changes from `0.85` to
  `0.90`. The standard collision loop remains active, so the extra speed and
  longer slide affect both attacks and recoveries. The edge test remains
  `19.5` units; there is no special ice victory condition.

### Shrinking Platform implementation

- **Builder and layout:** `createShrinkingPlatform()` starts with a purple
  circular platform and magenta ring at radius 35. The platform is intentionally
  larger than the ordinary arenas so the event has a visible early phase.
- **Live state:** `gameState.platformRadius` stores the current safe radius and
  `gameState.shrinkTimer` stores elapsed shrink time. Both are reset by
  `resetLevelScene()` and initialized by the builder.
- **Rules and AI:** `updateShrinkingPlatform(delta)` maps 0–120 seconds from
  radius 35 to radius 5, then scales both visible meshes. `Player.update()`
  reads the current radius for the fall test, while `updateAI()` reads the
  same value when deciding whether a CPU is near the edge. Combat is still
  handled by the shared collision system; the changing boundary is the map's
  only special win-pressure system.

### Synthetic implementation

- **Builder and layout:** `createSyntheticPlatform()` creates a four-unit
  square-tile grid covering a circular area of approximately 50 units. Each
  tile is a small cyan box with a narrow gap, and `gameState.tileLookup` maps
  grid coordinates to tile records for fast occupancy checks. The red torus is
  radius 50.
- **Live state:** Each tile stores `falling`, `fallTime`, `regenerating`, and
  `regenTime`. A tile enters its falling phase when a living player occupies
  it, becomes invisible after 0.5 seconds, and remains in regeneration for
  ten seconds.
- **Rules and AI:** `updateTiles(delta)` marks occupied tiles and advances
  their animation. `Player.update()` performs the actual ground-safety check:
  no visible, solid tile beneath a living contestant means immediate
  elimination. The camera switches to an overhead view for this map. CPU
  logic scans for visible safe tiles and steers toward the nearest one, making
  tile timing more important than ordinary target pursuit.

### Sewer Surge implementation

- **Builder and layout:** `createSewerPlatform()` creates a radius-29
  cylinder at `y = -0.5`, a radius-29 green torus, a translucent radius-28.7
  water cylinder at `y = 0.08`, three ripple toruses, and four horizontal
  service pipes positioned at radius 26.5 and height 3.2. It initializes one
  central hill with `radius = 11.5`, `topHeight = 4.5`, and full scale.
- **Live state:** `gameState.sewer` contains `water`, `ripples`, `hills`,
  `corpses`, `waterLevel`, `waterMax = 4.2`, `elapsed`, `nextHillIn`,
  `hillNumber`, and `currentHill`. New hills use randomized radius
  `6.1–8.3`, height `1.25–5.05`, and position distance `9–20`. A new hill
  starts at scale `0.18` and forms over `2.2` seconds; the previous active
  hill changes to `melting`, shrinks over `6.5` seconds, and is removed at
  scale `0.12`.
- **Rules and AI:** `updateSewer(delta)` waits four seconds, then raises
  water with `min(4.2, 0.08 + (elapsed - 4) * 0.04)`. A contestant's terrain
  height is calculated from the hill's truncated-cone slope and sets
  `position.y = 0.5 + height`. After water exceeds `0.52`, the contestant
  survives only when `surfaceHeight > waterLevel + 0.12`; otherwise
  `eliminateInSewer()` lays the model flat and registers it as a floating
  corpse. CPU hill selection rejects gone/short hills, heavily weights water
  headroom, and updates faster when the current surface is close to the
  waterline. `Player.update()` and the sewer objective branch in
  `updateMinigameObjectiveAI()` must be ported together.

### Icefall Pits implementation

- **Builder and layout:** `createIcePitsPlatform()` creates a radius-29
  frozen cylinder at `y = 0`, a radius-29 cyan torus, and four vertical beams
  at radius `26.5`, height `10.5`. The initial pit is centered at `(0, 0)`
  with radius `11.5`, depth `3.8`, and full scale. The floor is rebuilt with
  `THREE.ShapeGeometry` holes for every active pit. Eight spike groups are
  placed at radius 15 with staggered offsets `0, 0.9, ... 6.3`.
- **Live state:** `gameState.icePits` contains `floor`, `pits`, `spikes`,
  `elapsed`, `spikeDepth`, `spikeMaxDepth = 3.6`, `nextPitIn`,
  `pitNumber`, and `currentPit`. Later pits spawn after ten seconds and then
  every `8–13` seconds at a non-overlapping position 10–20 units from center.
  They use radius `6.1–8.3` and depth `1.05–4.95`. Forming and melting use
  the same `2.2` and `6.5` second curves as Sewer Surge. Each spike uses a
  `7.4` second cycle: hidden at `y = 14`, descending for `1.3` seconds,
  holding for `1.8`, and retracting for `1.3`.
- **Rules and AI:** After four seconds, `spikeDepth` becomes
  `min(3.6, 0.12 + (elapsed - 4) * 0.033)`. The controller sets
  `position.y = 0.5 - pitDepth` and slightly damps velocity when entering
  deeper ice. After `spikeDepth > 0.55`, a contestant is safe only when a
  surviving pit under them has `depth > spikeDepth + 0.14`;
  `eliminateInIcePits()` handles the normal fall/victory flow. The visible
  spikes are a readable storm telegraph; the lethal rule is the depth test.
  CPU selection uses pit depth, distance, forming/melting risk, and current
  spike depth, then circles the selected pit's summit. Port the floor rebuild,
  terrain-height lookup, `Player.update()` branch, and AI branch as one unit.

### Highway implementation

- **Builder and layout:** `createHighwayPlatform()` creates an 80-by-40
  rectangular box at `y = -0.5`, adds white transverse lane marks and yellow
  center dashes, and clears any stale entries in `gameState.vehicles`.
- **Live state:** `spawnVehicle()` creates either a car or a bus, chooses a
  lane and travel direction, and pushes its record into the vehicle array.
  Eight vehicles are spawned immediately. Each record stores dimensions,
  direction, speed, and whether it is a bus.
- **Rules and AI:** `updateVehicles(delta)` moves vehicles along the x-axis,
  applies direction-scaled knockback and a two-second stun on collision, and
  replaces vehicles after they pass x = ±55. Player bounds are checked at
  `|x| <= 45` and `|z| <= 22`; crossing them eliminates the contestant.
  Highway uses standard `checkCollisions()` in addition to traffic, while CPU
  edge avoidance treats the rectangle as a separate safety shape.

### Volcano implementation

- **Builder and layout:** `createVolcanoPlatform()` creates a rough dark
  cylinder with radius 25, an orange-red edge ring, and a dark red-brown
  background/fog. It clears old meteor and lava records before starting.
- **Live state:** `gameState.meteors`, `gameState.lavaPuddles`, and
  `gameState.meteorSpawnTimer` own the hazard lifecycle. Meteors spawn above
  random points every two seconds when particles are enabled. On impact they
  become orange circular puddles with an eight-second lifetime and a
  two-unit radius.
- **Rules and AI:** `updateMeteors(delta)` moves and rotates meteors, checks
  direct hits for knockback/stun, and grows/removes puddles. A contestant
  outside radius 24.5 is eliminated by `Player.update()`. The ordinary
  collision path remains active, so players can use a collision to push an
  opponent into either the ring or a fresh impact zone.

### Hot Potato implementation

- **Builder and layout:** `createHotPotatoPlatform()` creates a 20-unit
  orange cylinder with a red torus and clears `gameState.bomb`. The bomb
  mesh is created only after the countdown so the holder is selected from
  living contestants.
- **Live state:** `spawnBomb()` stores the current holder, a 15-second timer,
  a pass timer, and the fuse spark. `updateBomb(delta)` follows the holder,
  accelerates the spark pulse as the timer falls, performs contact passing,
  and automatically passes from a CPU after two seconds.
- **Rules and AI:** `explodeBomb()` eliminates the holder, plays an expanding
  effect, removes the bomb, and schedules a replacement after three seconds
  if the round continues. `updateAI()` steers the holder toward a recipient
  and all other CPUs away from the holder. The ordinary radius-19.5 edge
  elimination and collision system still run between explosions.

### King of the Hill implementation

- **Builder and layout:** `createKingOfHillPlatform()` adds a radius-25
  olive base, an elevated-looking gold cylinder of radius 8, four ramps, and
  the standard outer red ring. The elevated mesh is a visual landmark; the
  logical game remains on the flat movement plane.
- **Live state:** `gameState.hillScores` stores points by display name and
  `gameState.hillTimer` throttles scoring checks. The score table is
  initialized for the player and every CPU at map creation/start.
- **Rules and AI:** `updateKingOfHill(delta)` checks the center every 0.1
  seconds. A living contestant within radius 8 earns one point, and 100
  points calls `victory(player)`. The HUD sorts and prints the leading three
  scores. CPUs use the objective branch in `updateMinigameObjectiveAI()` and
  steer toward `(0, 0)` rather than selecting ordinary combat targets.

### Rosenthal's Basement implementation

- **Builder and layout:** `createLockdownPlatform()` creates a 60-by-60
  concrete floor, foundation walls, storage-room partitions, shelving, crates,
  workbenches, overhead pipes, and a boiler. Every gameplay wall is recorded
  with x/z position and width/depth in `gameState.walls`.
- **Live state:** `gameState.shooter` holds the active Mr. Rosenthal object,
  while the wall records are used by both movement collision and projectile
  collision. His projectile list carries Vaseline blobs and his puddle list
  carries fading milk trails. `gameState.survivalTimer` drives the HUD but
  there is no automatic five-minute victory; the regular mode still resolves
  through the normal last-contestant check.
- **Rules and AI:** A `Shooter` is spawned after the countdown. It uses
  `AStarPathfinding` on a two-unit grid, recomputes a path once per second,
  fires every 1.2 seconds, accelerates over time, and kills on direct contact.
  Projectiles last four seconds, disappear at walls/bounds, leave milk puddles,
  slow anyone standing on them, and stun with knockback on impact. CPUs use
  the same map objective branch to flee when the shooter is nearby.
- **Endless variant:** `gameState.endlessBasement` is enabled only by the
  separate Endless Rosenthal's Basement button. It keeps eliminated
  contestants out, hands the camera to surviving contestants, and suppresses
  victory/game-over resolution while keeping the same map and hazards.

### Infection implementation

- **Builder and layout:** `createInfectionPlatform()` builds a Classic-style
  radius-20 cylinder and red edge, then changes the atmosphere to deep red.
  It does not add a new physical obstacle; infection state is layered onto
  the shared character scene.
- **Live state:** `gameState.infectionTimer` tracks the current phase and
  `gameState.infectionFinale` marks the last-survivor phase. `startGame()`
  marks the first CPU infected and tints its character red. Every other
  contestant starts uninfected.
- **Rules and AI:** `checkInfectionCollisions()` tests infected characters
  against survivors at a 1.5-unit contact distance and tints newly infected
  models. `updateInfection(delta)` allows a five-minute normal phase and a
  50-second finale once no survivors remain. `updateMinigameObjectiveAI()`
  makes infected CPUs pursue survivors and survivor CPUs flee infected
  contestants; the normal knockback collision branch is replaced by the
  infection contact branch.

### Royalty implementation

- **Builder and layout:** `createRoyaltyPlatform()` creates a radius-25
  brown arena with a gold edge and calls `spawnSword()` six times at evenly
  spaced positions on radius 15. A sword is a small metallic blade and wood
  handle assembled in a group.
- **Live state:** Every sword record stores its world position, collected
  state, mesh, and rotation. When collected, its mesh is reparented to the
  holder and `hasSword` is set on that player. A delayed callback returns it
  to the scene after ten seconds.
- **Rules and AI:** `updateRoyalty(delta)` rotates/bobs free swords, detects
  pickups within 1.5 units, and applies five health damage when an armed
  contestant is within two units of another contestant. Everyone starts at
  100 health; zero health eliminates the target. Unarmed CPUs seek swords,
  while armed CPUs pursue the nearest opponent.

### City Escape implementation

- **Builder and layout:** `createCityEscapePlatform()` starts with one
  30-by-30 gray building at the origin and initializes the building, bridge,
  and debris collections. The map uses a sky-blue background and long fog
  distance to keep the open gap readable.
- **Live state:** `gameState.buildings` holds active rooftops,
  `gameState.currentBuilding` identifies the current route node,
  `gameState.bridgeTimer` controls the timed transition, `gameState.bridge`
  stores the active bridge, and `gameState.fallingDebris` stores falling
  hazards.
- **Rules and AI:** `updateCityEscape(delta)` creates the next 20-by-20
  building after the bridge timer reaches ten seconds, places a bridge in a
  random cardinal direction, schedules three debris drops, and removes old
  buildings after the active pair grows beyond two. A contestant must overlap
  a building or bridge footprint or is eliminated. Debris applies a
  one-second stun and knockback. CPU route selection targets the newest
  building. The current implementation retains the active bridge reference
  after the first generated transition, so the map currently documents one
  timed crossing rather than promising an endless sequence.

### Bleeding implementation

- **Builder and layout:** `createBleedingPlatform()` creates a radius-20
  dark-red cylinder and red edge, then spawns five health packets. Packet
  positions are randomized within radius 15 and use bright emissive red cube
  meshes so they remain readable against the floor.
- **Live state:** `gameState.healthPackets` stores packet mesh, position,
  rotation, and collected status. The player's and CPUs' `health` values
  begin at 100. A collected packet is removed and a replacement is scheduled
  two seconds later.
- **Rules and AI:** `updateBleeding(delta)` drains every living contestant
  at two health per second, restores 30 health on pickup up to 100, and
  eliminates at zero. `updateAI()` prioritizes a packet when health is low or
  the packet is already nearby, otherwise it returns toward the center.
  The shared collision and radius-19.5 boundary checks remain active.

### Fridge implementation

- **Builder and layout:** `createFridgePlatform()` creates a pale metallic
  radius-25 cylinder and white edge ring, then adds a translucent yellow
  circle and a matching `SpotLight`. The spotlight starts at the origin.
- **Live state:** `gameState.spotlight` stores the floor mesh, light, position,
  and angle; `gameState.freezeTimer` is the motion clock. The spotlight moves
  around a radius-15 orbit at half a radian per second.
- **Rules and AI:** `updateFridge(delta)` relocates both the visible circle
  and light, grants five health per second within five units, and drains
  three health per second outside it. Health is capped at 100 and zero
  eliminates a contestant. CPUs steer toward the spotlight when farther than
  3.5 units and damp their velocity once they are safely inside it.

### Pillar implementation

- **Builder and layout:** `createPillarPlatform()` creates a radius-20 gray
  cylinder, a yellow edge, and a 50-unit-high support column below it. A
  four-bladed fan group starts near `(10, 2, 0)` and is stored in
  `gameState.fan`.
- **Live state:** `gameState.fanAngle` drives both blade rotation and the
  fan's orbit. The fan moves around a radius-12 circle while its wind checks
  use a radius-15 influence zone.
- **Rules and AI:** `updatePillar(delta)` pushes players away from the fan
  with force proportional to proximity. It does not subtract health; it
  changes velocity so the shared `Player.update()` edge test can eliminate a
  contestant beyond radius 19.5. CPUs flee the fan when it is within 12
  units and otherwise prefer the center.

### Capture the Flag implementation

- **Builder and layout:** `createCTFPlatform()` builds a 100-by-60 gray field,
  red and blue bases at x = -42 and x = 42, outer perimeter walls, lane
  barriers, center obstacles, and side corridors. Each flag is a pole-plus-
  banner group stored in `gameState.flags`.
- **Live state:** `gameState.teams` contains red/blue contestants,
  `gameState.flagCarriers` maps a flag team to its carrier, and
  `gameState.teamScores` stores points. Flag state records whether the flag
  is captured and its home position.
- **Rules and AI:** `updateCTF(delta)` runs a 300-second clock, lets an
  opposing player pick up a flag within two units, follows the carrier, and
  awards a point when the carrier reaches their own base within five units.
  A dead carrier returns the flag home. `updateCTFAI()` gives CPUs offense or
  defense roles. The five-minute score comparison resolves the team winner;
  walls and rectangular bounds still make positioning and knockback matter.

### Soccer implementation

- **Builder and layout:** `createSoccerPlatform()` creates a 60-by-40 green
  field, a white center line, red/blue goal markers, and four boundary walls.
  The ball is a white sphere stored in `gameState.ball` with position and
  velocity vectors.
- **Live state:** `gameState.ball.velocity` is damped every frame, while
  `gameState.teamScores` and `gameState.survivalTimer` hold match progress.
  Team assignment is automatic for the map: the player is blue and CPUs
  alternate red/blue.
- **Rules and AI:** `updateSoccer(delta)` bounces the ball off walls, turns
  player contact into a kick whose strength includes player velocity, resets
  the ball after a goal, and runs the 300-second timer. The left goal awards
  blue and the right goal awards red. CPU soccer AI approaches from behind
  the ball and then steers toward its team's goal.

### Dice Hazard implementation

- **Builder and layout:** `createDicePlatform()` creates one
  `BoxGeometry(34, 34, 34)` centered at `(0, -17, 0)`, a dark void plane at
  `y = -70`, and six face groups positioned at the cube's six normals. Each
  panel is `33.35` units square and is decorated with pips plus one hazard
  group. The face definitions, in order, are Spike Grid, Lava Pools, Falling
  Stars, Gravity Wells, Laser Sweep, and Giant Spinner. The face quaternion
  array maps each selected face to the cube orientation shown to the player.
- **Live state:** `gameState.diceMap` stores `group`, `center`,
  `sideLength = 34`, `halfSide = 17`, `faces`, `faceGroups`, `hazards`,
  `faceQuaternions`, `currentFace`, `targetFace`, `faceQueue`, roll progress,
  `rollDuration = 1.65`, `rollTimer`, `nextRoll`, `hazardPreviewRemaining`,
  interpolation quaternions, and rider anchor maps. The opening state is face
  `0` with a next-roll interval of `6.5–9.0` seconds. Each revealed face shows
  its hazards transparently for a 2.5-second preview window before collision
  effects begin.
- **Face hazards:** Spike Grid creates 11 cones with collision radius 2.15.
  Lava Pools use nine fixed local positions and radii
  `2.6–4.2` before a `+0.55` collision margin. Falling Stars create eight
  moving groups with radius 1.8. Gravity Wells use five positions with radius
  4.9 and pull players from a 12-unit range, stun for `0.45` seconds near the
  well, and eliminate only inside radius `1.6`. Laser Sweep uses three
  `8.8`-unit beams with collision radius `3.1`; Giant Spinner uses four
  `1.45 × 29` blades and a local blade intersection test. Each face has a
  35% chance to receive a variant such as Dense Field, Wide Pools, Meteor
  Shower, Deep Gravity, Crossfire, or Broad Blades.
- **Rules and AI:** `beginDiceRoll()` shuffles all six face indices, avoids an
  immediate repeat, hides every hazard group, and anchors living contestants
  to x/z `±15.75`. `updateDiceMap(delta)` eases the cube quaternion with a
  cubic ease-in/out, freezes rider updates while rolling, then resets the
  interval to `5.8–9.4` seconds. Active hazard hits use a per-player
  `0.65`-second cooldown, and hazards cannot affect players during the
  2.5-second preview window. All listed hazards except Gravity Wells eliminate
  on contact; a gravity well pulls/stuns first and kills only at its inner
  radius. The Giant Spinner rotates at a slower `1.1` radians per second. The
  `Player.update()` edge check uses `±15.9`. The camera has a
  dedicated high view while rolling, ordinary `checkCollisions()` is skipped
  during the flip, and `updateMinigameObjectiveAI()` steers CPUs away from
  the nearest active hazard. `updateDiceHUD()` owns `#diceHud`,
  `#diceFaceStatus`, and `#diceRollStatus`. Desktop movement also accepts
  standard gamepads: left stick/D-pad movement, right stick or shoulder-button
  camera turning, and A/Space to use a Circuit item.

### Warehouse implementation

- **Builder and layout:** `createWarehousePlatform()` creates a 60-by-60
  gray floor and four red grinder groups at the cardinal edges. Each grinder
  contains five individually rotating blades. Eight boxes are spawned in the
  center region at round start.
- **Live state:** `gameState.warehouseBoxes` stores drifting boxes,
  `gameState.grinders` stores the grinder meshes/blades, and
  `gameState.warehouseVan` stores the one active yellow van or `null`.
  Boxes are replenished randomly until there are 15. Only one van can be
  active at a time.
- **Rules and AI:** `updateWarehouse(delta)` rotates blades, kills players
  within three units of a grinder, moves boxes and stuns players for five
  seconds on contact, and occasionally launches a van from a random edge.
  The van collects nearby players and boxes, then eliminates captured players
  on reaching its target grinder. CPU logic avoids grinders, boxes, and the
  van before returning toward the center.

### Cartman Roulette implementation

- **Entry and layout:** `#rouletteMapBtn` is added to the paginated map menu.
  It opens `#rouletteMap`, which owns a dedicated Three.js renderer and
  `#rouletteMapCanvas` instead of entering the shared movement simulation.
  `roulette-map.js` builds the party room, desk, cake, decorations, imported
  Cartman models, wall text panels, gun, and two mom audience figures.
- **Assets and audience:** The Cartmans load from
  `playstation_1_-_south_park_-_eric_cartman.glb`. The moms use
  `uploads/Liane_Cartman0.webp`; each holds a plane textured from
  `uploads/download__9_.png` and has a blinking red recording light. Mom
  rotations interpolate from a side-facing pose toward the desk as rounds
  advance or during the win cutscene.
- **Live state:** `game.selfOdds`, `game.opponentOdds`, `game.turn`,
  `game.round`, `game.busy`, `game.over`, `game.lastAction`, and
  `game.idlePunished` hold the turn system. `world.blood` stores moving blood
  drops and static desk/wall stains. Character distress stores sweat,
  streaming tears, speech sprites, and growing desk tear pools.
- **Rules:** `takeAction()` routes Shoot It, Reroll, Shoot Opponent, Eat It,
  and Spam It into the action handlers. Misses call `passTurn()`, which
  increases the round and swaps the active actor. The CPU selects actions
  from current danger values. A 14-second idle timer starts
  `startIdleAttack()`, which moves a mom behind the target, performs three
  bashes, then fires six shots before ending the event.
- **End states:** `finishGame()` creates the normal blood burst and selects
  either the plain loss result or `startWinningCutscene()`. Winning moves the
  camera toward the desk, changes the birthday wall panel, turns the moms,
  brightens the party lights, and ends on the ecstatic victory result.
  Losing triggers the player's mom reaction. Roulette audio is loaded from
  the supplied files under `uploads/`, including the birthday track,
  revolver/pistol effects, flesh impact, and blood effects.

### Giant Circuit implementation

- **Builder and layout:** `createRaceCircuitPlatform()` builds the 210-by-190
  grass base, a 17-point closed Catmull-Rom spline sampled into 192 points,
  road/curb/shoulder ribbons, start gantry, checkpoints, tunnel frames,
  guard posts, center dashes, and five item-box locations.
- **Live state:** `gameState.raceTrack` stores the curve, path, road width,
  path length, item boxes, and checkpoints. `gameState.race` stores the
  three-lap limit, elapsed time, finish order, and temporary banana hazards.
  Each racer stores nearest path index, lap count, checkpoint progress,
  forward progress, item, heading, and finish state.
- **Rules and AI:** `updateRaceItems()` handles item boxes, boosts, traps,
  shells, lightning, and temporary hazards. `updateRaceProgress()` corrects
  large grass shortcuts, validates checkpoints, detects forward start-line
  crossings, and freezes finishers. `updateRaceAI()` aims six samples ahead.
  The animation loop intentionally skips arena knockback for the circuit and
  ranks racers by completed laps plus path progress.

### Mega Cartman boss implementation

- **Builder and layout:** `createBossPlatform()` creates a radius-30 dark
  rock arena with an orange edge and volcanic fog. `createMegaCartmanBoss()`
  adds the scaled Cartman boss and six starting vehicles. Shared meteor and
  vehicle updates also run on the boss map.
- **Live state:** `MegaCartmanBoss` stores 150 maximum health, spin state,
  attack cooldown, invulnerability timer, and its own position/velocity.
  Career gameplay gives the player a separate 100-point health pool.
- **Rules and AI:** The boss chases the player and enters four-second spinning
  attacks. A moving spin hit removes five player health and applies
  knockback. Player contact while moving deals ten boss damage and grants
  the boss 1.5 seconds of invulnerability. The boss can be defeated by
  health depletion or by crossing its 29-unit safe radius; the player's
  health reaching zero ends the level.

### Kyle boss implementation

- **Builder and layout:** `createKyleBossPlatform()` creates a radius-50 gray
  platform with a green edge and dark-blue fog, clearing stale meteor and
  vehicle arrays first. `createKyleBoss()` loads `IMG_5949.png` as a
  billboard sprite, with a generated fallback texture if the image fails.
- **Live state:** `KyleBoss` stores 1,500 health, attack selection/timers,
  projectile records, spin state, slam target, and invulnerability. The
  player again uses the separate Career health pool.
- **Rules and AI:** `chooseAttack()` selects puke, slam, spin, chase, wave,
  teleport, or spiral behavior. `executeAttack()` creates the corresponding
  projectile, movement, or contact pattern; projectiles damage the player and
  are removed on collision, timeout, or leaving the platform. Player contact
  deals ten boss damage with a two-second invulnerability window. Kyle can
  also lose by leaving the 49-unit safe radius, which completes Career Mode.

## HUD and finish flow

The normal arena score remains available through the `#score` element. Circuit
mode shows an additional `#raceHud` block containing:

- `#raceLap` — current lap out of three
- `#racePosition` — current placement and total field size
- `#raceTimer` — elapsed race time

`updateRaceMode(delta)` advances the timer and refreshes the HUD after the
player and CPU updates for the frame. The race does not call the usual arena
collision routine, so a close pass is not treated as a punch or knock-out.

When the human driver finishes, `victory()` routes Circuit mode to
`showRaceResults()` instead of the normal Cartman pile animation. That screen
shows placement, total time, racer count, and a Back to Menu button. A first
place finish awards more Dollahs than a non-winning completion.

## Skins and economy

The shop currency is displayed as **Dollahs**. Diamonds can be exchanged from
Dollahs in the Currency screen.

Military Kenny is a built-in skin backed by
[military_kenny.glb](./military_kenny.glb) and costs 1,000 diamonds.

Character assets are registered in the `skinsData` catalog in `game.js`.
Assets are loaded at startup, sanitized before use, and cloned through a
guarded character-model pipeline. If a model is malformed or unavailable, the
fallback character is used so the renderer can continue.

The secret Cartman GIF skin has dedicated crying stun frames and throwing
tantrum fall frames. Those animations are loaded alongside its idle, running,
and victory GIFs.

The persisted wallet still uses the legacy `credits` field internally so
existing balances remain compatible. The player-facing label is Dollahs.

Powerups are part of the arena loop. Speed Boost increases movement speed for a
short duration, while Power Punch strengthens the next combat interactions.
Giant Circuit hides the combat ability cards and does not spawn arena powerups
because the race is determined by driving progress rather than knockback.

## Multiplayer

Online multiplayer is temporarily disabled while its room transport is migrated from the previous platform service. Single-player modes remain available.

Giant Circuit is currently single-player by design. This prevents a player from
entering a race with no local CPU field while multiplayer race synchronization
is still being designed. The mode button gives an explicit message if it is
selected while the online flow is active.

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Direct entry point, canvas, menus, HUD elements, overlays, audio elements, and script loading |
| `game.js` | Three.js scene setup, map builders, player/AI classes, input, rendering, modes, menus, economy, multiplayer, and race logic |
| `roulette-map.js` | Separate Cartman Roulette party-room scene, imported Cartmans, turn rules, audience, cutscenes, blood, and audio |
| `roulette-map.css` | Cartman Roulette map HUD, action controls, result overlay, and responsive layout |
| `README.txt` | Player and developer documentation |
| `MAP_GUIDE.md` | Complete detailed reference for every free-play map, special variant, race, and Career boss arena |
| `build-portable.js` | Regenerates the standalone page with inlined game code and relative media paths |
| `portable.html` | Generated standalone page; keep the referenced local media beside it |
| `*.glb` | Character and environment models |
| `*.gif`, `*.png`, `*.jpeg` | Sprite and image assets used by skins or UI |
| `*.mp3`, `*.wav`, `*.ogg`, `*.flac` | Menu, arena, victory, and effect audio |
| `c141a29b-0929-4357-ad6f-54fd7be82e58.mp4` | Local project video asset |

The project intentionally has no `package.json`, `node_modules`, or bundler.
Do not add those files for normal feature work.

## Runtime lifecycle

The main lifecycle is:

1. Three.js, loaders, and input libraries are imported from CDN modules.
2. Renderer, camera, lighting, and persistent objects are created.
3. Skin assets load through guarded promises.
4. The menu and shop handlers are installed.
5. A mode button calls `startGame(mapType)`.
6. The previous dynamic scene is disposed.
7. The selected map builder creates its geometry and mode state.
8. Player and CPU objects are created and placed.
9. A countdown starts the simulation.
10. `renderer.setAnimationLoop(animate)` updates input, actors, objectives,
    camera, and rendering.
11. A mode-specific finish handler ends the round.

`resetLevelScene()` clears dynamic scene objects and map-specific arrays between
rounds. Lighting and other persistent objects are deliberately retained. Map
builders should add disposable geometry to the scene and put gameplay
references in `gameState` so the reset path can clear them.

`safelyRun(label, callback)` isolates individual frame systems. If one
optional asset or objective updater throws, the renderer logs the failure and
continues the rest of the frame.

## Adding another map

To add a new map without disrupting existing modes:

1. Add a `createExamplePlatform()` builder near the other map builders.
2. Register it in the `mapBuilders` object inside `buildMapSafely()`.
3. Add a `.menuBtn` to the map menu in `index.html`.
4. Add a click handler in `setupModeButtons()`.
5. Reset any new collections in `resetLevelScene()`.
6. Add a mode-specific updater to `animate()` only if the map needs one.
7. Add an objective branch in `updateMinigameObjectiveAI()` if CPU behavior
   needs a destination other than arena combat.
8. Add the map to this README and to any known-map validation lists.
9. Run `node --check game.js`.

For a map with a non-arena win condition, keep the win logic separate from
generic knock-out checks. This is the pattern used by Circuit mode: it has its
own state, progress updater, HUD, and result screen, while reusing the shared
player and renderer infrastructure.

## Development checks

Use the following quick checks after editing:

```bash
node --check game.js
rg -n "circuit|Giant Circuit|raceTrack|raceHud" index.html game.js README.txt
```

The first command catches syntax errors in the browser module. The second
confirms that the map is wired through the entry point, runtime, and docs.

Tenslant ID account linking uses an authorization-code flow with PKCE. The registered callback is https://tenslant44.github.io/Cartman-Royale/; cloud saves request only profile saves:read saves:write. OAuth tokens remain in memory, and local saves remain usable while the service is unavailable.

## Troubleshooting

### The menu opens but a map does not start

Check the browser console for a map-builder error. `buildMapSafely()` falls
back to Classic Arena if a map fails, so a visible Classic Arena can mean that
the requested builder threw during initialization.

### The race HUD is missing

Confirm that `startGame('circuit')` is called by the Circuit button and that
`#raceHud`, `#raceLap`, `#racePosition`, and `#raceTimer` still exist in
`index.html`. The HUD is hidden for all other maps.

### CPU drivers remain at the grid

The race starts only after the countdown. Once the simulation begins, confirm
that `gameState.mapType` is `circuit`, `gameState.raceTrack.path` has 192
points, and `updateRaceAI()` is reached from the objective-AI branch.

### A lap does not count

The detector requires a forward seam crossing. Drive around the full loop and
cross the checkered line from the final section of the circuit into the first
section. Reversing over the line is intentionally ignored.

### The project feels slow

Open Graphics Settings and choose a lower preset, disable shadows or particles,
and reduce render distance. Giant Circuit uses a single indexed road mesh plus
small decorative meshes, but character models and shadows can still dominate
GPU time on mobile hardware.

### Audio does not start

Browsers may block autoplay until a user gesture. Start the game from a menu
button or tap the page first. The game catches autoplay failures and continues
without audio.

### A model is missing

The character pipeline logs a loading error and falls back to the default
Cartman model. Check the asset filename and the corresponding `skinsData`
entry before changing the renderer.
