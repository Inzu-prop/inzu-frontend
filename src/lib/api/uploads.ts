/**
 * Uploads a file to a presigned URL (e.g. from POST .../properties/:id/upload-photo
 * or .../maintenance/:ticketId/upload-photo). Do not send the Clerk token to the
 * storage URL; presigned URLs are self-contained.
 */
export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  options?: { contentType?: string },
): Promise<void> {
  const headers: Record<string, string> = {};
  if (options?.contentType !== undefined) {
    headers["Content-Type"] = options.contentType;
  } else if (file.type) {
    headers["Content-Type"] = file.type;
  }

  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
}
