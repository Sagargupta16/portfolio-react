import type { ContactOption, EmailConfig } from "@/types";
import contactData from "../../data/contact.json";

export const getContactOptions = (): ContactOption[] =>
   contactData.contact_options as ContactOption[];
export const getEmailConfig = (): EmailConfig =>
   contactData.email_config as EmailConfig;
