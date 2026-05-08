import { z } from "zod";

export const BrochureInputSchema = z.object({

    companyName: z
        .string()
        .trim()
        .min(2, {
            message:
                "Company name is too short",
        })
        .max(100, {
            message:
                "Company name is too long",
        }),
    url: z
        .string()
        .trim()

        .url({
            message:
                "Please enter a valid website URL",
        }),
});


export type BrochureInput =
    z.infer<typeof BrochureInputSchema>;