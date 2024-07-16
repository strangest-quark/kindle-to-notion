export interface Clipping {
  title: string;
  author: string;
  kind: "highlight" | "note" | "bookmark";
  content: string;
}

export interface GroupedClipping {
  title: string;
  author: string;
  kinds: string[];
  contents: string[];
}

export interface Sync {
  title: string;
  author: string;
  contentCount: number;
}
