import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const userMessage = await prisma.message.findUnique({
            where: { id: params.id },
        });

        if (!userMessage || userMessage.role !== "user") {
            return NextResponse.json({ error: "User message not found" }, { status: 404 });
        }

        // Find the assistant message directly after the user message
        const assistantMessage = await prisma.message.findFirst({
            where: {
                role: "assistant",
                createdAt: { gt: userMessage.createdAt },
            },
            orderBy: { createdAt: "asc" },
        });

        // Delete both messages (user + assistant)
        await prisma.message.deleteMany({
            where: {
                id: {
                    in: [userMessage.id, assistantMessage?.id].filter(Boolean) as string[]

                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/chat/:id error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
