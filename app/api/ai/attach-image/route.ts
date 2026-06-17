import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { requirePro } from "@/lib/ai/require-pro";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const gate = await requirePro();
  if ("error" in gate) return gate.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10 MB or smaller" },
        { status: 400 },
      );
    }

    const { url } = await uploadToCloudinary(file, {
      folder: "nucleus/chat-attachments",
      resourceType: "image",
    });

    return NextResponse.json({ url, mediaType: file.type });
  } catch (error) {
    console.error("Chat image upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
