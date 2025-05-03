export interface Site {
  id: string;
  url: string;
}

export interface SiteDto {
  id: string;
}

export interface CreateSiteDto {
  url: string;
}

export interface SiteResponse {
  id: string;
  url: string;
}

export interface ListResponse {
  sites: SiteResponse[];
}
