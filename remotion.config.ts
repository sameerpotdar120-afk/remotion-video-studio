import { Config } from "@remotion/cli/config";
import fs from "node:fs";
// On a computer with a GPU, "angle" is fastest. In a cloud container without a GPU, use software WebGL ("swangle")
// and the pre-installed Chromium (Remotion's own browser download is blocked there).
const CLOUD_CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const cloud = fs.existsSync(CLOUD_CHROME);
Config.setChromiumOpenGlRenderer(cloud ? "swangle" : "angle");
if (cloud) Config.setBrowserExecutable(CLOUD_CHROME);
Config.setConcurrency(1);
