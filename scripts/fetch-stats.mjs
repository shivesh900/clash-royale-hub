// Fetches Shivesh's Clash Royale profile + battle log from the official Clash Royale API
// and writes site/data/player.js (+ player.json) for the static stats page.
// Runs in GitHub Actions (.github/workflows/update-stats.yml). Needs the CR_API_TOKEN secret.
// The official API only accepts keys locked to fixed IPs, so by default we call it through
// RoyaleAPI's public proxy (whitelist IP 45.79.218.79 on your key). Override with CR_API_BASE.
import { writeFileSync, mkdirSync } from 'node:fs';

const token = process.env.CR_API_TOKEN;
const tag = (process.env.PLAYER_TAG || '#88GUYV9J9').trim().toUpperCase().replace(/^#?/, '#');
const base = (process.env.CR_API_BASE || 'https://proxy.royaleapi.dev/v1').replace(/\/$/, '');
const out = process.env.OUT_DIR || 'data';

if (!token) {
  console.log('::notice::CR_API_TOKEN secret is not set yet; skipping stats update.');
  process.exit(0);
}

async function get(path) {
  const res = await fetch(base + path, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} on ${path}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

const enc = encodeURIComponent(tag);
const player = await get(`/players/${enc}`);
let battles = [];
try { battles = await get(`/players/${enc}/battlelog`); } catch (e) { console.log('::warning::battle log: ' + e.message); }

const keepCard = (c) => ({ id: c.id, name: c.name, level: c.level, maxLevel: c.maxLevel, evolutionLevel: c.evolutionLevel, elixirCost: c.elixirCost, rarity: c.rarity, iconUrls: c.iconUrls });
const slimPlayer = {
  tag: player.tag, name: player.name, expLevel: player.expLevel, trophies: player.trophies, bestTrophies: player.bestTrophies,
  wins: player.wins, losses: player.losses, battleCount: player.battleCount, threeCrownWins: player.threeCrownWins,
  arena: player.arena, role: player.role, clan: player.clan, donations: player.donations, totalDonations: player.totalDonations,
  currentPathOfLegendSeasonResult: player.currentPathOfLegendSeasonResult, bestPathOfLegendSeasonResult: player.bestPathOfLegendSeasonResult,
  currentFavouriteCard: player.currentFavouriteCard && keepCard(player.currentFavouriteCard),
  currentDeck: (player.currentDeck || []).map(keepCard),
  cardsOwned: (player.cards || []).length,
};
const slimBattles = battles.slice(0, 25).map((b) => ({
  type: b.type, battleTime: b.battleTime, gameMode: b.gameMode, arena: b.arena,
  team: (b.team || []).map((p) => ({ name: p.name, tag: p.tag, crowns: p.crowns, trophyChange: p.trophyChange, startingTrophies: p.startingTrophies })),
  opponent: (b.opponent || []).map((p) => ({ name: p.name, tag: p.tag, crowns: p.crowns, startingTrophies: p.startingTrophies, cards: (p.cards || []).map((c) => c.id) })),
}));
const meta = { tag, updated: new Date().toISOString(), status: 'ok', source: 'Clash Royale API' };

mkdirSync(out, { recursive: true });
writeFileSync(`${out}/player.json`, JSON.stringify({ meta, player: slimPlayer, battles: slimBattles }, null, 1));
writeFileSync(`${out}/player.js`, '/* Written by .github/workflows/update-stats.yml */\n' +
  'window.CR_PLAYER = ' + JSON.stringify(slimPlayer) + ';\n' +
  'window.CR_BATTLES = ' + JSON.stringify(slimBattles) + ';\n' +
  'window.CR_PLAYER_META = ' + JSON.stringify(meta) + ';\n');
console.log(`Saved ${slimPlayer.name} (${tag}): ${slimPlayer.trophies} trophies, ${slimBattles.length} battles.`);
