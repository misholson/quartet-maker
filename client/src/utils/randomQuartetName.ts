import { uniqueNamesGenerator, adjectives } from 'unique-names-generator'

const pluralNouns = [
  // Music & performance
  'Harmonies', 'Chords', 'Melodies', 'Cadences', 'Refrains',
  'Ballads', 'Sonnets', 'Overtures', 'Verses', 'Odes',
  'Serenades', 'Balladeers', 'Carolers', 'Crooners', 'Serenaders',
  'Troubadours', 'Minstrels', 'Bards', 'Lyricists', 'Composers',
  'Conductors', 'Maestros', 'Virtuosos', 'Soloists', 'Voices',
  'Tenors', 'Baritones', 'Basses', 'Notes', 'Echoes',
  // People & characters
  'Gentlemen', 'Fellows', 'Scholars', 'Sages', 'Philosophers',
  'Cavaliers', 'Knights', 'Barons', 'Earls', 'Dukes',
  'Lords', 'Counts', 'Regents', 'Sovereigns', 'Heralds',
  'Envoys', 'Ambassadors', 'Diplomats', 'Emissaries', 'Stewards',
  'Champions', 'Heroes', 'Legends', 'Guardians', 'Defenders',
  'Sentinels', 'Watchmen', 'Wardens', 'Rangers', 'Scouts',
  'Pioneers', 'Explorers', 'Voyagers', 'Navigators', 'Cartographers',
  'Adventurers', 'Wanderers', 'Ramblers', 'Pilgrims', 'Nomads',
  'Drifters', 'Travelers', 'Settlers', 'Frontiersmen', 'Mountaineers',
  // Rogues & scoundrels
  'Rogues', 'Rascals', 'Scoundrels', 'Vagabonds', 'Mavericks',
  'Rebels', 'Renegades', 'Outlaws', 'Desperados', 'Daredevils',
  'Scalawags', 'Ruffians', 'Buccaneers', 'Privateers', 'Corsairs',
  'Musketeers', 'Mariners', 'Sailors', 'Captains', 'Commodores',
  // Tradespeople & craftsmen
  'Barbers', 'Artisans', 'Craftsmen', 'Tinkerers', 'Inventors',
  'Architects', 'Builders', 'Masons', 'Smiths', 'Weavers',
  'Potters', 'Brewers', 'Vintners', 'Coopers', 'Millers',
  'Tailors', 'Cobblers', 'Chandlers', 'Hatters', 'Glaziers',
  'Trappers', 'Drovers', 'Shepherds', 'Farriers', 'Muleteers',
  // Scholars & mystics
  'Alchemists', 'Astronomers', 'Chroniclers', 'Historians', 'Scribes',
  'Orators', 'Storytellers', 'Fabulists', 'Prophets', 'Oracles',
  'Mystics', 'Seers', 'Druids', 'Shamans', 'Enchanters',
  'Sorcerers', 'Wizards', 'Warlocks', 'Conjurers', 'Illusionists',
  'Magicians', 'Acrobats', 'Jugglers', 'Trekkers', 'Climbers',
  // Groups & orders
  'Brigades', 'Legions', 'Cohorts', 'Guilds', 'Orders',
  'Fraternities', 'Societies', 'Brotherhoods', 'Fellowships', 'Lodges',
  'Chapters', 'Councils', 'Academies', 'Communes', 'Collectives',
  // Birds & beasts
  'Eagles', 'Hawks', 'Ravens', 'Falcons', 'Condors',
  'Cranes', 'Herons', 'Owls', 'Peacocks', 'Flamingos',
  'Wolves', 'Bears', 'Lions', 'Tigers', 'Panthers',
  'Foxes', 'Stags', 'Stallions', 'Dolphins', 'Otters',
  'Badgers', 'Cobras', 'Vipers', 'Whales', 'Sharks',
  // Nature & places
  'Mountains', 'Valleys', 'Rivers', 'Canyons', 'Glaciers',
  'Pines', 'Oaks', 'Maples', 'Willows', 'Cedars',
  'Magnolias', 'Redwoods', 'Birches', 'Aspens', 'Sequoias',
  'Shadows', 'Whispers', 'Dreams', 'Visions', 'Myths',
  'Tales', 'Fables', 'Sagas', 'Chronicles', 'Epics',
  // Celestial & elemental
  'Stars', 'Comets', 'Nebulae', 'Meteors', 'Eclipses',
  'Tides', 'Currents', 'Torrents', 'Tempests', 'Zephyrs',
  'Embers', 'Cinders', 'Sparks', 'Flames', 'Beacons',
  // Gems & metals
  'Rubies', 'Sapphires', 'Emeralds', 'Opals', 'Garnets',
  'Diamonds', 'Ambers', 'Jades', 'Pearls', 'Topazes',
  // Miscellaneous evocative
  'Anthems', 'Stanzas', 'Canticles', 'Madrigals', 'Hymns',
  'Relics', 'Talismans', 'Emblems', 'Standards', 'Insignia',
  'Touchstones', 'Ramparts', 'Bastions', 'Parapets', 'Pinnacles',
]

export function randomQuartetName(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, pluralNouns],
    separator: ' ',
    style: 'capital',
  })
}
