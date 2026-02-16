import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <SignIn />
    </div>
  );
}
