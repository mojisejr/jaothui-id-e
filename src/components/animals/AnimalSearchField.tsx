"use client";

/**
 * AnimalSearchField Component - Jaothui ID-Trace System
 *
 * Reusable animal search component for profile page with real-time search functionality.
 *
 * Features:
 * - Debounced search with 300ms delay to prevent excessive API calls
 * - Real-time API integration with /api/animals endpoint
 * - Push-down content behavior (NOT overlay) to prevent MenuGrid overlap
 * - Thai language result counter with emoji display
 * - Maximum 10 results display with animal emoji + tag-id + name format
 * - Navigation to animal detail page on result selection
 * - Comprehensive error handling and loading states
 * - Mobile-first responsive design with 44px touch targets
 * - Accessibility compliance (keyboard navigation, ARIA labels)
 *
 * Design Principles:
 * - Mobile-first (375px minimum viewport)
 * - Elderly-friendly (large touch targets, high contrast)
 * - Thai language native interface
 * - Component-based architecture following shadcn/ui patterns
 *
 * @component AnimalSearchField
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { translateAnimalType } from "@/lib/animal-translations";
import { AnimalType } from "@/types/animal";

/**
 * Animal data structure from API
 * Matches the response from GET /api/animals
 */
interface Animal {
  id: string;
  tagId: string;
  name: string | null;
  type: AnimalType;
  status: string;
  imageUrl: string | null;
  createdAt: string;
}

/**
 * AnimalSearchField Props
 */
export interface AnimalSearchFieldProps {
  /** Custom className for styling */
  className?: string;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Optional callback when search is performed */
  onSearch?: (query: string) => void;
  /** Optional callback when result is selected */
  onResultSelect?: (animal: Animal) => void;
}

/**
 * Get animal emoji based on type
 * Returns appropriate emoji for each animal type
 */
const getAnimalEmoji = (type: AnimalType): string => {
  const emojiMap: Record<AnimalType, string> = {
    WATER_BUFFALO: "🐃",
    SWAMP_BUFFALO: "🐃",
    CATTLE: "🐄",
    GOAT: "🐐",
    PIG: "🐷",
    CHICKEN: "🐔",
  };
  return emojiMap[type] || "🐃";
};

/**
 * AnimalSearchField Component
 *
 * @param props - Component props
 * @returns Rendered animal search field with results
 */
export const AnimalSearchField: React.FC<AnimalSearchFieldProps> = ({
  className,
  placeholder = "ค้นหารหัสหรือชื่อกระบือ...",
  onSearch,
  onResultSelect,
}) => {
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Animal[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Refs for managing focus and clicks outside
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Debounced search effect
   * Waits 300ms after user stops typing before making API call
   */
  React.useEffect(() => {
    // Don't search if query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    // Set up debounce timer
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError(null);

        // Call search callback if provided
        if (onSearch) {
          onSearch(searchQuery);
        }

        // Make API request to /api/animals with search parameter
        const response = await fetch(
          `/api/animals?search=${encodeURIComponent(searchQuery)}&status=ACTIVE`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch animals");
        }

        const data = await response.json();

        // Limit results to maximum 10
        const results = (data.animals || []).slice(0, 10);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setError("เกิดข้อผิดพลาดในการค้นหา");
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup timer on unmount or when query changes
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  /**
   * Handle clicks outside search container
   * Closes results when clicking outside
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setError(null);
    inputRef.current?.focus();
  };

  /**
   * Handle result selection
   * Navigates to animal detail page and optionally calls callback
   * Shows loading state during navigation
   */
  const handleResultClick = (animal: Animal) => {
    // Set navigating state
    setIsNavigating(true);

    // Call callback if provided
    if (onResultSelect) {
      onResultSelect(animal);
    }

    // Navigate to animal detail page
    router.push(`/animals/${animal.id}`);

    // Clear search (navigation will unmount component)
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  /**
   * Handle keyboard navigation in results
   */
  const handleResultKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    animal: Animal
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleResultClick(animal);
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className={cn("w-full", className)}
      role="search"
      aria-label="ค้นหากระบือ"
    >
      {/* Search Input Field */}
      <div className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-12 h-12 shadow-none border-border bg-background focus:ring-primary"
            aria-label="ค้นหารหัสหรือชื่อกระบือ"
            aria-describedby={error ? "search-error" : undefined}
            aria-busy={isSearching}
          />
          {(searchQuery || isSearching) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <Loader2
                  className="w-5 h-5 text-muted-foreground animate-spin"
                  aria-label="กำลังค้นหา"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-8 w-8 p-0 hover:bg-accent/50"
                  aria-label="ล้างการค้นหา"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Results - Push-down content (NOT overlay) */}
      {showResults && searchQuery.trim() && (
        <div className="mt-2 w-full" role="region" aria-live="polite">
          <Card className="shadow-md border-border bg-card/95 backdrop-blur-sm">
            <CardContent className="p-3">
              {/* Results Header with Counter */}
              {searchResults.length > 0 && (
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    พบ {searchResults.length} ผลลัพธ์
                  </span>
                  {searchResults.length === 10 && (
                    <span className="text-xs text-muted-foreground italic">
                      (แสดง 10 รายการแรก)
                    </span>
                  )}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div
                  id="search-error"
                  className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* No Results State */}
              {!error && searchResults.length === 0 && !isSearching && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    ไม่พบกระบือที่ค้นหา
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ลองค้นหาด้วยรหัสหรือชื่ออื่น
                  </p>
                </div>
              )}

              {/* Results List */}
              {!error && searchResults.length > 0 && (
                <div className="space-y-1" role="list">
                  {searchResults.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => handleResultClick(animal)}
                      onKeyDown={(e) => handleResultKeyDown(e, animal)}
                      disabled={isNavigating}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      role="listitem"
                      aria-label={`เลือกกระบือ ${animal.tagId}${
                        animal.name ? ` ชื่อ ${animal.name}` : ""
                      }`}
                      aria-busy={isNavigating}
                    >
                      {/* Animal Emoji */}
                      <span
                        className="text-2xl flex-shrink-0"
                        aria-hidden="true"
                      >
                        {getAnimalEmoji(animal.type)}
                      </span>

                      {/* Animal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-foreground">
                            {animal.tagId}
                          </span>
                          {animal.name && (
                            <span className="text-sm text-muted-foreground truncate">
                              {animal.name}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {translateAnimalType(animal.type)}
                        </div>
                      </div>

                      {/* Loading indicator or Arrow */}
                      {isNavigating ? (
                        <Loader2 
                          className="w-5 h-5 text-muted-foreground animate-spin" 
                          aria-hidden="true"
                        />
                      ) : (
                        <div
                          className="text-muted-foreground"
                          aria-hidden="true"
                        >
                          →
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnimalSearchField;
