// File: app/api/chat/[sessionId]/messages/route.ts

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getGeminiResponse } from "@/lib/gemini";
// import { stripMarkdown } from "@/lib/utils"; // Uncomment if needed

const bodySchema = z.object({
    message: z.string().min(1),
});

// GET: Fetch all messages for a session
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> } 
) {
    const { sessionId } = await params;

    try {
        const messages = await prisma.chatMessage.findMany({
            where: {
                sessionId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return Response.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return new Response("Failed to fetch messages", { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const { sessionId } = params;

    try {
        const { message } = bodySchema.parse(await req.json());

        const userMessage = await prisma.chatMessage.create({
            data: {
                sessionId,
                content: message,
                role: "user",
            },
        });

        const geminiReply = await getGeminiResponse(message);

        const assistantMessage = await prisma.chatMessage.create({
            data: {
                sessionId,
                content: geminiReply,
                role: "assistant",
            },
        });

        return Response.json({
            userMessage,
            assistantMessage,
        });
    } catch (err) {
        console.error("POST /api/chat/[sessionId]/messages error:", err);
        return new Response("Failed to process message", { status: 500 });
    }
}
