"use client";

/**
 * AnimalListTabs Page - Jaothui ID-Trace System
 *
 * Complete animal list page with infinite scroll integration and mock notifications tab.
 * Uses TopNavigation as conventional navigation and enhanced minimal styling.
 *
 * Features:
 * - TopNavigation integration with notification count and callbacks
 * - TabNavigation between "กระบือปัจจุบัน" and "รายการแจ้งเตือน" tabs
 * - Infinite scroll with Intersection Observer at 1000px trigger distance
 * - Search and filter functionality with pagination reset
 * - AnimalCard components with notification indicators
 * - Mock notifications tab with development placeholder
 * - Enhanced minimal styling following profile page patterns
 * - Mobile-first responsive design (320px minimum width)
 * - Real API integration with /api/animals endpoint
 * - Loading states and error handling
 * - TypeScript with complete type definitions
 *
 * Design Principles:
 * - Enhanced minimal styling: `shadow-none`, clean backgrounds
 * - Background gradient: `bg-gradient-to-br from-background to-secondary/20`
 * - Mobile-first: LINE WebView optimization
 * - Thai language native support
 * - Accessibility: WCAG 2.1 AA compliant
 *
 * @route /animals
 * @component AnimalListTabsPage
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Profile Components Integration
import TopNavigation from "@/components/profile/TopNavigation";
import TabNavigation, { TabType } from "@/components/ui/tab-navigation";
import AnimalCard from "@/components/animals/AnimalCard";
import SearchFilter from "@/components/animals/SearchFilter";

// Types based on Prisma schema
type AnimalType = 'WATER_BUFFALO' | 'SWAMP_BUFFALO' | 'CATTLE' | 'GOAT' | 'PIG' | 'CHICKEN';
type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN';
type AnimalStatus = 'ACTIVE' | 'TRANSFERRED' | 'DECEASED' | 'SOLD';

interface Animal {
  id: string;
  tagId: string;
  name?: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

interface AnimalsApiResponse {
  animals: Animal[];
  nextCursor: string | null;
  hasMore: boolean;
  pendingActivitiesCount: number;
}

/**
 * Mock Notifications Tab Component
 *
 * Placeholder content for the notifications tab as specified in the task.
 * Shows development status with Thai language text.
 */
const MockNotificationsTab = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h3 className="text-xl font-semibold mb-2">กำลังพัฒนา...</h3>
    <p className="text-muted-foreground max-w-sm">
      ฟีเจอร์รายการแจ้งเตือนกำลังอยู่ในระหว่างการพัฒนา
      จะเป็นส่วนแสดงกิจกรรมที่ต้องทำเพื่อดูแลกระบือของคุณ
    </p>
  </div>
);

/**
 * Main AnimalListTabs Page Component
 */
export default function AnimalListTabsPage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  // State management for tabs and animals
  const [activeTab, setActiveTab] = React.useState<TabType>('current');
  const [animals, setAnimals] = React.useState<Animal[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<AnimalStatus | 'all'>('all');
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [animalCount, setAnimalCount] = React.useState(0);
  const [pendingActivitiesCount, setPendingActivitiesCount] = React.useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Intersection Observer ref for infinite scroll
  const observerRef = React.useRef<IntersectionObserver>();

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  /**
   * Load animals from API with cursor pagination
   */
  const loadAnimals = React.useCallback(async (cursor?: string | null, isLoadMore = false) => {
    if (!session?.user?.id) return;

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setApiError(null);
      }

      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/animals?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnimalsApiResponse = await response.json();

      if (isLoadMore) {
        setAnimals(prev => [...prev, ...data.animals]);
      } else {
        setAnimals(data.animals);
        setAnimalCount(data.animals.length);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setPendingActivitiesCount(data.pendingActivitiesCount);
      setInitialLoadComplete(true);

    } catch (error) {
      console.error('Failed to load animals:', error);
      setApiError('เกิดข้อผิดพลาดในการโหลดข้อมูลกระบือ');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [session?.user?.id, searchQuery, statusFilter]);

  /**
   * Load more animals for infinite scroll
   */
  const loadMoreAnimals = React.useCallback(() => {
    if (hasMore && nextCursor && !loading && !loadingMore) {
      loadAnimals(nextCursor, true);
    }
  }, [hasMore, nextCursor, loading, loadingMore, loadAnimals]);

  /**
   * Intersection Observer callback for infinite scroll
   */
  const lastElementRef = React.useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreAnimals();
        }
      },
      {
        rootMargin: '1000px', // Trigger 1000px before element comes into view
        threshold: 0.1
      }
    );
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, loadMoreAnimals]);

  /**
   * Handle search query changes with pagination reset
   */
  const handleSearchChange = React.useCallback((query: string) => {
    setSearchQuery(query);
    setNextCursor(null);
    setHasMore(true);
  }, []);

  /**
   * Handle status filter changes with pagination reset
   */
  const handleStatusChange = React.useCallback((status: AnimalStatus | 'all') => {
    setStatusFilter(status);
    setNextCursor(null);
    setHasMore(true);
  }, []);

  /**
   * Handle clearing all filters
   */
  const handleClearFilters = React.useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setNextCursor(null);
    setHasMore(true);
  }, []);

  /**
   * Handle TopNavigation callbacks
   */
  const handleNotificationClick = React.useCallback(() => {
    setActiveTab('notifications');
  }, []);

  const handleBrandClick = React.useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleLogoClick = React.useCallback(() => {
    // Future: Add logo action (e.g., show about, help, etc.)
    console.log("Logo clicked");
  }, []);

  /**
   * Initial load of animals when user is authenticated
   */
  React.useEffect(() => {
    if (session?.user?.id && !initialLoadComplete) {
      loadAnimals();
    }
  }, [session?.user?.id, loadAnimals, initialLoadComplete]);

  /**
   * Reload animals when search or status filters change
   */
  React.useEffect(() => {
    if (session?.user?.id && initialLoadComplete) {
      loadAnimals();
    }
  }, [searchQuery, statusFilter, session?.user?.id, loadAnimals, initialLoadComplete]);

  /**
   * Loading state while checking authentication
   */
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div
              className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
              aria-label="กำลังโหลด"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                กำลังโหลด...
              </span>
            </div>
            <p className="text-sm text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state for authentication
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-none border-destructive">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-destructive">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-muted-foreground">
                  ไม่สามารถตรวจสอบการเข้าสู่ระบบได้
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                  aria-label="กลับไปหน้าเข้าสู่ระบบ"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * If no session and not loading, return null (redirect will happen via useEffect)
   */
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Top Navigation Bar - Fixed Position */}
      <TopNavigation
        notificationCount={pendingActivitiesCount}
        onNotificationClick={handleNotificationClick}
        onBrandClick={handleBrandClick}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content Area - with top padding for fixed navigation */}
      <div className="pt-20 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              animalCount={animalCount}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'current' ? (
            // Current Animals Tab
            <div className="space-y-6">
              {/* Search and Filter Section */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <SearchFilter
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onClear={handleClearFilters}
                  />
                </div>
              </div>

              {/* Animals List Section */}
              <div className="space-y-4">
                {loading && !initialLoadComplete ? (
                  // Initial loading state
                  <div className="flex justify-center">
                    <Card className="w-full max-w-md shadow-none">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status"
                            aria-label="กำลังโหลด"
                          >
                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                              กำลังโหลด...
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลกระบือ...</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : apiError ? (
                  // Error state
                  <div className="flex justify-center">
                    <Card className="w-full max-w-md shadow-none border-destructive">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <p className="text-sm text-destructive text-center">{apiError}</p>
                          <Button
                            onClick={() => loadAnimals()}
                            variant="outline"
                            className="w-full"
                          >
                            ลองใหม่
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : animals.length === 0 && !loading ? (
                  // Empty state
                  <div className="flex justify-center">
                    <Card className="w-full max-w-md shadow-none">
                      <CardContent className="p-8">
                        <div className="text-center space-y-4">
                          <div className="text-4xl">🐃</div>
                          <h3 className="text-lg font-semibold">ไม่มีข้อมูลกระบือ</h3>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'ไม่พบข้อมูลกระบือที่ตรงตามเงื่อนไขการค้นหา'
                              : 'ยังไม่มีข้อมูลกระบือในฟาร์มของคุณ'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Animals list
                  <div className="space-y-4">
                    {animals.map((animal, index) => (
                      <div key={animal.id}>
                        <div className="flex justify-center">
                          <AnimalCard
                            animal={animal}
                            notificationCount={Math.floor(Math.random() * 3)} // Mock notification count
                            onPress={() => {
                              // Future: Navigate to animal details page
                              console.log('Animal clicked:', animal.tagId);
                            }}
                          />
                        </div>
                        {/* Infinite scroll trigger - add ref to last element */}
                        {index === animals.length - 1 && hasMore && (
                          <div ref={lastElementRef} className="h-1" />
                        )}
                      </div>
                    ))}

                    {/* Loading more indicator */}
                    {loadingMore && (
                      <div className="flex justify-center">
                        <Card className="w-full max-w-md shadow-none">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-center space-x-3">
                              <div
                                className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                role="status"
                                aria-label="กำลังโหลดเพิ่มเติม"
                              >
                                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                                  กำลังโหลด...
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">กำลังโหลดเพิ่มเติม...</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* End of results indicator */}
                    {!hasMore && animals.length > 0 && (
                      <div className="flex justify-center">
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {animals.length > 0 && `แสดงข้อมูลทั้งหมด ${animals.length} ตัว`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Notifications Tab - Mock Content
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-none">
                <CardContent className="p-6">
                  <MockNotificationsTab />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}