import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Event, { eventTypes, type EventType } from "@/models/Event";

type TrackPayload = {
  sessionId?: unknown;
  eventType?: unknown;
  pageUrl?: unknown;
  timestamp?: unknown;
  x?: unknown;
  y?: unknown;
};

function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && eventTypes.includes(value as EventType);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validatePayload(payload: TrackPayload) {
  const errors: string[] = [];

  if (typeof payload.sessionId !== "string" || payload.sessionId.trim() === "") {
    errors.push("sessionId is required and must be a non-empty string.");
  }

  if (!isEventType(payload.eventType)) {
    errors.push("eventType is required and must be either page_view or click.");
  }

  if (typeof payload.pageUrl !== "string" || payload.pageUrl.trim() === "") {
    errors.push("pageUrl is required and must be a non-empty string.");
  }

  const timestamp = new Date(String(payload.timestamp));
  if (!payload.timestamp || Number.isNaN(timestamp.getTime())) {
    errors.push("timestamp is required and must be a valid date.");
  }

  if (payload.x !== undefined && !isFiniteNumber(payload.x)) {
    errors.push("x must be a finite number when provided.");
  }

  if (payload.y !== undefined && !isFiniteNumber(payload.y)) {
    errors.push("y must be a finite number when provided.");
  }

  return {
    errors,
    timestamp
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackPayload;
    const { errors, timestamp } = validatePayload(payload);

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    await connectMongoDB();

    const event = await Event.create({
      sessionId: String(payload.sessionId).trim(),
      eventType: payload.eventType,
      pageUrl: String(payload.pageUrl).trim(),
      timestamp,
      x: payload.x,
      y: payload.y
    });

    return NextResponse.json(
      {
        success: true,
        eventId: event._id
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    console.error("Failed to track event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store event." },
      { status: 500 }
    );
  }
}
