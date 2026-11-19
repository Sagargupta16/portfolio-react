/* Every footer scene is its own lazy chunk: the shell asks for one only when
   the footer nears the viewport, and only the one the visitor picked. */
import type { FooterSceneId, FooterSceneModule } from "./types";

type SceneLoaders = {
   [Id in FooterSceneId]: () => Promise<FooterSceneModule<Id>>;
};

export const FOOTER_SCENES: SceneLoaders = {
   rooftop: () => import("./rooftop"),
   street: () => import("./street"),
   pictionary: () => import("./pictionary"),
   carousel: () => import("./carousel"),
};
