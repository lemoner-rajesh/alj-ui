import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MCP_SERVER_URL = "https://alj-connect-production.up.railway.app/mcp";
const MCP_SERVER_NAME = "alj-connect";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body?.message;
  if (!message || typeof message !== "string") {
    return Response.json(
      { error: "Request body must include a non-empty 'message' string." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set on the server. Locally, add it to .env.local and restart the dev server. On a host like Vercel or Railway, set it as a project environment variable and redeploy.",
      },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    // The MCP server is attached via the beta MCP connector: `mcp_servers`
    // declares the remote server, and the matching `mcp_toolset` tool is
    // what actually grants Claude access to its tools.
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: message }],
      mcp_servers: [
        {
          type: "url",
          url: MCP_SERVER_URL,
          name: MCP_SERVER_NAME,
        },
      ],
      tools: [{ type: "mcp_toolset", mcp_server_name: MCP_SERVER_NAME }],
      betas: ["mcp-client-2025-11-20"],
    });

    return Response.json(response);
  } catch (error) {
    console.error("Claude API error:", error);
    return Response.json(
      { error: error?.message || "Failed to reach the Claude API." },
      { status: 502 }
    );
  }
}
