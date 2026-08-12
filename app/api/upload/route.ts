import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload the file to Vercel Blob
    // 'public' access means anyone with the URL can view the image (required for social scrapers)
    const ext = file.name.split('.').pop() || 'png';
    const blob = await put(`hh-goa-${Date.now()}.${ext}`, file, {
      access: "public",
    });

    // Return the permanent cloud URL
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
