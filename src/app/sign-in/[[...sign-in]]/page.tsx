import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";
import { clerkAuthAppearance } from "@/config/clerk-theme";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
