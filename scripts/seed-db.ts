import PocketBase from 'pocketbase';
import { MOCK_DB_TENANTS } from '../src/lib/config';
import { STADIUMS } from '../src/lib/mockData';

// Configuration
const PB_URL = process.env.PB_URL || 'https://world-cup-classic.pockethost.io/';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;
const OPENFOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\x1b[31mError: PocketBase Admin credentials are required.\x1b[0m');
  console.log('\nPlease run the script with environment variables:');
  console.log('  \x1b[36mPB_ADMIN_EMAIL=your-email@example.com PB_ADMIN_PASSWORD=your-password bun run scripts/seed-db.ts\x1b[0m\n');
  process.exit(1);
}

// Utility to throttle API calls and avoid PocketHost 429 rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Resilient API execution with Exponential Backoff for 429 Rate Limiting
async function executeWithRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err && (err.status === 429 || (err.message && err.message.includes('429'))) && retries > 0) {
      console.warn(`\n[Rate Limit 429] PocketHost is throttling requests. Backing off for ${delayMs}ms before retrying... (${retries} retries left)`);
      await delay(delayMs);
      return executeWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

// Country flag lookup helper
function getFlagForTeam(teamName: string): string {
  const flags: Record<string, string> = {
    'Mexico': '🇲🇽', 'United States': '🇺🇸', 'Canada': '🇨🇦', 'Ecuador': '🇪🇨',
    'Argentina': '🇦🇷', 'France': '🇫🇷', 'Morocco': '🇲🇦', 'Japan': '🇯🇵', 'Brazil': '🇧🇷',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Senegal': '🇸🇳', 'Australia': '🇦🇺', 'South Africa': '🇿🇦',
    'South Korea': '🇰🇷', 'Czech Republic': '🇨🇿', 'Bosnia & Herzegovina': '🇧🇦',
    'Qatar': '🇶🇦', 'Switzerland': '🇨🇭', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Peru': '🇵🇪', 'Chile': '🇨🇱', 'Netherlands': '🇳🇱',
    'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Belgium': '🇧🇪',
    'Croatia': '🇭🇷', 'Denmark': '🇩🇰', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Poland': '🇵🇱',
    'Ukraine': '🇺🇦', 'Austria': '🇦🇹', 'Turkey': '🇹🇷', 'Egypt': '🇪🇬', 'Nigeria': '🇳🇬',
    'Cameroon': '🇨🇲', 'Ghana': '🇬🇭', 'Algeria': '🇩🇿', 'Tunisia': '🇹🇳', 'Iran': '🇮🇷',
    'Saudi Arabia': '🇸🇦', 'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
    'New Zealand': '🇳🇿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮',
    'Cape Verde': '🇨🇻', 'Iraq': '🇮🇶', 'Uzbekistan': '🇺🇿', 'DR Congo': '🇨🇩',
    'Jordan': '🇯🇴', 'Turkey/Türkiye': '🇹🇷', 'Paraguay': '🇵🇾', 'South Africa/ZAF': '🇿🇦',
    'South Korea/KOR': '🇰🇷', 'Czech Republic/CZE': '🇨🇿', 'Bosnia/BIH': '🇧🇦'
  };
  return flags[teamName] || '🏳️';
}

// Team ISO code lookup helper
function getCodeForTeam(teamName: string): string {
  const codes: Record<string, string> = {
    'Mexico': 'MEX', 'United States': 'USA', 'USA': 'USA', 'Canada': 'CAN', 'Ecuador': 'ECU',
    'Argentina': 'ARG', 'France': 'FRA', 'Morocco': 'MAR', 'Japan': 'JPN', 'Brazil': 'BRA',
    'England': 'ENG', 'Senegal': 'SEN', 'Australia': 'AUS', 'South Africa': 'RSA',
    'South Korea': 'KOR', 'Czech Republic': 'CZE', 'Bosnia & Herzegovina': 'BIH',
    'Qatar': 'QAT', 'Switzerland': 'SUI', 'Haiti': 'HAI', 'Scotland': 'SCO',
    'Uruguay': 'URU', 'Colombia': 'COL', 'Peru': 'PER', 'Chile': 'CHI', 'Netherlands': 'NED',
    'Germany': 'GER', 'Italy': 'ITA', 'Spain': 'ESP', 'Portugal': 'POR', 'Belgium': 'BEL',
    'Croatia': 'CRO', 'Denmark': 'DEN', 'Sweden': 'SWE', 'Norway': 'NOR', 'Poland': 'POL',
    'Ukraine': 'UKR', 'Austria': 'AUT', 'Turkey': 'TUR', 'Egypt': 'EGY', 'Nigeria': 'NGA',
    'Cameroon': 'CMR', 'Ghana': 'GHA', 'Algeria': 'ALG', 'Tunisia': 'TUN', 'Iran': 'IRN',
    'Saudi Arabia': 'KSA', 'Costa Rica': 'CRC', 'Panama': 'PAN', 'Jamaica': 'JAM',
    'New Zealand': 'NZL', 'Wales': 'WAL', 'Curaçao': 'CUW', 'Ivory Coast': 'CIV',
    'Cape Verde': 'CPV', 'Iraq': 'IRQ', 'Uzbekistan': 'UZB', 'DR Congo': 'COD',
    'Jordan': 'JOR', 'Paraguay': 'PAR'
  };
  return codes[teamName] || teamName.substring(0, 3).toUpperCase();
}

// Stadium ID mapping based on ground string
function getStadiumIdForGround(ground: string): string {
  const normalized = ground.toLowerCase();
  if (normalized.includes('mexico city') || normalized.includes('azteca')) return 'azteca';
  if (normalized.includes('new york') || normalized.includes('east rutherford') || normalized.includes('metlife')) return 'metlife';
  if (normalized.includes('dallas') || normalized.includes('arlington') || normalized.includes('att') || normalized.includes('at&t')) return 'att';
  if (normalized.includes('atlanta') || normalized.includes('mercedes')) return 'mercedes';
  if (normalized.includes('kansas') || normalized.includes('arrowhead')) return 'arrowhead';
  if (normalized.includes('houston') || normalized.includes('nrg')) return 'nrg';
  if (normalized.includes('los angeles') || normalized.includes('inglewood') || normalized.includes('sofi')) return 'sofi';
  if (normalized.includes('miami') || normalized.includes('hard rock')) return 'hardrock';
  if (normalized.includes('san francisco') || normalized.includes('santa clara') || normalized.includes('levi')) return 'levis';
  if (normalized.includes('seattle') || normalized.includes('lumen')) return 'lumen';
  if (normalized.includes('philadelphia') || normalized.includes('lincoln')) return 'lincoln';
  if (normalized.includes('boston') || normalized.includes('foxborough') || normalized.includes('gillette')) return 'gillette';
  if (normalized.includes('toronto') || normalized.includes('bmo')) return 'bmo';
  if (normalized.includes('vancouver') || normalized.includes('bc place')) return 'bcplace';
  if (normalized.includes('monterrey') || normalized.includes('guadalupe') || normalized.includes('bbva')) return 'bbva';
  if (normalized.includes('guadalajara') || normalized.includes('zapopan') || normalized.includes('akron')) return 'akron';
  return ground;
}

async function run() {
  console.log(`Connecting to PocketBase at: ${PB_URL}`);
  const pb = new PocketBase(PB_URL);

  try {
    // 0. Authenticate
    console.log('Authenticating admin...');
    await executeWithRetry(() => pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD));
    console.log('Successfully authenticated.');

    // 1. Fetch live open-source data
    console.log(`\nFetching live tournament fixtures from: ${OPENFOOTBALL_URL}`);
    const response = await fetch(OPENFOOTBALL_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch fixtures: ${response.statusText}`);
    }
    const apiData = await response.json();
    console.log(`Fetched ${apiData.matches?.length || 0} fixtures successfully.`);

    // 2. Setup Database Collections Schema
    console.log('\nCreating/verifying PocketBase collections schema...');
    
    // First setup schemas that do not have relations
    const independentCollections = [
      {
        name: 'tenants',
        type: 'base',
        fields: [
          { name: 'tenantId', type: 'text', required: true, unique: true },
          { name: 'appName', type: 'text', required: true },
          { name: 'theme', type: 'json' },
          { name: 'features', type: 'json' },
          { name: 'eventInfo', type: 'json' }
        ],
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null
      },
      {
        name: 'teams',
        type: 'base',
        fields: [
          { name: 'teamId', type: 'text', required: true, unique: true },
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text', required: true },
          { name: 'flag', type: 'text' },
          { name: 'group', type: 'text' }
        ],
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null
      },
      {
        name: 'stadiums',
        type: 'base',
        fields: [
          { name: 'stadiumId', type: 'text', required: true, unique: true },
          { name: 'name', type: 'text', required: true },
          { name: 'city', type: 'text' },
          { name: 'country', type: 'text' },
          { name: 'capacity', type: 'number' },
          { name: 'image', type: 'text' },
          { name: 'lat', type: 'number' },
          { name: 'lng', type: 'number' },
          { name: 'info', type: 'text' }
        ],
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null
      }
    ];

    for (const colDef of independentCollections) {
      try {
        const existing = await executeWithRetry(() => pb.collections.getOne(colDef.name));
        console.log(`Collection "${colDef.name}" exists. Syncing schema...`);
        const updatedCol = { ...existing, fields: colDef.fields, listRule: colDef.listRule, viewRule: colDef.viewRule };
        await executeWithRetry(() => pb.collections.update(existing.id, updatedCol));
        await delay(500);
      } catch (err) {
        console.log(`Creating new collection "${colDef.name}"...`);
        await executeWithRetry(() => pb.collections.create(colDef));
        await delay(500);
      }
    }

    // Resolve teams collection ID dynamically
    console.log('Resolving collection ID for "teams"...');
    const teamsCollection = await executeWithRetry(() => pb.collections.getOne('teams'));
    const teamsCollectionId = teamsCollection.id;
    console.log(`Resolved "teams" collection ID: ${teamsCollectionId}`);

    // Define dependent collections using the resolved ID
    const dependentCollections = [
      {
        name: 'matches',
        type: 'base',
        fields: [
          { name: 'matchId', type: 'text', required: true, unique: true },
          { name: 'homeTeam', type: 'relation', required: true, collectionId: teamsCollectionId, maxSelect: 1, cascadeDelete: false },
          { name: 'awayTeam', type: 'relation', required: true, collectionId: teamsCollectionId, maxSelect: 1, cascadeDelete: false },
          { name: 'homeScore', type: 'number' },
          { name: 'awayScore', type: 'number' },
          { name: 'date', type: 'text', required: true },
          { name: 'time', type: 'text', required: true },
          { name: 'stadiumId', type: 'text' },
          { name: 'stage', type: 'text' },
          { name: 'status', type: 'text' }
        ],
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null
      },
      {
        name: 'group_standings',
        type: 'base',
        fields: [
          { name: 'group', type: 'text', required: true, unique: true },
          { name: 'teams', type: 'json' }
        ],
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null
      }
    ];

    for (const colDef of dependentCollections) {
      try {
        const existing = await executeWithRetry(() => pb.collections.getOne(colDef.name));
        console.log(`Collection "${colDef.name}" exists. Syncing schema...`);
        const updatedCol = { ...existing, fields: colDef.fields, listRule: colDef.listRule, viewRule: colDef.viewRule };
        await executeWithRetry(() => pb.collections.update(existing.id, updatedCol));
        await delay(500);
      } catch (err: any) {
        console.error(`Failed to update schema for collection "${colDef.name}":`, JSON.stringify(err.response, null, 2) || err);
        console.log(`Creating new collection "${colDef.name}"...`);
        await executeWithRetry(() => pb.collections.create(colDef));
        await delay(500);
      }
    }

    // 2.5. Scrub database of invalid/empty records (from legacy schema issues)
    console.log('\nScrubbing database of invalid/empty records...');
    const collectionsToScrub = [
      { name: 'tenants', key: 'tenantId' },
      { name: 'stadiums', key: 'stadiumId' },
      { name: 'teams', key: 'teamId' },
      { name: 'matches', key: 'matchId' },
      { name: 'group_standings', key: 'group' }
    ];

    for (const target of collectionsToScrub) {
      const records = await executeWithRetry(() => pb.collection(target.name).getFullList());
      const invalid = records.filter(r => !r[target.key]);
      if (invalid.length > 0) {
        console.log(`Found ${invalid.length} invalid/empty records in "${target.name}". Deleting...`);
        for (const record of invalid) {
          await executeWithRetry(() => pb.collection(target.name).delete(record.id));
          await delay(150);
        }
      }
    }

    // 3. Seed Multi-Tenant Configs
    console.log('\nFetching existing tenants...');
    const existingTenants = await executeWithRetry(() => pb.collection('tenants').getFullList());
    const existingTenantsMap = new Map(existingTenants.map(t => [t.tenantId, t]));

    console.log('Syncing tenants configurations...');
    for (const [id, t] of Object.entries(MOCK_DB_TENANTS)) {
      try {
        const existing = existingTenantsMap.get(id);
        const data = {
          tenantId: id,
          appName: t.appName,
          theme: t.theme,
          features: t.features,
          eventInfo: t.eventInfo
        };

        if (existing) {
          const changed = existing.appName !== data.appName ||
                          JSON.stringify(existing.theme) !== JSON.stringify(data.theme) ||
                          JSON.stringify(existing.features) !== JSON.stringify(data.features) ||
                          JSON.stringify(existing.eventInfo) !== JSON.stringify(data.eventInfo);
          if (changed) {
            await executeWithRetry(() => pb.collection('tenants').update(existing.id, data));
            console.log(`Updated tenant: ${id}`);
            await delay(500);
          }
        } else {
          await executeWithRetry(() => pb.collection('tenants').create(data));
          console.log(`Created tenant: ${id}`);
          await delay(500);
        }
      } catch (err) {
        console.error(`Failed to sync tenant ${id}:`, err);
      }
    }

    // 4. Seed Stadiums
    console.log('\nFetching existing stadiums...');
    const existingStadiums = await executeWithRetry(() => pb.collection('stadiums').getFullList());
    const existingStadiumsMap = new Map(existingStadiums.map(s => [s.stadiumId, s]));

    console.log('Syncing host stadiums geo-coordinates & details...');
    for (const stadium of STADIUMS) {
      try {
        const existing = existingStadiumsMap.get(stadium.id);
        const data = {
          stadiumId: stadium.id,
          name: stadium.name,
          city: stadium.city,
          country: stadium.country,
          capacity: stadium.capacity,
          image: stadium.image,
          lat: stadium.lat,
          lng: stadium.lng,
          info: stadium.info
        };

        if (existing) {
          const changed = existing.name !== data.name ||
                          existing.city !== data.city ||
                          existing.capacity !== data.capacity ||
                          existing.lat !== data.lat ||
                          existing.lng !== data.lng;
          if (changed) {
            await executeWithRetry(() => pb.collection('stadiums').update(existing.id, data));
            console.log(`Updated stadium: ${stadium.name}`);
            await delay(500);
          }
        } else {
          await executeWithRetry(() => pb.collection('stadiums').create(data));
          console.log(`Created stadium: ${stadium.name}`);
          await delay(500);
        }
      } catch (err) {
        console.error(`Failed to sync stadium ${stadium.name}:`, err);
      }
    }

    // 5. Parse and Sync Teams from Live API
    console.log('\nExtracting teams and groups from live API...');
    const apiMatches = apiData.matches || [];
    const parsedTeamsMap = new Map<string, { name: string; group: string }>();

    for (const match of apiMatches) {
      if (match.team1 && match.group) {
        parsedTeamsMap.set(match.team1, { name: match.team1, group: match.group });
      }
      if (match.team2 && match.group) {
        parsedTeamsMap.set(match.team2, { name: match.team2, group: match.group });
      }
    }

    console.log('Fetching existing teams...');
    const existingTeams = await executeWithRetry(() => pb.collection('teams').getFullList());
    const existingTeamsMap = new Map(existingTeams.map(t => [t.teamId, t]));
    const pbTeamRecords: Record<string, string> = {};

    // Map existing ones first
    for (const t of existingTeams) {
      pbTeamRecords[t.name] = t.id;
    }

    console.log(`Syncing ${parsedTeamsMap.size} teams...`);
    for (const [name, info] of parsedTeamsMap.entries()) {
      try {
        const teamId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const existing = existingTeamsMap.get(teamId);
        const data = {
          teamId,
          name,
          code: getCodeForTeam(name),
          flag: getFlagForTeam(name),
          group: info.group
        };

        let record;
        if (existing) {
          const changed = existing.name !== data.name ||
                          existing.code !== data.code ||
                          existing.flag !== data.flag ||
                          existing.group !== data.group;
          if (changed) {
            record = await executeWithRetry(() => pb.collection('teams').update(existing.id, data));
            console.log(`Updated team: ${name} (${data.code})`);
            await delay(500);
          } else {
            record = existing;
          }
        } else {
          record = await executeWithRetry(() => pb.collection('teams').create(data));
          console.log(`Created team: ${name} (${data.code})`);
          await delay(500);
        }
        pbTeamRecords[name] = record.id;
      } catch (err) {
        console.error(`Failed to sync team ${name}:`, err);
      }
    }

    // 6. Sync Matches from Live API
    console.log('\nFetching existing matches...');
    const existingMatches = await executeWithRetry(() => pb.collection('matches').getFullList());
    const existingMatchesMap = new Map(existingMatches.map(m => [m.matchId, m]));

    console.log('Syncing fixtures and live scores...');
    const standingsCalculatorMap = new Map<string, Map<string, {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
    }>>();

    let matchIndex = 1;
    for (const match of apiMatches) {
      try {
        const matchId = `m${matchIndex++}`;
        const homePbId = pbTeamRecords[match.team1];
        const awayPbId = pbTeamRecords[match.team2];

        if (!homePbId || !awayPbId) {
          console.warn(`Skipping match ${matchId} (teams: ${match.team1} vs ${match.team2}) due to missing team references.`);
          continue;
        }

        const homeScore = match.score?.ft?.[0];
        const awayScore = match.score?.ft?.[1];
        const isFinished = homeScore !== undefined && awayScore !== undefined;
        const status = isFinished ? 'Finished' : 'Scheduled';

        const data = {
          matchId,
          homeTeam: homePbId,
          awayTeam: awayPbId,
          homeScore,
          awayScore,
          date: match.date,
          time: match.time || '18:00',
          stadiumId: getStadiumIdForGround(match.ground || 'metlife'),
          stage: match.round || 'Group Stage',
          status
        };

        const existing = existingMatchesMap.get(matchId);
        if (existing) {
          const changed = existing.homeTeam !== data.homeTeam ||
                          existing.awayTeam !== data.awayTeam ||
                          existing.homeScore !== data.homeScore ||
                          existing.awayScore !== data.awayScore ||
                          existing.date !== data.date ||
                          existing.time !== data.time ||
                          existing.stadiumId !== data.stadiumId ||
                          existing.stage !== data.stage ||
                          existing.status !== data.status;
          if (changed) {
            await executeWithRetry(() => pb.collection('matches').update(existing.id, data));
            console.log(`Updated match: ${matchId} (${match.team1} vs ${match.team2})`);
            await delay(500);
          }
        } else {
          await executeWithRetry(() => pb.collection('matches').create(data));
          console.log(`Created match: ${matchId} (${match.team1} vs ${match.team2})`);
          await delay(500);
        }

        // Calculate standings parameters dynamically
        if (isFinished && match.group) {
          const groupName = match.group;
          if (!standingsCalculatorMap.has(groupName)) {
            standingsCalculatorMap.set(groupName, new Map());
          }
          const groupCalc = standingsCalculatorMap.get(groupName)!;

          if (!groupCalc.has(match.team1)) {
            groupCalc.set(match.team1, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
          }
          if (!groupCalc.has(match.team2)) {
            groupCalc.set(match.team2, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
          }

          const hStats = groupCalc.get(match.team1)!;
          const aStats = groupCalc.get(match.team2)!;

          hStats.played += 1;
          hStats.goalsFor += homeScore;
          hStats.goalsAgainst += awayScore;

          aStats.played += 1;
          aStats.goalsFor += awayScore;
          aStats.goalsAgainst += homeScore;

          if (homeScore > awayScore) {
            hStats.won += 1;
            aStats.lost += 1;
          } else if (homeScore < awayScore) {
            aStats.won += 1;
            hStats.lost += 1;
          } else {
            hStats.drawn += 1;
            aStats.drawn += 1;
          }
        }
      } catch (err) {
        console.error(`Failed to sync match index ${matchIndex - 1}:`, err);
      }
    }
    console.log(`Synced ${matchIndex - 1} matches.`);

    // 7. Calculate and Sync Dynamic Group Standings
    console.log('\nFetching existing standings...');
    const existingGroupStandings = await executeWithRetry(() => pb.collection('group_standings').getFullList());
    const existingGroupStandingsMap = new Map(existingGroupStandings.map(gs => [gs.group, gs]));

    console.log('Calculating group standings dynamically from match scores...');
    for (const [groupName, teamStatsMap] of standingsCalculatorMap.entries()) {
      try {
        const teamStandings: any[] = [];
        for (const [teamName, stats] of teamStatsMap.entries()) {
          const teamId = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const points = stats.won * 3 + stats.drawn * 1;
          teamStandings.push({
            teamId: pbTeamRecords[teamName] || teamId,
            teamName,
            code: getCodeForTeam(teamName),
            played: stats.played,
            won: stats.won,
            drawn: stats.drawn,
            lost: stats.lost,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            points
          });
        }

        // Sort: points -> GD -> GF
        teamStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = a.goalsFor - a.goalsAgainst;
          const gdB = b.goalsFor - b.goalsAgainst;
          if (gdB !== gdA) return gdB - gdA;
          return b.goalsFor - a.goalsFor;
        });

        const data = {
          group: groupName,
          teams: teamStandings
        };

        const existing = existingGroupStandingsMap.get(groupName);
        if (existing) {
          const changed = JSON.stringify(existing.teams) !== JSON.stringify(teamStandings);
          if (changed) {
            await executeWithRetry(() => pb.collection('group_standings').update(existing.id, data));
            console.log(`Updated standings for group: ${groupName}`);
            await delay(500);
          }
        } else {
          await executeWithRetry(() => pb.collection('group_standings').create(data));
          console.log(`Created standings for group: ${groupName}`);
          await delay(500);
        }
      } catch (err) {
        console.error(`Failed to sync standings for group ${groupName}:`, err);
      }
    }

    console.log('\n\x1b[32m✔ Schema initialization and live data ingestion complete!\x1b[0m\n');
  } catch (err) {
    console.error('\n\x1b[31m✘ Critical schema/seeding error:\x1b[0m', err);
    process.exit(1);
  }
}

run();
