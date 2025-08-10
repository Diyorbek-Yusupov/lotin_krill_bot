import fs from "fs";
import path from "path";
import { Mode } from "./types";

interface UserModeMap {
  [userId: string]: Mode;
}

const storageFile = path.join(__dirname, "../user_modes.json");

let userModes: UserModeMap = {};

// Load data from file on startup
export function loadData() {
  if (fs.existsSync(storageFile)) {
    try {
      const raw = fs.readFileSync(storageFile, "utf-8");
      userModes = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Failed to load storage file", err);
      userModes = {};
    }
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(storageFile, JSON.stringify(userModes, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to save storage file", err);
  }
}

export function getUserMode(userId: number): Mode {
  return userModes[userId] || null;
}

export function setUserMode(userId: number, mode: Mode) {
  userModes[userId] = mode;
  saveData();
}
