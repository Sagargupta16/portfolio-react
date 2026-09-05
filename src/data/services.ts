import type { Service } from "@/types";
import servicesData from "../../data/services.json";

export const getServices = (): Service[] => servicesData as Service[];
