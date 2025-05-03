import { APIError, api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import { site } from "~encore/clients";
import type { Site } from "../site/interface";
import { prisma } from "./db";
import { Prisma } from "./generated/prisma";
import { ping } from "./ping";

export const check = api(
  { expose: true, method: "POST", path: "/check/:siteId" },
  async (p: { siteId: string }) => {
    const target = await site.get({ id: p.siteId });
    const { up } = await ping({ url: target.url });

    try {
      await prisma.checks.create({
        data: {
          site: p.siteId,
          up,
        },
      });

      return { up };
    } catch (error) {
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw APIError.internal(error.message);
      }

      throw APIError.aborted((error as Error).message);
    }
  },
);

async function doCheck(site: Site): Promise<{ up: boolean }> {
  const { up } = await ping({ url: site.url });
  await prisma.checks.create({
    data: {
      site: site.id,
      up,
    },
  });

  return { up };
}

export const checkAll = api(
  { expose: true, method: "POST", path: "/check/all" },
  async (): Promise<void> => {
    const { sites } = await site.list();

    await Promise.all(sites.map(doCheck));
  },
);

new CronJob("check/all", {
  title: "Check all sites",
  every: "1h",
  endpoint: checkAll,
});
