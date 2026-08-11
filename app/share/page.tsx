import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// 1. This function dynamically generates the Open Graph tags based on the URL parameter
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { img?: string };
}): Promise<Metadata> {
  const imageUrl = searchParams.img || "/default-og.png";

  return {
    title: "My HH Goa 2026 Builder ID",
    description: "Ready for the Goa Hacker House! 🌴 #FrameInGoa #HHGoa2026",
    openGraph: {
      title: "My HH Goa 2026 Builder ID",
      description: "Ready for the Goa Hacker House! 🌴 #FrameInGoa #HHGoa2026",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image", // This forces the large image preview on X
      title: "My HH Goa 2026 Builder ID",
      description: "Ready for the Goa Hacker House! 🌴 #FrameInGoa #HHGoa2026",
      images: [imageUrl],
    },
  };
}

// 2. This is what humans see if they click the shared link
export default function SharePage({
  searchParams,
}: {
  searchParams: { img?: string };
}) {
  const imageUrl = searchParams.img;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="HH Goa 2026 Graphic"
            width={600}
            height={600}
            className="w-full rounded-2xl shadow-2xl"
          />
        ) : (
          <p>No image found.</p>
        )}

        <Link
          href="/"
          className="inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Make your own graphic
        </Link>
      </div>
    </div>
  );
}
