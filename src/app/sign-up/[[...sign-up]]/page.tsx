import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";
import { clerkAuthAppearance } from "@/config/clerk-theme";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}
