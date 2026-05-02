import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { REGIONS } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (regionId: string) => void;
};

export default function RegionSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return REGIONS;
    const query = searchQuery.toLowerCase();
    return REGIONS.filter(
      (r) =>
        r.label.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedRegion = REGIONS.find((r) => r.id === value);

  const handleSelect = (regionId: string) => {
    onChange(regionId);
    setIsOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
        Regione
      </Label>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-11 justify-between px-3 font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {selectedRegion ? (
              <span className="font-medium">{selectedRegion.label}</span>
            ) : (
              <span>Seleziona la tua regione</span>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Search */}
          <div className="px-3 py-2.5 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Cerca regione..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[260px] overflow-y-auto overscroll-contain">
            {filteredRegions.length > 0 ? (
              <div className="divide-y divide-border/50">
                {filteredRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleSelect(region.id)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm font-medium transition-colors flex items-center justify-between",
                      value === region.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>{region.label}</span>
                    {value === region.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nessuna regione trovata
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
