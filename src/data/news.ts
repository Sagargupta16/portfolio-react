import type { NewsItem } from "@/types";
import newsData from "../../data/news.json";

/** News items, newest first (validate-data enforces the order). */
export const getNews = (): NewsItem[] => newsData as NewsItem[];
