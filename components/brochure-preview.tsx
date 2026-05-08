"use client";

import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { toast } from "sonner";

type Props = {
  result: string;
  error: string;
};

export function BrochurePreview({
  result,
  error,
}: Props) {

  /**
   * Reference to brochure container
   */
  const brochureRef = useRef<HTMLDivElement>(null);

  /**
   * Copy brochure text
   */
  async function handleCopy() {

    if (!result) return;

    await navigator.clipboard.writeText(result);

    toast.success("Copied to clipboard");;
  }

  /**
   * Download brochure as PDF
   */
  async function handleDownloadPDF() {

    if (!brochureRef.current) return;

    /**
     * Convert HTML → canvas
     */
    const canvas = await html2canvas(
      brochureRef.current
    );

    /**
     * Canvas → image
     */
    const image = canvas.toDataURL("image/png");

    /**
     * Create PDF
     */
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    /**
     * PDF dimensions
     */
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    /**
     * Add image into PDF
     */
    pdf.addImage(
      image,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save("brochure.pdf");
    toast.success("PDF downloaded");

    /**
     * Download file
     */
    pdf.save("brochure.pdf");
  }

  return (

    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-white">
            Generated Brochure
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            AI-generated company overview
          </p>

        </div>

        <div className="flex gap-3">

          {/* COPY BUTTON */}
          <button
            onClick={handleCopy}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-105"
          >
            Copy
          </button>

          {/* PDF BUTTON */}
          <button
            onClick={handleDownloadPDF}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Download PDF
          </button>

        </div>

      </div>

      {/* DIVIDER */}
      <div className="my-6 h-px bg-white/10" />

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!result && !error && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
          Your brochure will appear here
        </div>
      )}

      {/* BROCHURE CONTENT */}
      {result && (

        <div
          ref={brochureRef}
          className="
            prose
            prose-invert
            max-w-none

            prose-h1:text-5xl
            prose-h1:font-bold

            prose-h2:text-3xl
            prose-h2:font-semibold
            prose-h2:mt-10

            prose-p:text-base
            prose-p:leading-8

            prose-li:text-base
            prose-li:leading-8

            prose-strong:text-white
          "
        >

          <ReactMarkdown>
            {result}
          </ReactMarkdown>

        </div>

      )}

    </div>
  );
}