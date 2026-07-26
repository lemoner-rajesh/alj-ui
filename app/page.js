"use client";

import { useEffect, useRef, useState } from "react";
import { ArticleCardGrid, ArticleCardSkeleton } from "@/components/ArticleCard";
import { parseClaudeResponse } from "@/lib/parseResponse";

let nextId = 1;
function makeId() {
  return nextId++;
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "user", text: trimmed },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const { text, articles } = parseClaudeResponse(data);

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          text,
          articles,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          error: err?.message || "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1>ALJ News</h1>
        <p>Ask about the latest ALJ news, people, projects, and events.</p>
      </header>

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            Try asking: &ldquo;What are the latest news articles on
            ALJ?&rdquo;
          </div>
        ) : null}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {loading ? <LoadingBubble /> : null}
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about ALJ news, people, projects, or events..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="message-row user">
        <div className="message-bubble user">{message.text}</div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="message-row assistant">
        <div className="message-bubble error">
          <strong>Something went wrong.</strong>
          <p>{message.error}</p>
        </div>
      </div>
    );
  }

  const hasArticles = message.articles && message.articles.length > 0;

  return (
    <div className="message-row assistant">
      <div className="message-content">
        {message.text ? (
          <div className="message-bubble assistant">{message.text}</div>
        ) : null}

        {/* Every parsed result with a `display` field always renders as a
            card here — this is unconditional, never left to model text. */}
        {hasArticles ? <ArticleCardGrid articles={message.articles} /> : null}

        {!message.text && !hasArticles ? (
          <div className="message-bubble assistant muted">
            No results found.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="message-row assistant">
      <div className="message-content">
        <div className="message-bubble assistant muted">Thinking...</div>
        <div className="article-grid">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
      </div>
    </div>
  );
}
