import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const sessions = await prisma.chatSession.findMany({
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}
