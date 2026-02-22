// tests/setup.js
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/dom";

// ===== DOM Cleanup =====
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// ===== Mock window.location =====
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000/",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// ===== Mock fetch =====
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  }),
);

// ===== Mock AbortController =====
global.AbortController = vi.fn().mockImplementation(() => ({
  signal: { aborted: false },
  abort: vi.fn(),
}));

// ===== Mock localStorage =====
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ===== Mock sessionStorage =====
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
  writable: true,
});

// ===== Utility helpers for tests =====
global.testUtils = {
  /**
   * Wait for next tick
   */
  tick: () => new Promise((resolve) => setTimeout(resolve, 0)),

  /**
   * Wait for specified ms
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create mock EventTarget
   */
  createMockTarget: () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),

  /**
   * Create mock HTMLElement
   */
  createMockElement: (tagName = "div") => {
    const el = document.createElement(tagName);
    el.addEventListener = vi.fn();
    el.removeEventListener = vi.fn();
    el.dispatchEvent = vi.fn();
    return el;
  },
};

// ===== Console suppression for tests =====
if (process.env.CI) {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
}
