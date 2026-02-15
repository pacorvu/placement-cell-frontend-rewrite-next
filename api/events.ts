import { api } from "@/lib/api";

export interface CalendarEvent {
  id: number;
  title: string;
  type:
  | "ALUMNI_MEET"
  | "PLACEMENT_DRIVE"
  | "WORKSHOP"
  | "GUEST_LECTURE"
  | "TALK"
  | "WEBINAR"
  | "OTHER";
  details: string | null;
  event_datetime: string;
  images: string[] | null;
  attachments: string[] | null;
  images_signed_urls: (string | null)[] | null;
  attachments_signed_urls: (string | null)[] | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string | null;
  type: string | null;
  details: string | null;
  event_datetime: string | null;
  images: File[] | null;
  attachments: File[] | null;
  replace_images: boolean;
  replace_attachments: boolean;
}

// Get all events
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  const response = await api.get("/events");
  return response.data;
};

// Create new event
export const createEvent = async (data: EventFormData): Promise<CalendarEvent> => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.type) formData.append("type", data.type);
  if (data.details) formData.append("details", data.details);
  if (data.event_datetime) formData.append("event_datetime", data.event_datetime);

  // Append multiple images
  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  // Append multiple attachments
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  formData.append("replace_images", String(data.replace_images));
  formData.append("replace_attachments", String(data.replace_attachments));

  const response = await api.post("/events", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update event
export const updateEvent = async (
  eventId: number,
  data: EventFormData
): Promise<CalendarEvent> => {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.type) formData.append("type", data.type);
  if (data.details) formData.append("details", data.details);
  if (data.event_datetime) formData.append("event_datetime", data.event_datetime);

  // Append multiple images
  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  // Append multiple attachments
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  formData.append("replace_images", String(data.replace_images));
  formData.append("replace_attachments", String(data.replace_attachments));

  const response = await api.patch(`/events/${eventId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete event
export const deleteEvent = async (eventId: number): Promise<void> => {
  await api.delete(`/events/${eventId}`);
};
