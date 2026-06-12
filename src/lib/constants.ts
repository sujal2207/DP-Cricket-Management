export const CRICKET_CATEGORIES = [
  "Batting",
  "Bowling",
  "All Rounder",
  "Wicket Keeper",
  "Don't Know Cricket But Want To Play",
] as const;

export type CricketCategory = (typeof CRICKET_CATEGORIES)[number];

export const CAPTAINCY_INTEREST = "Interested in Captaincy";

export const CAPACITY_ROLES = [CAPTAINCY_INTEREST] as const;

export type CapacityRole = (typeof CAPACITY_ROLES)[number];

export const REGISTRATION_SOURCES = {
  ADMIN: "Admin Panel",
  PUBLIC: "Public Registration",
} as const;

export type RegistrationSource =
  (typeof REGISTRATION_SOURCES)[keyof typeof REGISTRATION_SOURCES];

export const MAX_CATEGORY_SELECTIONS = 2;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Cricketer Management System";

export const APP_BRAND_NAME = "DP Cricket Tournament";

export const DEVELOPER_NAME = "Sujal Lalajibhai Paghadal";
export const DEVELOPER_COMPANY = "JBS Technology";
export const DEVELOPER_CREDIT_LABEL = "Developed & Maintained by";
export const DEVELOPER_CREDIT = `${DEVELOPER_CREDIT_LABEL} ${DEVELOPER_NAME} (${DEVELOPER_COMPANY})`;

export const PUBLIC_REGISTRATION_PATH = "/dpcricketmanagement/register/form";

export const TOURNAMENT_LOGO_PATH = "/images/dp-cricket-tournament-logo.png";

export const ITEMS_PER_PAGE = 10;

export const PUBLIC_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};
