# Clash Hub ⚔️

Clash Royale **deck builder** + **personal stats page** for player `#88GUYV9J9`, hosted on GitHub Pages.

**Live:** https://shivesh900.github.io/clash-royale-hub/

## Deck builder (`index.html`)
- Every current card (official Clash Royale API card list, art served from this repo)
- Pick 8 → average elixir, 4-card cycle, win condition / spells / air defense / building balance, deck tips
- Filter by elixir, rarity and type; search by name
- **Share deck** — the URL carries the cards (`?deck=26000000;26000001;…`)
- **Copy to Clash Royale** — official `link.clashroyale.com/…copyDeck` link, opens the deck in the game

## Stats (`stats.html`)
Trophies, best trophies, arena, king level, wins/losses, clan, current deck (opens in the builder) and recent battles.

Data comes from the official Clash Royale API via `.github/workflows/update-stats.yml`, which runs every 3 hours, writes `data/player.js`, and commits it.

### Turning stats on (one-time)
1. Make a free key at https://developer.clashroyale.com → *My Account* → *Create New Key*, allowed IP **45.79.218.79** (the RoyaleAPI proxy, because GitHub's runners have no fixed IP).
2. Repo → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*: name `CR_API_TOKEN`, value = the key.
3. *Actions* → **Update Clash stats** → *Run workflow*.

Fan project. Not affiliated with or endorsed by Supercell. Card art © Supercell.
