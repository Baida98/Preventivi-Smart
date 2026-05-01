import { ShieldCheck, Archive, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";

type Props = {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenArchive: () => void;
  onHome: () => void;
  archiveCount: number;
  archiveTotal?: number;
};

export default function Header({ user, onLogin, onLogout, onOpenArchive, onHome, archiveCount, archiveTotal = 0 }: Props) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onHome}
          className="flex items-center gap-2.5 group"
          aria-label="Torna alla home"
        >
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 ring-1 ring-primary/30 group-hover:bg-primary/25 transition">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-tight text-left">
            <span className="text-[15px] font-bold tracking-tight">
              Preventivi-Smart
            </span>
            <span className="text-[11px] text-muted-foreground -mt-0.5">
              La tua protezione economica
            </span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          {archiveTotal > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">Totale</p>
              <p className="text-sm font-semibold text-primary">
                €{(archiveTotal / 100).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenArchive}
            className="gap-2 border-border/80 bg-card/40 hover-elevate"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden xs:inline">Archivio</span>
            {archiveCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full bg-primary/20 text-primary">
                {archiveCount}
              </span>
            )}
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end leading-none mr-1">
                <span className="text-xs font-semibold truncate max-w-[120px]">{user.displayName || 'Utente'}</span>
                <span className="text-[10px] text-muted-foreground">Premium</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="rounded-full w-9 h-9 border border-border/40 hover:bg-rose-500/10 hover:text-rose-300"
                title="Esci"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogin}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Accedi</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
