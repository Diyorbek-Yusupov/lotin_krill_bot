import { Context, SessionFlavor } from "grammy";

export type Mode = "LATIN_TO_CYRILLIC" | "CYRILLIC_TO_LATIN" | null;

export interface SessionData {
  mode: Mode;
}

export type MyContext = Context & SessionFlavor<SessionData>;
