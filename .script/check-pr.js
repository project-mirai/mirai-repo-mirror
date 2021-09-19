let fs = require('fs');
let config = require('../protected/config')
let actor = process.env.ACTOR;

if (actor === undefined) process.exit(0);

async function main() {
    function inDomain(thiz, target) {
        return thiz === target || thiz.startsWith(target + '.')
    }

    async function fireError(content) {
        let https = require('https');
        let req = https.request({
            host: 'api.github.com',
            port: 443,
            path: `/repos/${process.env.REPO_N}/pulls/${process.env.PR_NUM}/reviews`,
            method: 'POST',
            headers: {
                'User-Agent': 'NodeJs/10',
                'Content-Type': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GH_TOKEN}`
            }
        });
        req.on('error', msg => {
            console.error(msg);
            process.exit(1);
        });
        req.write(JSON.stringify({
            body: content,
            event: 'REQUEST_CHANGES',
        }));
        req.end();
    }

    let nameChanged = fs.readFileSync('tmp/name-changed').toString('utf-8');
    for (const line of nameChanged.split('\n')) {
        if (line[0] === '.') {
            await fireError("Modifying a hidden directory");
            return
        }
        for (let protectedDomain of config.protectedDomains) {
            if (inDomain(line.replace('/', '.'), protectedDomain)) {
                await fireError("Modifying protected domain: " + protectedDomain);
                return
            }
        }
    }
    nameChanged.split('\n').forEach(line => {
        if (line.indexOf('/') === -1) {
            // contains top-level file edit
            process.exit(0)
        }
    });

    for (let file of nameChanged.split('\n')) {
        let dom = file.replace('/', '.');
        for (let domain in config.domainOwners) {
            if (inDomain(dom, domain)) {
                let isAllowed = false;
                for (let allowed of config.domainOwners[domain]) {
                    if (allowed.toLowerCase() === actor.toLowerCase()) {
                        isAllowed = true;
                        break;
                    }
                }
                if (!isAllowed) {
                    return
                }
            }
        }
    }

    await fireError("TODO: Auto-merge")
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
