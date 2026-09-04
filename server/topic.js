export function extractTopic(transcript) {
  let text = String(transcript || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const leading = [
    /^(?:um+|uh+|er+|ah+|okay|ok|so|hey|hi|please)[,.]?\s+/i,
    /^i(?:'m| am)?(?: just)?(?: kinda| kind of)?(?: was)? wonder(?:ing)?(?: about)?\s+/i,
    /^(?:can|could) you(?: please)?(?: search(?: for)?| look up| find| tell me(?: about)?| explain| trace)\s+/i,
    /^(?:please )?(?:search(?: for)?|look up|find|tell me(?: about)?|explain|trace)\s+/i,
    /^(?:i want to know(?: about| what)?|i'd like to know(?: about| what)?)\s+/i,
    /^(?:what(?:'s| is| are)|whats)\s+(?:the )?(?:deal with|story(?: behind| with)?|history of|latest(?: on| with)?|news(?: on| about)?|going on with|up with|happening with)\s+/i,
    /^(?:what(?:'s| is| are)|whats)\s+/i,
    /^what\s+/i,
    /^(?:who(?:'s| is)|whos)\s+/i,
    /^(?:how did we get here(?: with| for| on)?)\s+/i,
    /^(?:how did|how does)\s+/i,
    /^(?:a|an|the|about)\s+/i,
  ];

  for (let pass = 0; pass < 4; pass += 1) {
    const before = text;
    for (const pattern of leading) text = text.replace(pattern, "");
    if (text === before) break;
  }

  text = text
    .replace(/[?!.,]+$/g, "")
    .replace(/\s+(?:is|are|was|were|about|please|again)\s*[?!.]*$/i, "")
    .replace(/^(?:a|an|the|about)\s+/i, "")
    .trim();

  return (text || String(transcript).trim()).slice(0, 240);
}
