import { redirect } from "next/navigation";

export default function GamesLibraryPage() {
  // Redirect to the Steam keys library page
  redirect("/customer/library/steam-keys");
}