import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";



const bodySchema = z.object({
    title: z.string().optional(),
    firstMessage: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, firstMessage } = bodySchema.parse(body);

        const session = await prisma.chatSession.create({
            data: {
                title: title || firstMessage || "Untitled Session",
                messages: firstMessage
                    ? {
                        create: {
                            role: "user",
                            content: firstMessage,
                        },
                    }
                    : undefined,
            },
        });

        return NextResponse.json({ sessionId: session.id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Could not start session" }, { status: 500 });
    }
}
