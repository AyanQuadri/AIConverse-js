// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

// POST - Create and respond
export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const userMessage = await prisma.message.create({
            data: {
                role: "user",
                content: prompt,
            },
        });

        const reply = await getGeminiResponse(prompt);
        const safeReply = reply || "Sorry, I couldn't generate a response.";

        const assistantMessage = await prisma.message.create({
            data: {
                role: "assistant",
                content: safeReply,
            },
        });

        return NextResponse.json([userMessage, assistantMessage]);
    } catch (error) {
        console.error("POST /api/chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET - Fetch all messages
export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("GET /api/chat error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

// DELETE - Remove all messages
export async function DELETE() {
    try {
        await prisma.message.deleteMany({});
        return NextResponse.json({ message: "All messages deleted successfully." });
    } catch (error) {
        console.error("DELETE /api/chat error:", error);
        return NextResponse.json({ error: "Failed to delete messages" }, { status: 500 });
    }
}
