import Groq from "groq-sdk";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const recommendationSchema = z.object({
    recommendedJobIds: z.array(z.string()),
    recommendedProjectIds: z.array(z.string()),
    recommendedTrainingIds: z.array(z.string()),
    skillGaps: z.array(z.string()),
    careerAdvice: z.string(),
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { student, jobs, projects, trainings } = await req.json();

        const prompt = `
You are a career advisor for CareerLadder, a platform that connects Malaysian university students with job, project, and training opportunities.

STUDENT PROFILE:
- Skills: ${student.skills?.join(", ") || "None listed"}
- Major: ${student.major || "Not specified"}
- Job Preference: ${student.jobPreference || "Not specified"}
- Location: ${student.location || "Not specified"}
- Summary: ${student.summary || "Not provided"}
- Experience: ${student.experience?.map((e: { jobtitle: string; company: string }) => `${e.jobtitle} at ${e.company}`).join("; ") || "None"}
- Education: ${student.education?.map((e: { field: string; institution: string }) => `${e.field} at ${e.institution}`).join("; ") || "None"}

AVAILABLE JOBS (${jobs?.length ?? 0} total):
${jobs?.map((j: { id: string; title: string; skills_required: string[]; description: string }) =>
    `ID:${j.id} | ${j.title} | Required skills: ${j.skills_required?.join(", ") || "none"} | ${j.description}`
).join("\n") || "None available"}

AVAILABLE PROJECTS (${projects?.length ?? 0} total):
${projects?.map((p: { id: string; title: string; skills_required: string[]; description: string }) =>
    `ID:${p.id} | ${p.title} | Required skills: ${p.skills_required?.join(", ") || "none"} | ${p.description}`
).join("\n") || "None available"}

AVAILABLE TRAINING SESSIONS (${trainings?.length ?? 0} total):
${trainings?.map((t: { id: string; title: string; prerequisites: string; expected_outcome: string }) =>
    `ID:${t.id} | ${t.title} | Prerequisites: ${t.prerequisites || "none"} | Outcome: ${t.expected_outcome || ""}`
).join("\n") || "None available"}

Return a JSON object with exactly these fields:
- recommendedJobIds: array of up to 5 job IDs from the list above that best match the student
- recommendedProjectIds: array of up to 5 project IDs that suit the student
- recommendedTrainingIds: array of up to 5 training IDs that would benefit the student
- skillGaps: array of up to 6 skill names the student should learn
- careerAdvice: string with 2-3 sentences of personalised career advice

Only use IDs that exist in the lists above. Return ONLY the JSON object, no extra text.
`;

        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a career advisor. Always respond with valid JSON only.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const raw = response.choices[0].message.content ?? "{}";
        const object = recommendationSchema.parse(JSON.parse(raw));

        return NextResponse.json({ success: true, data: object });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("AI recommendation error:", message);
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
