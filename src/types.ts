export type TimelineEvent={date:string;title:string;description:string;causalLink:string;sourceName:string;sourceUrl:string};
export type Story={headline:string;dek:string;events:TimelineEvent[];narrationScript:string;mode?:"live"|"demo"};
