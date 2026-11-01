# Online co-op: plan

Local co-op (two players, one device) ships in the game today. This is the plan for playing
together on two phones. Nothing here is built yet beyond the groundwork listed below.

## What is already in place

- **The engine runs any number of players.** `update(g, inputs, dt)` takes one `Input` per player
  (`src/game/engine.ts`). Heroes, revives, shared XP, party blessings, auto-attack and
  per-player shots (`Bullet.owner`) all work. An online game feeds remote inputs into the same
  call.
- **Game state is plain data.** `Game` holds only numbers, strings, arrays and plain objects (plus
  one `Set` per piercing shot), so it can be serialized for snapshots.
- **The setup is one value.** `Setup` (heroes, weapons, mode, difficulty) is everything a second
  device needs to start the same run.

## Recommended approach: host-authoritative, input over the network

One phone (the host) runs the real simulation. The other (the guest) sends its `Input` every
frame and draws the snapshots the host sends back.

| Step | Work |
|---|---|
| 1. Transport | A small WebSocket relay (Node, about 150 lines) that pairs two phones by a 4-letter room code. Host it on any small server or a managed service such as Fly.io or Render. |
| 2. Lobby UI | "2P Online" on the select screen: *Gumawa ng silid* (create room, shows the code) and *Sumali* (join, type the code). Both players pick heroes, the host starts. |
| 3. Guest input | The guest sends `{mx, my, attack, skill, dodge}` about 30 times a second. The host applies it as `inputs[1]`. |
| 4. Snapshots | The host sends a trimmed `Game` (heroes, enemies, bullets, pickups, fx, banner, choice) 15 to 20 times a second. The guest interpolates positions between snapshots. |
| 5. Feel | Predict the guest's own movement locally and correct to the host's position, so their hero does not lag behind their thumb. |
| 6. Edge cases | Pausing for both players, a dropped connection (the host's AI takes over the guest's hero, or the run ends), rejoining, and the dambana choice (host decides, or first tap wins). |

Rough size: the relay plus steps 2 to 4 is about one to two weeks of work; prediction and edge
cases (steps 5 and 6) take about another week.

## Alternatives considered

- **Lockstep** (both phones run the simulation and swap only inputs). Uses less bandwidth, but
  needs a fully deterministic engine. Today the engine uses `Math.random` and frame-time `dt`, so
  this would mean a seeded random generator and a fixed timestep first. Also, one late input
  stalls both players.
- **Bluetooth or local Wi-Fi without a server.** Needs native modules that Expo Go does not
  include, so it requires a development build (`eas build --profile development`). This option
  is worth considering if a server is unwanted.
- **A hosted game backend** (for example Colyseus Cloud, Photon or Nakama). Faster to start, but
  adds a monthly cost and a dependency.

## Costs and decisions needed

- **Hosting.** A relay for a small player base fits in a free or around US$5/month tier. Who owns
  the account?
- **Matchmaking.** Room codes only (simplest), or public matchmaking (needs moderation and abuse
  handling)?
- **Privacy.** Room codes and inputs only, with no accounts or personal data. If accounts are
  added later, the app needs a privacy policy and the store data-safety forms updated.
