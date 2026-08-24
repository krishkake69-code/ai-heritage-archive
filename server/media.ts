export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
export const allowedMimeTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "text/plain",
] as const;

export type MediaKind = "audio" | "video" | "photo" | "text";

export function mediaKindFromMime(mimeType: string): MediaKind {
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "photo";
  return "text";
}

export function validateMediaUpload(input: { mimeType: string; byteLength: number }) {
  if (!allowedMimeTypes.includes(input.mimeType as (typeof allowedMimeTypes)[number])) {
    throw new Error("Unsupported media type. Use audio, video, image, or plain text.");
  }
  if (input.byteLength <= 0 || input.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Media must be between 1 byte and 16 MB.");
  }
  return mediaKindFromMime(input.mimeType);
}
