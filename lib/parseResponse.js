/**
 * Deterministic parsing of a Claude Messages API response that used the
 * ALJ Connect MCP server. This intentionally does NOT ask the model to
 * decide how to render anything — every parsed result with a `display`
 * field always becomes a card, and plain "text" blocks are only ever
 * narration alongside the cards.
 */

/** Pull the raw text payload out of an mcp_tool_result content block. */
function extractToolResultText(block) {
  const content = block?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const textBlock = content.find((c) => c?.type === "text") || content[0];
    return textBlock?.text ?? null;
  }
  return null;
}

/** Normalize a parsed tool-result payload into an array of result objects. */
function normalizeResults(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.results)) return parsed.results;
  if (parsed && typeof parsed === "object") return [parsed];
  return [];
}

/**
 * @param {object} response - Raw Claude Messages API response.
 * @returns {{ text: string, articles: object[] }}
 *   `articles` only ever contains items that have a `display` field —
 *   those are guaranteed to render as ArticleCards, never as plain text.
 */
export function parseClaudeResponse(response) {
  const content = Array.isArray(response?.content) ? response.content : [];
  const textParts = [];
  const articles = [];

  for (const block of content) {
    if (block?.type === "text" && typeof block.text === "string") {
      textParts.push(block.text);
      continue;
    }

    if (block?.type === "mcp_tool_result" && !block.is_error) {
      const rawText = extractToolResultText(block);
      if (!rawText) continue;

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Not JSON — nothing we can safely render as a card, skip it.
        continue;
      }

      for (const item of normalizeResults(parsed)) {
        if (item && typeof item === "object" && item.display) {
          articles.push(item);
        }
      }
    }
  }

  return { text: textParts.join("\n\n").trim(), articles };
}
