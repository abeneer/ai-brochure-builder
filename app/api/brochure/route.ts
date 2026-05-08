import OpenAI from "openai";

import { brochureCache } from "@/lib/cache";

import {
  fetchHtml,
  extractText,
  extractLinks,
} from "@/lib/scrape";

import {
  BrochureInputSchema,
} from "@/lib/validators";


//  This creates connection to OpenAI API.
 

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * =========================================
 * POST /api/brochure
 * =========================================
 *
 * Main backend route.
 *
 * FLOW:
 *
 * 1. Receive frontend data
 * 2. Validate input
 * 3. Check cache
 * 4. Scrape website
 * 5. Extract links
 * 6. Ask AI to pick useful links
 * 7. Scrape extra pages
 * 8. Generate brochure
 * 9. Stream brochure live
 * 10. Save to cache
 */

export async function POST(req: Request) {

  try {
    // GET REQUEST BODY
    const body = await req.json();

    // VALIDATE INPUT USING ZOD
    const validatedData =
      BrochureInputSchema.parse(body);

    const {
      companyName,
      url,
    } = validatedData;

    console.log("Company:", companyName);
    console.log("URL:", url);

    // CHECK CACHE
    const cachedBrochure =
      brochureCache.get(url);

    if (cachedBrochure) {

      console.log("CACHE HIT");

      return new Response(
        cachedBrochure,
        {
          headers: {
            "Content-Type":
              "text/plain",
          },
        }
      );
    }

    // FETCH WEBSITE HTML
    const html =
      await fetchHtml(url);

      // EXTRACT MAIN WEBSITE TEXT

    const mainText =
      extractText(html);

    
      // EXTRACT WEBSITE LINKS
    const links =
      extractLinks(url, html);

    /**
     *
     * ASK AI TO PICK BEST LINKS
  
     * LLM intelligently chooses:
     * - about
     * - careers
     * - products
     * etc.
     */

    const linkResponse =
      await client.chat.completions.create({

        model: "gpt-4.1-mini",

        response_format: {
          type: "json_object",
        },

        messages: [

          {
            role: "system",

            content: `
You analyze company websites.

Select ONLY useful links for
building a business brochure.

Useful:
- About
- Careers
- Products
- Services
- Customers
- Solutions

Avoid:
- Privacy
- Terms
- Cookies
- Login
- Signup

Return STRICT JSON:

{
  "links": [
    "https://example.com/about"
  ]
}
            `,
          },

          {
            role: "user",

            content: `
Website:
${url}

Links:
${links.join("\n")}
            `,
          },
        ],
      });

    
     
    //PARSE AI JSON SAFELY
     

    let selectedLinks: string[] = [];

    try {

      const parsed =
        JSON.parse(
          linkResponse
            .choices[0]
            .message
            .content || "{}"
        );

      selectedLinks =
        parsed.links || [];

    } catch (error) {

      console.error(
        "Failed parsing AI JSON:",
        error
      );

      selectedLinks = [];
    }

 
    // FETCH EXTRA PAGE CONTENT
     

    let extraContent = "";

    for (
      const link of selectedLinks.slice(0, 3)
    ) {

      try {

        console.log(
          "Fetching:",
          link
        );

        const pageHtml =
          await fetchHtml(link);

        const pageText =
          extractText(pageHtml);

        extraContent += `

Page: ${link}

${pageText}

        `;

      } catch (error) {

        console.error(
          "Failed fetching page:",
          link
        );
      }
    }

    
    //  GENERATE BROCHURE
     
    const stream =
      await client.chat.completions.create({

        model: "gpt-4.1-mini",

        stream: true,

        messages: [

          {
            role: "system",

            content: `
You are an expert business copywriter.

Create a modern professional brochure
in markdown format.

RULES:
- Use # for title
- Use ## for headings
- Use bullet points
- Keep paragraphs short
- Avoid giant text blocks
- Make brochure visually clean

SECTIONS:
- Overview
- Products / Services
- Customers
- Why It Matters
- Culture & Careers
- Contact

TONE:
Professional
Modern
Readable
            `,
          },

          {
            role: "user",

            content: `
Company:
${companyName}

Website:
${url}

MAIN WEBSITE CONTENT:
${mainText}

ADDITIONAL PAGES:
${extraContent}
            `,
          },
        ],
      });

    /**
     * =========================================
     * STREAM RESPONSE TO FRONTEND
     * =========================================
     */

    const encoder =
      new TextEncoder();

    return new Response(

      new ReadableStream({

        async start(controller) {

          /**
           * IMPORTANT:
           * Must exist OUTSIDE try block
           * so finally block can access it.
           */

          let fullResponse = "";

          try {

            /**
             * Read stream chunk-by-chunk
             */

            for await (
              const chunk of stream
            ) {

              /**
               * Extract text token
               */

              const text =
                chunk
                  .choices[0]
                  ?.delta
                  ?.content || "";

              /**
               * Save full response
               * for caching
               */

              fullResponse += text;

              /**
               * Send chunk to frontend
               */

              controller.enqueue(
                encoder.encode(text)
              );
            }

          } catch (error) {

            console.error(
              "Streaming error:",
              error
            );

          } finally {

            /**
             * Save brochure into cache
             */

            brochureCache.set(
              url,
              fullResponse
            );

            console.log(
              "CACHE SAVED"
            );

            /**
             * Close stream
             */

            controller.close();
          }
        },
      }),

      {
        headers: {
          "Content-Type":
            "text/plain",
        },
      }
    );

  } catch (error: any) {

    /**
     * =========================================
     * GLOBAL ERROR HANDLER
     * =========================================
     */

    console.error(
      "BROCHURE API ERROR:",
      error
    );

    return Response.json(

      {
        error:
          error.message ||
          "Failed generating brochure",
      },

      {
        status: 500,
      }
    );
  }
}