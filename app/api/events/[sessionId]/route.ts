import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Event from "@/models/Event";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId || sessionId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "sessionId is required." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const events = await Event.find({ sessionId })
      .sort({ timestamp: 1 })
      .select("-__v")
      .lean();

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch session events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch session events." },
      { status: 500 }
    );
  }
}
