import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, Stethoscope, Sparkles, LogIn, LogOut, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MedicalProfileSheet } from "@/components/ui/medical-profile-sheet";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AuthModal } from "@/components/auth/AuthModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navLinkKeys = [
  { href: "/", labelKey: "home" },
  { href: "/symptoms", labelKey: "symptoms" },
  { href: "/ai-doctor", labelKey: "aiDoctor" },
  { href: "/ai-analysis", labelKey: "aiAnalysis" },
  { href: "/medicines", labelKey: "medicines" },
  { href: "/hospitals", labelKey: "hospitals" },
  { href: "/about", labelKey: "about" },
  { href: "/feedback", labelKey: "feedback" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full liquid-glass-heavy border-b border-primary/8">
        <div className="container flex h-16 items-center justify-between py-2 gap-2">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-md">
              <Stethoscope className="h-6 w-6" />
              <Heart className="absolute -right-1 -top-1 h-4 w-4 text-primary-foreground animate-pulse-soft" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground leading-tight">
                MedAI<span className="text-gradient">+</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                AI Health Assistant
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 flex-shrink min-w-0">
            {navLinkKeys.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
                  location.pathname === link.href
                    ? "gradient-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/premium">
              <Button variant="ghost" size="icon" className="rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 h-9 w-9" title="Premium">
                <Crown className="h-4 w-4" />
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-1">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="rounded-xl gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="text-xs max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut} className="rounded-xl h-8 w-8">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)} className="rounded-xl gap-1.5">
                <LogIn className="h-4 w-4" />
                {t('login') || 'Sign In'}
              </Button>
            )}
            <MedicalProfileSheet />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <div className="flex lg:hidden items-center gap-2">
            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setAuthOpen(true)} className="rounded-xl h-9 w-9">
                <LogIn className="h-4 w-4" />
              </Button>
            )}
            <MedicalProfileSheet />
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-primary/10 liquid-glass-heavy animate-fade-in">
            <nav className="container py-4 flex flex-col gap-1">
              {navLinkKeys.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300",
                    location.pathname === link.href
                      ? "gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                to="/premium"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3.5 text-sm font-medium rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Premium
              </Link>
            </nav>
          </div>
        )}
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
