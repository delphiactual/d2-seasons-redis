const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');

const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};
const newEvent = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const categoryBlacklist = [18, 1784235469, 53, 16]; // Currencies, Bounties, Quests, Quest Steps
  const seasonBlacklisted = categoryHashes.some((v) => categoryBlacklist.indexOf(v) !== -1);
  const eventBlacklisted = false; // TODO will require collectible information

  items[hash] = JSON.stringify(inventoryItem[key]);

  if (!seasonBlacklisted) {
    // Only add items not currently in db and not blacklisted
    newSeason[hash] = seasons[hash] || calculatedSeason;
  } else {
    // delete any items that got through before blacklist or when new blacklist items are added
    delete newSeason[hash];
  }

  if (events[hash] && !eventBlacklisted) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  } else {
    delete newEvent[hash];
  }
});

writeFile(newEvent, 'output/events.json');
writeFile(newSeason, 'output/seasons.json');

writeFile(newEvent, 'data/events.json');
writeFile(newSeason, 'data/seasons.json');
