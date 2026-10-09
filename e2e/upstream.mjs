// A stand-in for rickandmortyapi.com with the same shapes and status codes, so the suite is
// deterministic and never spends the public api's quota. The api is pointed at it through
// RICK_AND_MORTY_API_URL.
import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 3102);
const base = `http://localhost:${port}/api`;
const PAGE_SIZE = 20;

// 1x1 PNG served for every avatar.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const seasons = [
  {
    premiere: '2013-12-02',
    names: [
      'Pilot',
      'Lawnmower Dog',
      'Anatomy Park',
      'M. Night Shaym-Aliens!',
      'Meeseeks and Destroy',
      'Rick Potion #9',
      'Raising Gazorpazorp',
      'Rixty Minutes',
      'Something Ricked This Way Comes',
      'Close Rick-counters of the Rick Kind',
      'Ricksy Business',
    ],
  },
  {
    premiere: '2015-07-26',
    names: [
      'A Rickle in Time',
      'Mortynight Run',
      'Auto Erotic Assimilation',
      'Total Rickall',
      'Get Schwifty',
      'The Ricks Must Be Crazy',
      'Big Trouble in Little Sanchez',
      'Interdimensional Cable 2: Tempting Fate',
      "Look Who's Purging Now",
      'The Wedding Squanchers',
    ],
  },
  {
    premiere: '2017-04-01',
    names: [
      'The Rickshank Rickdemption',
      'Rickmancing the Stone',
      'Pickle Rick',
      'Vindicators 3: The Return of Worldender',
      'The Whirly Dirly Conspiracy',
      'Rest and Ricklaxation',
      'The Ricklantis Mixup',
      "Morty's Mind Blowers",
      "The ABC's of Beth",
      'The Rickchurian Mortydate',
    ],
  },
];

const characterNames = [
  'Rick Sanchez',
  'Morty Smith',
  'Summer Smith',
  'Beth Smith',
  'Jerry Smith',
  'Abadango Cluster Princess',
  'Abradolf Lincler',
  'Adjudicator Rick',
  'Agency Director',
  'Alan Rails',
  'Albert Einstein',
  'Alexander',
  'Alien Googah',
  'Alien Morty',
  'Alien Rick',
  'Amish Cyborg',
  'Annie',
  'Antenna Morty',
  'Antenna Rick',
];

const airDate = (premiere, index) => {
  const date = new Date(premiere);
  date.setUTCDate(date.getUTCDate() + index * 7);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const characters = characterNames.map((name, index) => {
  const id = index + 1;
  return {
    id,
    name,
    status: ['Alive', 'Dead', 'unknown'][index % 3],
    species: index % 4 === 0 ? 'Alien' : 'Human',
    type: '',
    gender: index % 2 ? 'Female' : 'Male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: `${base}/character/avatar/${id}.jpeg`,
    episode: [],
    url: `${base}/character/${id}`,
    created: '2017-11-04T18:48:46.250Z',
  };
});

const episodes = seasons.flatMap((season, seasonIndex) =>
  season.names.map((name, index) => {
    const id =
      seasons.slice(0, seasonIndex).reduce((sum, s) => sum + s.names.length, 0) + index + 1;
    // The pilot has everyone; the others take a rotating handful that always includes Rick and Morty.
    const cast =
      id === 1
        ? characters
        : [characters[0], characters[1], ...characters.slice(2 + (id % 14), 5 + (id % 14))];
    return {
      id,
      name,
      air_date: airDate(season.premiere, index),
      episode: `S${String(seasonIndex + 1).padStart(2, '0')}E${String(index + 1).padStart(2, '0')}`,
      characters: cast.map((character) => character.url),
      url: `${base}/episode/${id}`,
      created: '2017-11-10T12:56:33.798Z',
    };
  }),
);

const send = (response, status, body, type = 'application/json') => {
  response.writeHead(status, { 'content-type': type });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
};

const nothingHere = (response) => send(response, 404, { error: 'There is nothing here' });

function listEpisodes(url, response) {
  const page = Number(url.searchParams.get('page') ?? 1);
  const name = (url.searchParams.get('name') ?? '').toLowerCase();
  const matches = episodes.filter((episode) => episode.name.toLowerCase().includes(name));
  const pages = Math.ceil(matches.length / PAGE_SIZE);
  const results = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (results.length === 0) return nothingHere(response);

  const link = (target) =>
    target >= 1 && target <= pages
      ? `${base}/episode?page=${target}${name ? `&name=${encodeURIComponent(name)}` : ''}`
      : null;

  send(response, 200, {
    info: { count: matches.length, pages, next: link(page + 1), prev: link(page - 1) },
    results,
  });
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', base);
  const path = url.pathname;

  if (path === '/api/episode') return listEpisodes(url, response);

  const episodeMatch = path.match(/^\/api\/episode\/(\d+)$/);
  if (episodeMatch) {
    const episode = episodes.find((candidate) => candidate.id === Number(episodeMatch[1]));
    return episode ? send(response, 200, episode) : nothingHere(response);
  }

  if (/^\/api\/character\/avatar\/\d+\.jpeg$/.test(path)) {
    return send(response, 200, PIXEL, 'image/png');
  }

  const charactersMatch = path.match(/^\/api\/character\/([\d,]+)$/);
  if (charactersMatch) {
    const ids = charactersMatch[1].split(',').map(Number);
    const found = characters.filter((character) => ids.includes(character.id));
    return send(response, 200, ids.length === 1 ? found[0] : found);
  }

  return nothingHere(response);
}).listen(port, () => {
  console.log(`upstream stub listening on ${base}`);
});
