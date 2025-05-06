import { APIError, api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import { Subscription, Topic } from "encore.dev/pubsub";
import { site } from "~encore/clients";
import type { Site } from "../site/interface";
import { prisma } from "./db";
import { Prisma } from "./generated/prisma";
import { ping } from "./ping";

export interface TransitionEvent {
  site: Site;
  up: boolean;
}

export const TransitionTopic = new Topic<TransitionEvent>("uptime-transition", {
  deliveryGuarantee: "at-least-once",
});

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

  const wasUp = await getPreviousMeasurement(site.id);

  if (wasUp !== up) {
    await TransitionTopic.publish({ site, up });
  }

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

async function getPreviousMeasurement(siteId: string): Promise<boolean> {
  const row = await prisma.checks.findFirst({
    where: { site: siteId },
    orderBy: { checkedAt: "desc" },
  });

  return row?.up ?? false;
}

new CronJob("check/all", {
  title: "Check all sites",
  every: "1h",
  endpoint: checkAll,
});
