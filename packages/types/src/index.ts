export interface Episode {
  id: number;
  name: string;
  airDate: string;
  code: string;
  characterCount: number;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  origin: string;
  location: string;
}

export interface EpisodeDetail extends Episode {
  characters: Character[];
}

export interface Paginated<T> {
  info: {
    count: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  results: T[];
}
