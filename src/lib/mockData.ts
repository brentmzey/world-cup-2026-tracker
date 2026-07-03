export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  capacity: number;
  image: string;
  lat: number;
  lng: number;
  info: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
}

export interface Match {
  id: string;
  homeTeam: Team | string;
  awayTeam: Team | string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  stadiumId: string;
  stage: 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-finals' | 'Semi-finals' | 'Third-place' | 'Final';
  status: 'Scheduled' | 'Live' | 'Finished';
}

export interface GroupStanding {
  group: string;
  teams: {
    teamId: string;
    teamName: string;
    code: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }[];
}

export const STADIUMS: Stadium[] = [
  { id: 'azteca', name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', capacity: 83264, image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&auto=format&fit=crop&q=60', lat: 19.3029, lng: -99.1505, info: 'Historic venue hosting the opening match. It is the first stadium to host three World Cups.' },
  { id: 'metlife', name: 'MetLife Stadium', city: 'New York/New Jersey', country: 'USA', capacity: 82500, image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500&auto=format&fit=crop&q=60', lat: 40.8135, lng: -74.0743, info: 'Host of the World Cup 2026 Final match, located in East Rutherford, NJ.' },
  { id: 'att', name: 'AT&T Stadium', city: 'Dallas', country: 'USA', capacity: 80000, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&auto=format&fit=crop&q=60', lat: 32.7473, lng: -97.0945, info: 'State-of-the-art retractable roof stadium hosting multiple matches including semi-finals.' },
  { id: 'mercedes', name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', capacity: 71000, image: 'https://images.unsplash.com/photo-1540747737956-3787293ac267?w=500&auto=format&fit=crop&q=60', lat: 33.7573, lng: -84.4010, info: 'Stunning architectural design with a retractable pinwheel roof.' },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', capacity: 76416, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60', lat: 39.0489, lng: -94.4839, info: 'Holder of the Guinness World Record for loudest outdoor stadium.' },
  { id: 'nrg', name: 'NRG Stadium', city: 'Houston', country: 'USA', capacity: 72220, image: 'https://images.unsplash.com/photo-1504156806659-dd08534c0e35?w=500&auto=format&fit=crop&q=60', lat: 29.6847, lng: -95.4078, info: 'Highly versatile indoor/outdoor sports venue with retractable roof.' },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', capacity: 70240, image: 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=500&auto=format&fit=crop&q=60', lat: 33.9534, lng: -118.3390, info: 'Indoor-outdoor configuration with translucent canopy and 360-degree double-sided video board.' },
  { id: 'hardrock', name: 'Hard Rock Stadium', city: 'Miami', country: 'USA', capacity: 64767, image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=500&auto=format&fit=crop&q=60', lat: 25.9580, lng: -80.2389, info: 'Beautifully shaded bowl design customized for international soccer events.' },
  { id: 'levis', name: 'Levi\'s Stadium', city: 'San Francisco Bay Area', country: 'USA', capacity: 68500, image: 'https://images.unsplash.com/photo-1540747737956-3787293ac267?w=500&auto=format&fit=crop&q=60', lat: 37.4030, lng: -121.9702, info: 'Eco-friendly stadium with a green roof, located in Santa Clara, California.' },
  { id: 'lumen', name: 'Lumen Field', city: 'Seattle', country: 'USA', capacity: 69000, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60', lat: 47.5952, lng: -122.3316, info: 'Known for its passionate fanbase and picturesque views of the Seattle skyline.' },
  { id: 'lincoln', name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', capacity: 69796, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&auto=format&fit=crop&q=60', lat: 39.9008, lng: -75.1675, info: 'Eco-conscious stadium powered by wind turbines and solar panels.' },
  { id: 'gillette', name: 'Gillette Stadium', city: 'Boston', country: 'USA', capacity: 65878, image: 'https://images.unsplash.com/photo-1540747737956-3787293ac267?w=500&auto=format&fit=crop&q=60', lat: 42.0909, lng: -71.2643, info: 'Features the signature lighthouse and bridge, located in Foxborough, MA.' },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', country: 'Canada', capacity: 45000, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60', lat: 43.6332, lng: -79.4186, info: 'Canada national team stadium, expanded for World Cup 2026.' },
  { id: 'bcplace', name: 'BC Place', city: 'Vancouver', country: 'Canada', capacity: 54500, image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&auto=format&fit=crop&q=60', lat: 49.2767, lng: -123.1120, info: 'Stunning retractable roof stadium nestled in downtown Vancouver.' },
  { id: 'bbva', name: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', capacity: 53500, image: 'https://images.unsplash.com/photo-1577223625856-758c127e1279?w=500&auto=format&fit=crop&q=60', lat: 25.6689, lng: -100.2446, info: 'Nicknamed "El Gigante de Acero" (The Steel Giant), with direct views of Cerro de la Silla.' },
  { id: 'akron', name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', capacity: 48070, image: 'https://images.unsplash.com/photo-1504156806659-dd08534c0e35?w=500&auto=format&fit=crop&q=60', lat: 20.6821, lng: -103.4627, info: 'Volcano-like design exterior, home of C.D. Guadalajara.' }
];

export const TEAMS: Team[] = [
  // Group A
  { id: 'mex', name: 'Mexico', code: 'MEX', flag: '🇲🇽', group: 'Group A' },
  { id: 'usa', name: 'United States', code: 'USA', flag: '🇺🇸', group: 'Group A' },
  { id: 'can', name: 'Canada', code: 'CAN', flag: '🇨🇦', group: 'Group A' },
  { id: 'ecu', name: 'Ecuador', code: 'ECU', flag: '🇪🇨', group: 'Group A' },
  
  // Group B
  { id: 'arg', name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'Group B' },
  { id: 'fra', name: 'France', code: 'FRA', flag: '🇫🇷', group: 'Group B' },
  { id: 'mar', name: 'Morocco', code: 'MAR', flag: '🇲🇦', group: 'Group B' },
  { id: 'jpn', name: 'Japan', code: 'JPN', flag: '🇯🇵', group: 'Group B' },
  
  // Group C
  { id: 'bra', name: 'Brazil', code: 'BRA', flag: '🇧🇷', group: 'Group C' },
  { id: 'eng', name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'Group C' },
  { id: 'sen', name: 'Senegal', code: 'SEN', flag: '🇸🇳', group: 'Group C' },
  { id: 'aus', name: 'Australia', code: 'AUS', flag: '🇦🇺', group: 'Group C' }
];

export const MATCHES: Match[] = [
  { id: 'm1', homeTeam: TEAMS[0], awayTeam: TEAMS[3], homeScore: 2, awayScore: 1, date: '2026-06-11', time: '18:00', stadiumId: 'azteca', stage: 'Group Stage', status: 'Finished' },
  { id: 'm2', homeTeam: TEAMS[1], awayTeam: TEAMS[2], homeScore: 3, awayScore: 2, date: '2026-06-12', time: '20:00', stadiumId: 'sofi', stage: 'Group Stage', status: 'Live' },
  { id: 'm3', homeTeam: TEAMS[4], awayTeam: TEAMS[7], date: '2026-06-13', time: '15:00', stadiumId: 'metlife', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm4', homeTeam: TEAMS[5], awayTeam: TEAMS[6], date: '2026-06-13', time: '19:00', stadiumId: 'mercedes', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm5', homeTeam: TEAMS[8], awayTeam: TEAMS[11], date: '2026-06-14', time: '14:00', stadiumId: 'att', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm6', homeTeam: TEAMS[9], awayTeam: TEAMS[10], date: '2026-06-14', time: '17:00', stadiumId: 'bmo', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm7', homeTeam: TEAMS[2], awayTeam: TEAMS[3], date: '2026-06-15', time: '16:00', stadiumId: 'bcplace', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm8', homeTeam: TEAMS[0], awayTeam: TEAMS[1], date: '2026-06-16', time: '20:00', stadiumId: 'bbva', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm9', homeTeam: TEAMS[4], awayTeam: TEAMS[5], date: '2026-06-17', time: '18:00', stadiumId: 'akron', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm10', homeTeam: TEAMS[6], awayTeam: TEAMS[7], date: '2026-06-18', time: '19:00', stadiumId: 'arrowhead', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm11', homeTeam: TEAMS[8], awayTeam: TEAMS[9], date: '2026-06-19', time: '15:00', stadiumId: 'nrg', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm12', homeTeam: TEAMS[10], awayTeam: TEAMS[11], date: '2026-06-20', time: '17:00', stadiumId: 'hardrock', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm13', homeTeam: TEAMS[1], awayTeam: TEAMS[3], date: '2026-06-21', time: '13:00', stadiumId: 'levis', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm14', homeTeam: TEAMS[0], awayTeam: TEAMS[2], date: '2026-06-21', time: '18:00', stadiumId: 'lumen', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm15', homeTeam: TEAMS[4], awayTeam: TEAMS[6], date: '2026-06-22', time: '16:00', stadiumId: 'lincoln', stage: 'Group Stage', status: 'Scheduled' },
  { id: 'm16', homeTeam: TEAMS[5], awayTeam: TEAMS[7], date: '2026-06-22', time: '20:00', stadiumId: 'gillette', stage: 'Group Stage', status: 'Scheduled' }
];

export const GROUP_STANDINGS: GroupStanding[] = [
  {
    group: 'Group A',
    teams: [
      { teamId: 'usa', teamName: 'United States', code: 'USA', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 2, points: 3 },
      { teamId: 'mex', teamName: 'Mexico', code: 'MEX', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 1, points: 3 },
      { teamId: 'can', teamName: 'Canada', code: 'CAN', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, points: 0 },
      { teamId: 'ecu', teamName: 'Ecuador', code: 'ECU', played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 2, points: 0 }
    ]
  },
  {
    group: 'Group B',
    teams: [
      { teamId: 'arg', teamName: 'Argentina', code: 'ARG', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'fra', teamName: 'France', code: 'FRA', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'mar', teamName: 'Morocco', code: 'MAR', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'jpn', teamName: 'Japan', code: 'JPN', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    ]
  },
  {
    group: 'Group C',
    teams: [
      { teamId: 'bra', teamName: 'Brazil', code: 'BRA', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'eng', teamName: 'England', code: 'ENG', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'sen', teamName: 'Senegal', code: 'SEN', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: 'aus', teamName: 'Australia', code: 'AUS', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    ]
  }
];
