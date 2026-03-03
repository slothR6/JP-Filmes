export type Movie = {
  title: string;
  slug: string;
  year: number;
  genre: string;
  description: string;
  posterUrl: string;
  streamUrl: string;
  sourceAttribution: string;
};

export type ChatMessage = {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
};
