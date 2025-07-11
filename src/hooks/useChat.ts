import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { processMessage } from "../utils/processMessage";
import { AVAILABLE_MODELS } from "../utils/availableModels";
import type { ORMessage } from "../completion/openRouterTypes";

// const model = "google/gemini-2.0-flash-001"
const model = "anthropic/claude-sonnet-4";
// const model = "google/gemini-2.5-pro-preview";

export function useChat() {
  const [messages, setMessages] = useState<ORMessage[]>([]);
  const [mainQuery, setMainQuery] = useState("");
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [tokenUsage, setTokenUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
  }>({
    inputTokens: 0,
    outputTokens: 0,
  });

  useEffect(() => {
    const a = AVAILABLE_MODELS.find((m) => m.model === model);
    const cost =
      ((a?.cost.prompt || 0) * tokenUsage.inputTokens) / 1_000_000 +
      ((a?.cost.completion || 0) * tokenUsage.outputTokens) / 1_000_000;
    console.info(
      `Total tokens used: Input ${tokenUsage.inputTokens}, Output ${tokenUsage.outputTokens}, Est. Cost ${cost}`
    );
  }, [tokenUsage]);

  const handleMainSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!mainQuery.trim()) return;

    setMessages([{ role: "user", content: mainQuery }]);
    setIsLoading(true);
    setFollowUpQuery("");
    setStatus("Searching DANDI archive...");

    try {
      const { newMessages, inputTokens, outputTokens } = await processMessage(
        mainQuery,
        [],
        setStatus,
        model,
        (newMessages) => {
          setMessages(newMessages);
        }
      );
      setTokenUsage((prev) => ({
        inputTokens: prev.inputTokens + inputTokens,
        outputTokens: prev.outputTokens + outputTokens,
      }));
      setMessages(newMessages);
      setMainQuery("");
    } finally {
      setStatus("");
      setIsLoading(false);
    }
  };

  const handleFollowUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: followUpQuery }]);
    setIsLoading(true);
    setStatus("Processing follow-up query...");

    try {
      const { newMessages, inputTokens, outputTokens } = await processMessage(
        followUpQuery,
        messages,
        setStatus,
        model,
        (newMessages) => {
          setMessages(newMessages);
        }
      );
      setTokenUsage((prev) => ({
        inputTokens: prev.inputTokens + inputTokens,
        outputTokens: prev.outputTokens + outputTokens,
      }));
      setMessages(newMessages);
      setFollowUpQuery("");
    } finally {
      setStatus("");
      setIsLoading(false);
    }
  };

  return {
    messages,
    mainQuery,
    followUpQuery,
    isLoading,
    setMainQuery,
    setFollowUpQuery,
    handleMainSearch,
    handleFollowUp,
    status,
  };
}
