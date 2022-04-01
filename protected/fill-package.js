const fs = require("fs");
const getAllPackages = require(__dirname + "/common");

const props = ["name", "description", "website"];

const index = JSON.parse(fs.readFileSync("packages.json").toString());

getAllPackages((coord, pkg) => {
    const pkgIndex = JSON.parse(fs.readFileSync(pkg).toString());
    for (let prop of props) {
        if (index[coord] && index[coord][prop]) {
            pkgIndex[prop] = index[coord][prop];
        }
    }
    fs.writeFileSync(pkg, JSON.stringify(pkgIndex, null, 2));
});
