import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SignIn, SignUp } from "@clerk/react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl liquid-glass-heavy border-primary/10 p-0 overflow-hidden">
        <div className="flex flex-col items-center p-6">
          {mode === "login" ? (
            <SignIn
              appearance={{ elements: { rootBox: "w-full", card: "shadow-none border-0 w-full", footer: "hidden" } }}
              fallbackRedirectUrl="/"
            />
          ) : (
            <SignUp
              appearance={{ elements: { rootBox: "w-full", card: "shadow-none border-0 w-full", footer: "hidden" } }}
              fallbackRedirectUrl="/"
            />
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === "login" ? (t("noAccount") || "Don't have an account?") : (t("hasAccount") || "Already have an account?")}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium hover:underline">
              {mode === "login" ? (t("signup") || "Sign Up") : (t("login") || "Sign In")}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
