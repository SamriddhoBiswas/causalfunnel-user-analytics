import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectMongoDB();

    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$sessionId",
          eventCount: { $sum: 1 },
          latestTimestamp: { $max: "$timestamp" }
        }
      },
      {
        $project: {
          _id: 0,
          sessionId: "$_id",
          eventCount: 1,
          latestTimestamp: 1
        }
      },
      {
        $sort: {
          latestTimestamp: -1,
          sessionId: 1
        }
      }
    ]);

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions." },
      { status: 500 }
    );
  }
}
