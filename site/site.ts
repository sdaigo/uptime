import { APIError, api } from "encore.dev/api";
import { prisma } from "./db";
import type {
  CreateSiteDto,
  ListResponse,
  SiteDto,
  SiteResponse,
} from "./interface";

export const add = api<CreateSiteDto, SiteResponse>(
  { expose: true, method: "POST", path: "/site" },
  async ({ url }) => {
    if (!url.startsWith("http:") && !url.startsWith("https:")) {
      url = `https://${url}`;
    }

    const site = await prisma.site.create({
      data: { url },
    });
    return site;
  },
);

export const get = api<SiteDto, SiteResponse>(
  { expose: true, method: "GET", path: "/site/:id" },
  async ({ id }) => {
    const site = await prisma.site.findUnique({
      where: { id },
    });

    if (!site) {
      throw APIError.notFound(`Site: ${id} not found`);
    }

    return site;
  },
);

export const list = api(
  { expose: true, method: "GET", path: "/site" },
  async (): Promise<ListResponse> => {
    const sites = await prisma.site.findMany();
    return { sites };
  },
);

export const del = api<SiteDto, void>(
  { expose: true, method: "DELETE", path: "/site/:id" },
  async ({ id }) => {
    await prisma.site.delete({
      where: { id },
    });
  },
);
