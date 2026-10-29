import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function SignInPage() {
  return (
    <AuthSplitLayout>
      <Suspense>
        <SignIn fallbackRedirectUrl="/dashboard" />
      </Suspense>
    </AuthSplitLayout>
  );
}
