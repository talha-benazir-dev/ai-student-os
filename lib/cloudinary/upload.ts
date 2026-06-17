import { createHash } from "crypto";

type CloudinaryUploadOptions = {
  folder: string;
  resourceType?: "image" | "raw";
};

export async function uploadToCloudinary(
  file: File | Blob,
  { folder, resourceType = "image" }: CloudinaryUploadOptions,
): Promise<{ url: string; public_id: string }> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureString).digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("resource_type", resourceType);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  return { url: data.secure_url, public_id: data.public_id };
}
