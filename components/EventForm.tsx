import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { X, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { CalendarEvent, EventFormData } from "@/api/events";

interface EventFormProps {
  initialData?: CalendarEvent;
  selectedDate: Date;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type EventType = CalendarEvent["type"];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  ALUMNI_MEET: "Alumni Meet",
  PLACEMENT_DRIVE: "Placement Drive",
  WORKSHOP: "Workshop",
  GUEST_LECTURE: "Guest Lecture",
  TALK: "Talk",
  WEBINAR: "Webinar",
  OTHER: "Other",
};

export default function EventForm({
  initialData,
  selectedDate,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [replaceAttachments, setReplaceAttachments] = useState(false);

  const isEditMode = !!initialData;

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      type: (initialData?.type || "PLACEMENT_DRIVE") as EventType,
      details: initialData?.details || "",
      event_datetime: initialData?.event_datetime
        ? new Date(initialData.event_datetime).toISOString().slice(0, 16)
        : format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
    },
    onSubmit: async ({ value }) => {
      const submitData: EventFormData = {
        title: value.title || null,
        type: value.type || null,
        details: value.details || null,
        event_datetime: value.event_datetime
          ? new Date(value.event_datetime).toISOString()
          : null,
        images: imageFiles.length > 0 ? imageFiles : null,
        attachments: attachmentFiles.length > 0 ? attachmentFiles : null,
        replace_images: replaceImages,
        replace_attachments: replaceAttachments,
      };
      onSubmit(submitData);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachmentFiles((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <h4 className="font-semibold text-base-content/80 text-lg mb-6">
        {isEditMode ? "Edit Event" : "Add New Event"}
      </h4>

      {/* Title */}
      <form.Field name="title">
        {(field) => (
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Event title"
              className="input input-bordered w-full"
              required
            />
          </div>
        )}
      </form.Field>

      {/* Type */}
      <form.Field name="type">
        {(field) => (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Event Type</span>
            </label>
            <select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as EventType)}
              className="select select-bordered w-full"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      {/* Date & Time */}
      <form.Field name="event_datetime">
        {(field) => (
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Date & Time <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="datetime-local"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
        )}
      </form.Field>

      {/* Details */}
      <form.Field name="details">
        {(field) => (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Details</span>
            </label>
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Event description and details"
              rows={4}
              className="textarea textarea-bordered w-full"
            />
          </div>
        )}
      </form.Field>

      {/* Images Upload */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Images</span>
          {isEditMode &&
            initialData?.images_signed_urls &&
            initialData.images_signed_urls.filter(url => url !== null).length > 0 && (
              <label className="label cursor-pointer gap-2">
                <span className="label-text-alt">Replace existing</span>
                <input
                  type="checkbox"
                  checked={replaceImages}
                  onChange={(e) => setReplaceImages(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
              </label>
            )}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full"
        />

        {/* Show existing images in edit mode */}
        {isEditMode &&
          !replaceImages &&
          initialData?.images_signed_urls &&
          initialData.images_signed_urls.filter(url => url !== null).length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-base-content/70 mb-2">
                Current images ({initialData.images_signed_urls.filter(url => url !== null).length})
              </p>
              <div className="flex flex-wrap gap-2">
                {initialData.images_signed_urls
                  .filter((url): url is string => url !== null)
                  .slice(0, 3)
                  .map((url, idx) => (
                    <div key={idx} className="avatar">
                      <div className="w-16 h-16 rounded">
                        <img src={url} alt={`Image ${idx + 1}`} />
                      </div>
                    </div>
                  ))}
                {initialData.images_signed_urls.filter(url => url !== null).length > 3 && (
                  <div className="flex items-center text-xs text-base-content/60">
                    +{initialData.images_signed_urls.filter(url => url !== null).length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Show new image files */}
        {imageFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {imageFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-base-200 rounded"
              >
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <span className="text-xs text-base-content/60">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachments Upload */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Attachments</span>
          {isEditMode &&
            initialData?.attachments_signed_urls &&
            initialData.attachments_signed_urls.filter(url => url !== null).length > 0 && (
              <label className="label cursor-pointer gap-2">
                <span className="label-text-alt">Replace existing</span>
                <input
                  type="checkbox"
                  checked={replaceAttachments}
                  onChange={(e) => setReplaceAttachments(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
              </label>
            )}
        </label>
        <input
          type="file"
          multiple
          onChange={handleAttachmentChange}
          className="file-input file-input-bordered w-full"
        />

        {/* Show existing attachments in edit mode */}
        {isEditMode &&
          !replaceAttachments &&
          initialData?.attachments_signed_urls &&
          initialData.attachments_signed_urls.filter(url => url !== null).length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-base-content/70 mb-2">
                Current attachments ({initialData.attachments_signed_urls.filter(url => url !== null).length})
              </p>
              <div className="space-y-1">
                {initialData.attachments_signed_urls
                  .filter((url): url is string => url !== null)
                  .slice(0, 3)
                  .map((url, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary truncate"
                      >
                        Attachment {idx + 1}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Show new attachment files */}
        {attachmentFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachmentFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-base-200 rounded"
              >
                <FileText className="w-4 h-4 text-secondary" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <span className="text-xs text-base-content/60">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline flex-1"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditMode ? "Update Event" : "Create Event"}</>
          )}
        </button>
      </div>
    </form>
  );
}
