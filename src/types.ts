import { Context, SessionFlavor } from "grammy";

export type Mode = "LATIN_TO_CYRILLIC" | "CYRILLIC_TO_LATIN";

interface SessionData {
  mode: Mode | null;
}

export type MyContext = Context & SessionFlavor<SessionData>;
