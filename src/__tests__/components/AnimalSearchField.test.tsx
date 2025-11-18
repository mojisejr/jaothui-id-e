/**
 * AnimalSearchField Component Tests - Jaothui ID-Trace System
 *
 * Comprehensive test suite for AnimalSearchField component.
 *
 * Test Coverage:
 * - Component rendering and UI elements
 * - Search input functionality
 * - Debounced search behavior (300ms delay)
 * - API integration and error handling
 * - Result display and formatting
 * - Result selection and navigation
 * - Keyboard navigation and accessibility
 * - Loading states and error states
 * - Clear search functionality
 * - Click outside behavior
 *
 * @testing-library/react for component testing
 * @testing-library/user-event for user interaction simulation
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import AnimalSearchField from "@/components/animals/AnimalSearchField";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock router push function
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe("AnimalSearchField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  /**
   * Rendering Tests
   */
  describe("Rendering", () => {
    it("should render search input with default placeholder", () => {
      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox", {
        name: /ค้นหารหัสหรือชื่อกระบือ/i,
      });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute(
        "placeholder",
        "ค้นหารหัสหรือชื่อกระบือ..."
      );
    });

    it("should render with custom placeholder", () => {
      render(<AnimalSearchField placeholder="ค้นหากระบือของคุณ" />);

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("placeholder", "ค้นหากระบือของคุณ");
    });

    it("should render search icon", () => {
      render(<AnimalSearchField />);

      // Search icon should be present
      const searchContainer = screen.getByRole("search");
      expect(searchContainer).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <AnimalSearchField className="custom-class" />
      );

      const searchContainer = container.querySelector(".custom-class");
      expect(searchContainer).toBeInTheDocument();
    });
  });

  /**
   * Search Input Tests
   */
  describe("Search Input", () => {
    it("should allow typing in search input", async () => {
      const user = userEvent.setup();
      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      expect(searchInput).toHaveValue("001");
    });

    it("should show clear button when input has value", async () => {
      const user = userEvent.setup();
      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      const clearButton = await screen.findByRole("button", {
        name: /ล้างการค้นหา/i,
      });
      expect(clearButton).toBeInTheDocument();
    });

    it("should clear input when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      const clearButton = await screen.findByRole("button", {
        name: /ล้างการค้นหา/i,
      });
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
    });
  });

  /**
   * Debounced Search Tests
   */
  describe("Debounced Search", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce search with 300ms delay", async () => {
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
        nextCursor: null,
        hasMore: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");

      // Type search query
      await user.type(searchInput, "001");

      // API should not be called immediately
      expect(global.fetch).not.toHaveBeenCalled();

      // Fast-forward time by 300ms
      jest.advanceTimersByTime(300);

      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/animals?search=001")
        );
      });
    });

    it("should cancel previous search when typing continues", async () => {
      const user = userEvent.setup({ delay: null });
      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");

      // Type first character
      await user.type(searchInput, "0");
      jest.advanceTimersByTime(100);

      // Type second character before debounce completes
      await user.type(searchInput, "0");
      jest.advanceTimersByTime(100);

      // Type third character
      await user.type(searchInput, "1");

      // Fast-forward to complete debounce
      jest.advanceTimersByTime(300);

      // API should only be called once with final query
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/animals?search=001")
        );
      });
    });
  });

  /**
   * API Integration Tests
   */
  describe("API Integration", () => {
    it("should fetch animals from API with search query", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(
            "/api/animals?search=001&status=ACTIVE"
          )
        );
      });

      jest.useRealTimers();
    });

    it("should show loading indicator during search", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ animals: [] }),
              });
            }, 1000);
          })
      );

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      // Should show loading indicator
      await waitFor(() => {
        const loadingIndicator = screen.getByLabelText(/กำลังค้นหา/i);
        expect(loadingIndicator).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should handle API errors gracefully", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(
          screen.getByText(/เกิดข้อผิดพลาดในการค้นหา/i)
        ).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  /**
   * Results Display Tests
   */
  describe("Results Display", () => {
    it("should display search results with Thai counter", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            tagId: "002",
            name: "ทองดี",
            type: "SWAMP_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "0");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/พบ 2 ผลลัพธ์/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should display animal with emoji, tag ID, and name", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("001")).toBeInTheDocument();
        expect(screen.getByText("นาเดีย")).toBeInTheDocument();
        expect(screen.getByText("กระบือน้ำ")).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should limit results to maximum 10", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      // Create 15 mock animals
      const mockAnimals = {
        animals: Array.from({ length: 15 }, (_, i) => ({
          id: `${i + 1}`,
          tagId: `00${i + 1}`,
          name: `Animal ${i + 1}`,
          type: "WATER_BUFFALO" as const,
          status: "ACTIVE",
          imageUrl: null,
          createdAt: new Date().toISOString(),
        })),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "00");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        // Should show "(แสดง 10 รายการแรก)" message
        expect(
          screen.getByText(/แสดง 10 รายการแรก/i)
        ).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should show no results message when no animals found", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ animals: [] }),
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "999");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/ไม่พบกระบือที่ค้นหา/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  /**
   * Navigation Tests
   */
  describe("Navigation", () => {
    it("should navigate to animal detail page on result click", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "animal-123",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("001")).toBeInTheDocument();
      });

      const resultButton = screen.getByRole("button", {
        name: /เลือกกระบือ 001/i,
      });
      await user.click(resultButton);

      expect(mockPush).toHaveBeenCalledWith("/animals/animal-123");

      jest.useRealTimers();
    });

    it("should call onResultSelect callback when provided", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const onResultSelect = jest.fn();
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField onResultSelect={onResultSelect} />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("001")).toBeInTheDocument();
      });

      const resultButton = screen.getByRole("button", {
        name: /เลือกกระบือ 001/i,
      });
      await user.click(resultButton);

      expect(onResultSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          tagId: "001",
          name: "นาเดีย",
        })
      );

      jest.useRealTimers();
    });
  });

  /**
   * Accessibility Tests
   */
  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<AnimalSearchField />);

      const searchContainer = screen.getByRole("search");
      expect(searchContainer).toHaveAttribute("aria-label", "ค้นหากระบือ");

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute(
        "aria-label",
        "ค้นหารหัสหรือชื่อกระบือ"
      );
    });

    it("should support keyboard navigation for results", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("001")).toBeInTheDocument();
      });

      const resultButton = screen.getByRole("button", {
        name: /เลือกกระบือ 001/i,
      });

      // Tab to result button
      await user.tab();

      // Press Enter to select
      await user.keyboard("{Enter}");

      expect(mockPush).toHaveBeenCalledWith("/animals/1");

      jest.useRealTimers();
    });

    it("should announce search results with aria-live", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockAnimals = {
        animals: [
          {
            id: "1",
            tagId: "001",
            name: "นาเดีย",
            type: "WATER_BUFFALO",
            status: "ACTIVE",
            imageUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAnimals,
      });

      render(<AnimalSearchField />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        const resultsRegion = screen.getByRole("region");
        expect(resultsRegion).toHaveAttribute("aria-live", "polite");
      });

      jest.useRealTimers();
    });
  });

  /**
   * Callback Tests
   */
  describe("Callbacks", () => {
    it("should call onSearch callback when searching", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const onSearch = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ animals: [] }),
      });

      render(<AnimalSearchField onSearch={onSearch} />);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "001");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("001");
      });

      jest.useRealTimers();
    });
  });
});
