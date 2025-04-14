import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

import { Mock, vi } from "vitest";
import AcceptQuotePage from "./page";
import { useExpiryContext } from "@/context/ExpiryContext";
import { useRequest } from "@/hooks/useRequest";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("@/context/ExpiryContext", () => ({
  useExpiryContext: vi.fn(),
}));

vi.mock("@/hooks/useRequest", () => ({
  useRequest: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("AcceptQuotePage", () => {
  const mockRouterPush = vi.fn();
  const mockSetAccepted = vi.fn();
  const mockSetExpiryDate = vi.fn();
  const mockSetUUID = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as Mock).mockReturnValue({
      push: mockRouterPush,
    });

    (useExpiryContext as Mock).mockReturnValue({
      setExpiryDate: mockSetExpiryDate,
      setUUID: mockSetUUID,
      accepted: false,
      setAccepted: mockSetAccepted,
    });

    (useRequest as Mock).mockReturnValue({
      data: {
        expiryDate: new Date(Date.now() + 60000).toISOString(),
      },
      isLoading: false,
      error: null,
    });

    (useMutation as Mock).mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it("renders the component correctly", async () => {
    await act(async () => {
      render(
        <AcceptQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />
      );
    });

    expect(screen.getByText(/for reference number/i)).toBeInTheDocument();
  });

  it("redirects to PayQuotePage if accepted and expiryDate is valid", async () => {
    (useExpiryContext as Mock).mockReturnValue({
      setExpiryDate: mockSetExpiryDate,
      setUUID: mockSetUUID,
      accepted: true,
      setAccepted: mockSetAccepted,
    });

    await act(async () => {
      render(
        <AcceptQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/payin/test-uuid/pay");
    });
  });

  it("handles paymentSummaryError correctly", async () => {
    (useRequest as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: {},
    });

    await act(async () => {
      render(
        <AcceptQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/error fetching payment summary./i)
      ).toBeInTheDocument();
    });
  });

  it("displays an error message on failed confirmation", async () => {
    const mockMutate = vi.fn((_, { onError } = {}) => onError && onError());

    (useMutation as Mock).mockReturnValue({
      mutate: mockMutate,
    });

    await act(async () => {
      render(
        <AcceptQuotePage params={Promise.resolve({ uuid: "test-uuid" })} />
      );
    });

    // Select BTC from the dropdown
    const currencyDropdown = screen.getByText(/select currency/i);
    fireEvent.click(currencyDropdown);

    const btcOption = screen.getByText(/bitcoin/i);
    fireEvent.click(btcOption);

    // Wait for the /update/summary request to finish
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Ensure PaymentDetails is rendered and confirm button is enabled
    const confirmButton = await screen.findByText(/confirm/i);
    expect(confirmButton).toBeEnabled();

    // Click the confirm button
    fireEvent.click(confirmButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/error confirming payment/i)).toBeInTheDocument();
    });
  });
});
