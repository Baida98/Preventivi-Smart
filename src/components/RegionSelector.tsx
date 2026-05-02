import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { REGIONS } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  value: string;
  onChange: (regionId: string) => void;
};

export default function RegionSelector({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return REGIONS;
    const query = searchQuery.toLowerCase();
    return REGIONS.filter((r) =>
      r.label.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedRegion = REGIONS.find((r) => r.id === value);

  const handleSelect = (regionId: string) => {
    onChange(regionId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground tracking-wide">
        Regione
      </Label>

      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full h-11 justify-start px-3 font-normal",
          !value && "text-muted-foreground"
        )}
      >
        {selectedRegion ? (
          <span className="font-medium">{selectedRegion.label}</span>
        ) : (
          "Seleziona la tua regione"
        )}
      </Button>

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b">
              <DrawerTitle>Seleziona una regione</DrawerTitle>
            </DrawerHeader>

            {/* Search Input */}
            <div className="px-4 py-3 border-b sticky top-0 bg-background z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  type="text"
                  placeholder="Cerca regione..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Regions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredRegions.length > 0 ? (
                <div className="divide-y">
                  {filteredRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleSelect(region.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between",
                        value === region.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{region.label}</span>
                      {value === region.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nessuna regione trovata
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="border-t p-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Chiudi
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop Dropdown */
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-w-sm mx-auto rounded-lg">
            <DrawerHeader className="border-b">
              <DrawerTitle>Seleziona una regione</DrawerTitle>
            </DrawerHeader>

            {/* Search Input */}
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  type="text"
                  placeholder="Cerca regione..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Regions List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredRegions.length > 0 ? (
                <div className="divide-y">
                  {filteredRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleSelect(region.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between",
                        value === region.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{region.label}</span>
                      {value === region.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nessuna regione trovata
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="border-t p-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Chiudi
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
