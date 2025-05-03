import { api } from "encore.dev/api";
import { prisma } from "./db";

interface SiteStatus {
  id: string;
  up: boolean;
  checkedAt: string;
}

interface StatusResponse {
  sites: SiteStatus[];
}

export const status = api(
  { expose: true, method: "GET", path: "/status" },
  async (): Promise<StatusResponse> => {
    const rows = await prisma.checks.findMany({
      distinct: "site",
      orderBy: {
        checkedAt: "desc",
      },
    });

    const results: SiteStatus[] = [];

    for await (const row of rows) {
      results.push({
        id: row.site,
        up: row.up,
        checkedAt: row.checkedAt.toISOString(),
      });
    }

    return { sites: results };
  },
);
