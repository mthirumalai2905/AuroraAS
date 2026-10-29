import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function SignUpPage() {
  return (
    <AuthSplitLayout>
      <Suspense>
        <SignUp fallbackRedirectUrl="/dashboard" />
      </Suspense>
    </AuthSplitLayout>
  );
}
