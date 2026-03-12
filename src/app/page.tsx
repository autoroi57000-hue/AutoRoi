import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";

// Redirect root to default locale
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
