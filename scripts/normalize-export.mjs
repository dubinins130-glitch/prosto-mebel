import { copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";

// Next's static export on Windows can write nested RSC segments while its
// client asks for a dotted filename. Keep both paths in the generated export.
async function copySegments(routeDirectory, sourceDirectory, prefix) {
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const source = join(sourceDirectory, entry.name);
    const flat = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await copySegments(routeDirectory, source, flat);
    else if (entry.isFile() && entry.name.endsWith(".txt")) await copyFile(source, join(routeDirectory, flat));
  }
}

async function repairRoutes(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const path = join(directory, entry.name);
    if (entry.name.startsWith("__next.")) await copySegments(directory, path, entry.name);
    else await repairRoutes(path);
  }
}

if (process.platform === "win32") await repairRoutes("out");
