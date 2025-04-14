import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { vi, Mock } from "vitest";
import PayQuotePage from "./page";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useRequest } from "@/hooks/useRequest";
import { copyToClipboard } from "@/helpers/copy-to-clipboard";

vi.mock("@/context/ExpiryContext", () => ({
  useExpiryContext: vi.fn(),
}));

vi.mock("@/hooks/useRequest", () => ({
  useRequest: vi.fn(),
}));

vi.mock("@/helpers/copy-to-clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

describe("PayQuotePage", () => {
  const mockSetExpiryDate = vi.fn();
  const mockSetUUID = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useExpiryContext as Mock).mockReturnValue({
      setExpiryDate: mockSetExpiryDate,
      setUUID: mockSetUUID,
    });

    (useRequest as Mock).mockReturnValue({
      data: {
        expiryDate: new Date(Date.now() + 60000).toISOString(),
        paidCurrency: {
          amount: 200,
          currency: "BTC",
        },
        address: {
          address: "test-address",
        },
      },
      isLoading: false,
      error: null,
    });
  });

  it("renders the component correctly with payment summary data", async () => {
    await act(async () => {
      render(<PayQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />);
    });

    expect(await screen.findByText(/pay with bitcoin/i)).toBeInTheDocument();
    expect(await screen.findByText(/200 BTC/i)).toBeInTheDocument();
    expect(await screen.findByText(/test-address/i)).toBeInTheDocument();
  });

  it("handles paymentSummaryError correctly", async () => {
    (useRequest as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: {},
    });

    await act(async () => {
      render(<PayQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/error fetching payment summary./i)
      ).toBeInTheDocument();
    });
  });

  it("calls setExpiryDate and setUUID when paymentSummary is not available", async () => {
    (useRequest as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: {},
    });

    await act(async () => {
      render(<PayQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />);
    });

    expect(mockSetExpiryDate).toHaveBeenCalled();
    expect(mockSetUUID).toHaveBeenCalled();
  });

  it("handles copy functionality correctly", async () => {
    await act(async () => {
      render(<PayQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />);
    });

    const copyButton = screen.getAllByText(/copy/i)[1];
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith(
        "test-address",
        expect.any(Function),
        "address"
      );
    });
  });
});
