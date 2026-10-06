import type { BlackSmileAPI } from "../../preload/index";

declare global {
  interface Window {
    blacksmile: BlackSmileAPI;
  }
}

export {};
