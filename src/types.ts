export type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  causalLink: string;
  becauseSummary?: string;
  sourceName: string;
  sourceUrl: string;
};

export type StoryKind = "overview" | "lineage";

export type Story = {
  headline: string;
  dek: string;
  events: TimelineEvent[];
  narrationScript: string;
  mode?: "live" | "demo";
  kind?: StoryKind;
};
