import Container from "@/components/container";

export default function SettingsPage() {
  return (
    <Container className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal preferences for this workspace.
        </p>
      </div>
      {/* Theme is currently locked to light; appearance controls will return later if needed. */}
    </Container>
  );
}

