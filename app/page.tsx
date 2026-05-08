"use client";

import { useState } from "react";

import { BrochureForm } from "@/components/brochure-form";
import { BrochurePreview } from "@/components/brochure-preview";

export default function HomePage() {

  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  /**
   * If brochure exists
   * expand right panel
   */
  const hasResult = result.length > 0;

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-8">

      <div
        className={`
          mx-auto
          grid
          max-w-[1600px]
          gap-8
          transition-all
          duration-500

          ${
            hasResult
              ? "grid-cols-1 lg:grid-cols-[30%_70%]"
              : "grid-cols-1 lg:grid-cols-2"
          }
        `}
      >

        {/* LEFT SIDE */}
        <section className="transition-all duration-500">

          <BrochureForm
            onResult={setResult}
            onError={setError}
          />

        </section>

        {/* RIGHT SIDE */}
        <section className="transition-all duration-500 min-w-0">

          <BrochurePreview
            result={result}
            error={error}
          />

        </section>

      </div>

    </main>
  );
}