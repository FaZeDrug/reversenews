import type { Story } from "./types";

export const demoStory: Story = {
  headline: "OpenAI launches ChatGPT",
  dek: "The overnight sensation was decades in the making.",
  mode: "demo",
  kind: "lineage",
  events: [
    {
      date: "NOV 30, 2022",
      title: "ChatGPT enters the world",
      description: "OpenAI releases a conversational research preview that reaches one million users in five days.",
      causalLink: "A usable interface turned research into a product anyone could try.",
      becauseSummary: "ChatGPT did not appear as a sudden invention. Years of language-model work were sitting behind a research interface most people would never open. Putting that capability in a simple chat box helped set the stage for a consumer product: anyone could type a question and feel the model answer. The overnight growth was a distribution change as much as a technical one.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/chatgpt/",
    },
    {
      date: "MAR 2022",
      title: "Instruction-following becomes the breakthrough",
      description: "InstructGPT shows that human feedback can make large language models more helpful and aligned with user intent.",
      causalLink: "Human feedback helped make a public chatbot possible.",
      becauseSummary: "A powerful model that ignores what you asked is not a product. InstructGPT showed that human feedback could teach a large model to follow instructions more reliably, which helped set the stage for putting GPT-class systems in front of the public. Without that behavioral shift, a chat interface would have felt clever in demos and unusable at scale.",
      sourceName: "OpenAI Research",
      sourceUrl: "https://openai.com/index/instruction-following/",
    },
    {
      date: "JUN 2020",
      title: "GPT-3 demonstrates scale",
      description: "A 175-billion-parameter model displays powerful few-shot language abilities across many tasks.",
      causalLink: "Scale suggested one general model could power an assistant.",
      becauseSummary: "GPT-3 made it plausible that a single large model could handle many kinds of language work without being retrained for each task. That breadth helped set the stage for a conversational assistant: if one model could write, explain, and answer, a chat product became a reasonable bet instead of a science-fair trick. Later ChatGPT versions are still living in the shadow of that scale result.",
      sourceName: "arXiv",
      sourceUrl: "https://arxiv.org/abs/2005.14165",
    },
    {
      date: "JUN 2017",
      title: "The transformer changes the path of AI",
      description: "Researchers introduce an attention-based architecture that processes language efficiently at unprecedented scale.",
      causalLink: "The transformer made the later GPT family technically possible.",
      becauseSummary: "Before the transformer, scaling language models this far was a much harder engineering problem. Attention let models process sequences more efficiently, which helped set the stage for GPT-2, GPT-3, and the later ChatGPT family. The 2017 paper is not a news headline in the usual sense, but it is the technical floor under every later event in this chain.",
      sourceName: "Google Research",
      sourceUrl: "https://research.google/pubs/attention-is-all-you-need/",
    },
  ],
  narrationScript:
    "On November thirtieth, 2022, ChatGPT entered the world. But the overnight sensation was years in the making. Months earlier, InstructGPT showed that human feedback could teach a model to follow our intent. Two years before that, GPT-3 demonstrated the startling power of scale. And beneath it all was a 2017 research paper with a deceptively simple title: Attention Is All You Need. Today’s headline began there.",
};

export const chatgptOverview: Story = {
  headline: "ChatGPT",
  dek: "The latest event first. Open it to see how we got here.",
  mode: "demo",
  kind: "overview",
  events: [
    {
      date: "MAY 13, 2024",
      title: "GPT-4o becomes the ChatGPT default",
      description: "OpenAI ships a faster omnimodal model and makes it the main ChatGPT experience, including a free tier.",
      causalLink: "This is the most recent major ChatGPT model event in this demo.",
      becauseSummary: "GPT-4o is the latest consumer ChatGPT headline in this prepared story. Open it to walk backward through GPT-4, the original ChatGPT launch, and the research that helped make a public assistant possible.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/hello-gpt-4o/",
    },
    {
      date: "2021–2026",
      title: "Codex and coding agents",
      description: "OpenAI’s software-writing thread: from the original Codex model to coding agents inside ChatGPT.",
      causalLink: "A separate history from ChatGPT’s consumer models.",
      becauseSummary: "Codex is not the next ChatGPT version. It is the software-writing lineage: models trained to write code, then Copilot, then coding agents. Open this to see that history on its own.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/openai-codex/",
    },
    {
      date: "NOV 2023",
      title: "Custom GPTs and the GPT Store",
      description: "ChatGPT becomes a platform: users can build and share specialized assistants on top of the base model.",
      causalLink: "How ChatGPT turned from a chatbot into a product surface.",
      becauseSummary: "Custom GPTs changed ChatGPT from a single assistant into a place where people could publish specialized tools. That platform story is distinct from the model-version ladder, which is why it sits as its own option.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/introducing-gpts/",
    },
  ],
  narrationScript:
    "ChatGPT is not one story. It is a consumer model lineage, a coding-agent lineage, and a platform lineage. Pick a thread and walk it backward.",
};

export const chatgptLineage: Story = {
  headline: "GPT-4o becomes the ChatGPT default",
  dek: "The earlier model releases and research that helped make this possible.",
  mode: "demo",
  kind: "lineage",
  events: [
    {
      date: "MAR 14, 2023",
      title: "GPT-4 raises the ceiling",
      description: "GPT-4 arrives in ChatGPT Plus with stronger reasoning, longer context, and image input.",
      causalLink: "GPT-4 set the expectation that each generation should feel smarter.",
      becauseSummary: "GPT-4o is easier to understand if you remember what GPT-4 changed. It was not just a faster ChatGPT. It raised the ceiling on reasoning, context, and images, which helped set the stage for a later default model that was supposed to see, hear, and answer in one product. The omnimodal jump is a continuation of that bet, not a separate invention.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/gpt-4-research/",
    },
    {
      date: "NOV 30, 2022",
      title: "ChatGPT launches",
      description: "A research preview turns GPT-3.5 into a product anyone can talk to, and demand explodes in days.",
      causalLink: "The chat interface made the model family a consumer story.",
      becauseSummary: "Without ChatGPT, GPT-4 would have been another research model with a waitlist. The November 2022 launch turned a model family into an interface millions of people already understood: type, get an answer. That habit helped set the stage for later default models, because the product already existed. Each new version was an upgrade to a daily tool, not a new category.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/chatgpt/",
    },
    {
      date: "MAR 2022",
      title: "InstructGPT teaches models to follow people",
      description: "Human feedback training makes large models more helpful and less likely to ignore the user’s actual request.",
      causalLink: "Alignment work helped make a public chatbot possible.",
      becauseSummary: "A chat product only works if the model tries to do what you asked. InstructGPT showed that human feedback could move a large model toward following instructions, which helped set the stage for putting GPT-class systems in public. Later ChatGPT versions still depend on that idea: the model is not just predicting text, it is being steered toward usefulness.",
      sourceName: "OpenAI Research",
      sourceUrl: "https://openai.com/index/instruction-following/",
    },
    {
      date: "JUN 2020",
      title: "GPT-3 demonstrates scale",
      description: "A 175-billion-parameter model displays powerful few-shot language abilities across many tasks.",
      causalLink: "Scale made a general assistant technically plausible.",
      becauseSummary: "GPT-3 is the earlier proof that one large model could handle many language tasks without a custom system for each job. That result helped set the stage for ChatGPT and for every later default model: if scale produced surprising generality, then a single assistant product was a reasonable next step. The later versions are refinements of that bet.",
      sourceName: "arXiv",
      sourceUrl: "https://arxiv.org/abs/2005.14165",
    },
  ],
  narrationScript:
    "Today’s ChatGPT is a default omnimodal assistant. That did not appear from nowhere. GPT-4o made one model the product. GPT-4 raised the ceiling. ChatGPT itself turned a model family into an interface. And InstructGPT taught the system to follow us.",
};

export const codexLineage: Story = {
  headline: "Codex and coding agents",
  dek: "The earlier products that helped make today’s coding agent possible.",
  mode: "demo",
  kind: "lineage",
  events: [
    {
      date: "JUN 2021",
      title: "GitHub Copilot puts Codex in the editor",
      description: "GitHub Copilot uses OpenAI Codex to suggest code as developers type, turning a research model into a daily tool.",
      causalLink: "Copilot made coding assistance a mainstream habit.",
      becauseSummary: "A coding agent is a much easier sell if developers already live with AI in the editor. Copilot took the Codex idea and put it where software gets written, which helped set the stage for later agent products. Once autocomplete felt normal, the next step — a system that can take a task and keep going — was a product change, not a leap from nowhere.",
      sourceName: "GitHub",
      sourceUrl: "https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/",
    },
    {
      date: "AUG 10, 2021",
      title: "OpenAI Codex is unveiled",
      description: "A descendant of GPT-3 is trained on public code and can generate working programs from natural-language prompts.",
      causalLink: "Codex showed language models could be specialized for software.",
      becauseSummary: "The original Codex release is the reason this thread is not just “ChatGPT but for code.” Training a GPT-3 descendant on public code helped set the stage for Copilot and for later coding agents. It established that a language model could be pointed at software as a domain, with real programs as the output, not just prose that happens to look like code.",
      sourceName: "OpenAI",
      sourceUrl: "https://openai.com/index/openai-codex/",
    },
    {
      date: "JUN 2020",
      title: "GPT-3 shows that scale can follow instructions",
      description: "GPT-3’s few-shot abilities, including early code samples, suggested a general model could be pointed at programming.",
      causalLink: "GPT-3 made a code-specialized descendant technically plausible.",
      becauseSummary: "Codex needed a general model strong enough to be specialized. GPT-3’s few-shot behavior, including rough code samples, helped set the stage for training a descendant on software. Without that scale result, a code model would have looked like a separate research program instead of a fork of a general language model.",
      sourceName: "arXiv",
      sourceUrl: "https://arxiv.org/abs/2005.14165",
    },
  ],
  narrationScript:
    "Codex is not just another ChatGPT version. It is a software-writing lineage. Today it is an agent. Before that, Copilot put it in the editor. In 2021, Codex itself arrived. And GPT-3 made the whole path possible.",
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

export function demoFor(query: string, mode: "overview" | "lineage"): Story | null {
  const key = normalize(query);
  if (mode === "overview" && /(^| )chatgpt( |$)/.test(key) && !key.includes("codex")) return chatgptOverview;
  if (mode === "lineage" && (key.includes("model lineage") || key.includes("chatgpt model") || key.includes("gpt-4o") || key.includes("gpt 4o"))) {
    return chatgptLineage;
  }
  if (mode === "lineage" && key.includes("codex")) return codexLineage;
  if (mode === "lineage" && key.includes("chatgpt") && !key.includes("codex")) return chatgptLineage;
  return null;
}
