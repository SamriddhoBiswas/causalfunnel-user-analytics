import { Schema, model, models, type InferSchemaType } from "mongoose";

export const eventTypes = ["page_view", "click"] as const;
export type EventType = (typeof eventTypes)[number];

const EventSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      enum: eventTypes,
      index: true
    },
    pageUrl: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    x: {
      type: Number,
      required: false
    },
    y: {
      type: Number,
      required: false
    }
  },
  {
    timestamps: true
  }
);

EventSchema.index({ sessionId: 1, timestamp: 1 });
EventSchema.index({ pageUrl: 1, eventType: 1 });

export type EventDocument = InferSchemaType<typeof EventSchema>;

const Event = models.Event || model("Event", EventSchema);

export default Event;
