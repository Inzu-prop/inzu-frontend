import Container from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <Container className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal preferences for this workspace.
        </p>
      </div>
      <section className="max-w-md rounded-lg border border-border bg-background p-4">
        <h2 className="text-sm font-medium">Appearance</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose between light, dark, or system themes.
        </p>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </section>
    </Container>
  );
}

