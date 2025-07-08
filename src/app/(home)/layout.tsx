import requireOnboarding from "@/shared/utils/onboarding";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding();

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      {children}
    </main>
  );
}
