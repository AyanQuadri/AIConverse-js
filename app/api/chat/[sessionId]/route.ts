import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching session" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await req.json();
    const schema = z.object({ title: z.string().min(1) });
    const { title } = schema.parse(body);

    const updated = await prisma.chatSession.update({
      where: { id: params.sessionId },
      data: { title },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update title" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    await prisma.chatSession.delete({
      where: { id: params.sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
