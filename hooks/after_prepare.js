#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

module.exports = function (context) {
    console.log("Running custom after_prepare hook...");

    const platforms = context.opts.platforms;

    platforms.forEach(platform => {
        if (platform === "ios") {
            const iosFolder = path.join(context.opts.projectRoot, "platforms", "ios");

            // Example: Modify Info.plist
            const plistFile = findFileByName(iosFolder, "Info.plist");

            if (plistFile) {
                console.log("Editing Info.plist:", plistFile);

                let plistContent = fs.readFileSync(plistFile, "utf8");

                // Example change: Add a key
                if (!plistContent.includes("NSAllowsArbitraryLoads")) {
                    plistContent = plistContent.replace(
                        /<\/dict>/,
                        `    <key>NSAllowsArbitraryLoads</key>\n    <false/>\n</dict>`
                    );

                    fs.writeFileSync(plistFile, plistContent, "utf8");
                    console.log("Updated Info.plist successfully.");
                }
            }
        }

        if (platform === "android") {
            const manifestPath = path.join(
                context.opts.projectRoot,
                "platforms",
                "android",
                "app",
                "src",
                "main",
                "AndroidManifest.xml"
            );

            if (fs.existsSync(manifestPath)) {
                console.log("Editing AndroidManifest.xml…");

                let manifest = fs.readFileSync(manifestPath, "utf8");

                // Example: ensure android:allowBackup="false"
                if (!manifest.includes(`android:allowBackup="false"`)) {
                    manifest = manifest.replace(
                        /<application/,
                        `<application android:allowBackup="false"`
                    );
                    fs.writeFileSync(manifestPath, manifest, "utf8");
                    console.log("Updated AndroidManifest.xml successfully.");
                }
            }
        }
    });

    function findFileByName(startPath, filter) {
        if (!fs.existsSync(startPath)) return;

        const files = fs.readdirSync(startPath);
        for (let i = 0; i < files.length; i++) {
            const filename = path.join(startPath, files[i]);
            const stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                const result = findFileByName(filename, filter);
                if (result) return result;
            } else if (filename.endsWith(filter)) {
                return filename;
            }
        }
        return null;
    }
};
