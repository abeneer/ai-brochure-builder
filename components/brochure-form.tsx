"use client";

import { useState } from "react";

type Props = {
  onResult: (text: string) => void;
  onError: (text: string) => void;
};

export function BrochureForm({ onResult, onError }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");

  async function handleSubmit() {
    setLoading(true);
    onError("");
    onResult("");
    setStatus("Analyzing website...");

    try {
      const res = await fetch("/api/brochure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName, url }),
      });

      if(!res.ok){
        const errorText = await res.text();
        throw new Error(errorText || "Request Failed");
      }

      // read the Response as a stream 
      const reader = res.body?.getReader();
      if(!reader){
        throw new Error("Streaming not Supported in this browser response");
      }

      const decoder = new TextDecoder();
      let fullText = "";
      setStatus("Generating brochure...");

      while(true){
        const { done, value } = await reader.read();
        if(done) break;

        fullText += decoder.decode(value, { stream: true });
        onResult(fullText);
      }

      
      setStatus("")
    } catch (err: any) {
      onError(err.message || "Something went wrong");
      setStatus("")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
      <h1 className="text-3xl font-semibold">AI Brochure Builder</h1>
      <p className="mt-2 text-sm text-white/70">
        Enter a company name and website. The app will create a clean brochure
        for you.
      </p>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <input
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
          placeholder="Website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !companyName || !url}
          className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate brochure"}
        </button>
        {loading && (
          <p className="text-sm text-blue-400 mt-2 animate-pulse">{status}</p>
        )}
      </div>
    </div>
  );
}
