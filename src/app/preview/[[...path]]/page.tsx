import { notFound } from "next/navigation";
import { LocalPreview } from "@/components/local-preview";
import { isLocalPreviewEnabled } from "@/lib/local-preview.mjs";

export const dynamic = "force-dynamic";
export default function PreviewPage() {
  if (!isLocalPreviewEnabled()) notFound();
  return <LocalPreview />;
}
