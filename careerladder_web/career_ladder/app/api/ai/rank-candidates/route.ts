import Groq from "groq-sdk";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const rankingSchema = z.object({
    rankings: z.array(
        z.object({
            applicationId: z.string(),
            suitabilityScore: z.number().min(0).max(100),
            reasoning: z.string(),
        })
    ),
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { listing, candidates } = await req.json();

        const prompt = `
You are an employer assistant for CareerLadder, a Malaysian university career platform.

POSITION: ${listing.title}
DESCRIPTION: ${listing.description?.slice(0, 150) || "Not provided"}
REQUIRED SKILLS: ${listing.skills_required?.join(", ") || "Not specified"}

CANDIDATES (${candidates.length} total):
${candidates
    .map(
        (c: {
            applicationId: string;
            name: string;
            major: string;
            skills_fulfilled: string[];
            profile_summary: string;
        }) =>
            `ID:${c.applicationId} | ${c.name} | Major:${c.major} | Skills:${c.skills_fulfilled?.join(",") || "none"} | Summary:${c.profile_summary?.slice(0, 80) || ""}`,
    )
    .join("\n")}

Score each candidate 0–100 based on skills match, major relevance, and overall profile fit for the position.
Return JSON with a "rankings" array. Each item must have: applicationId (string), suitabilityScore (integer 0-100), reasoning (string max 80 chars).
Include ALL ${candidates.length} candidates in the rankings array. Only use IDs from the list above.
`;

        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an employer assistant. Always respond with valid JSON only.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const raw = response.choices[0].message.content ?? "{}";
        const object = rankingSchema.parse(JSON.parse(raw));

        return NextResponse.json({ success: true, data: object });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("AI ranking error:", message);
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
