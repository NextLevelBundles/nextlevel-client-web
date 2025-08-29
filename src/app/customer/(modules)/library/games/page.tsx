import { redirect } from "next/navigation";

export default function GamesLibraryPage() {
  // Redirect to the existing keys page which handles Steam games
  redirect("/customer/keys");
}