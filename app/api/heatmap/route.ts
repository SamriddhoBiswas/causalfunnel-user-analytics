import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get("pageUrl");

    if (!pageUrl || pageUrl.trim() === "") {
      return NextResponse.json(
        { success: false, error: "pageUrl query parameter is required." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const clicks = await Event.find({
      pageUrl: pageUrl.trim(),
      eventType: "click",
      x: { $type: "number" },
      y: { $type: "number" }
    })
      .sort({ timestamp: 1 })
      .select("sessionId pageUrl timestamp x y -_id")
      .lean();

    return NextResponse.json({ success: true, clicks });
  } catch (error) {
    console.error("Failed to fetch heatmap events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch heatmap events." },
      { status: 500 }
    );
  }
}
