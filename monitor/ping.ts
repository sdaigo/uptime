// ping API

import { api } from "encore.dev/api";

export interface PingParams {
  url: string;
}

export interface PingResponse {
  up: boolean;
}

const normalizeUrl = (url: string) => {
  if (!url.startsWith("http:") && !url.startsWith("https:")) {
    return `https://${url}`;
  }

  return url;
};

export const ping = api<PingParams, PingResponse>(
  { expose: true, path: "/ping/:url", method: "GET" },
  async ({ url }) => {
    const normalizedUrl = normalizeUrl(url);

    try {
      const resp = await fetch(normalizedUrl);
      const up = resp.status >= 200 && resp.status < 300;
      return { up };
    } catch {
      return { up: false };
    }
  },
);
