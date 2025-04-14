import "@testing-library/jest-dom";
import { vi } from "vitest";
import axios from "axios";

vi.mock("axios");
export const mockedAxios = axios as jest.Mocked<typeof axios>;
