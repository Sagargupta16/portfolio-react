import { Linkedin, Github, Instagram, Twitter } from "lucide-react";
import type { IconMap } from "@/types";

// Keys are the icon identifiers stored in personal.json/contact.json so that
// the JSON data doesn't need to change when we swap icon libraries.
const ICON_MAP: IconMap = {
   BsLinkedin: Linkedin,
   FaGithub: Github,
   FiInstagram: Instagram,
   SiX: Twitter,
};

export default ICON_MAP;
