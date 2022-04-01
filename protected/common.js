const fs = require("fs");

const filter = [".git", ".script", ".github", ".idea", "protected", "tmp"];

function scan(dir, current, closure) {
    const currentDir = `${current}/${dir}`;
    if (fs.lstatSync(currentDir).isDirectory()) {
        fs.readdirSync(currentDir).forEach(d => scan(d, currentDir, closure));
    }

    const pkg = `${current}/${dir}/package.json`;
    if (fs.existsSync(pkg)) {
        const parts = pkg.split("/");
        let pkgCoord = "";
        for (let i = 1; i < parts.length - 2; i++) {
            pkgCoord += `${parts[i]}.`;
        }
        pkgCoord = pkgCoord.substring(0, pkgCoord.length - 1) + `:${parts[parts.length - 2]}`;
        closure(pkgCoord, pkg);
    }
}

function getAllPackages(closure) {
    fs.readdirSync(".").filter(f => !filter.find(t => t === f)).forEach(d => {
        scan(d, ".", closure);
    });
}

module.exports = getAllPackages;
