let fs = require('fs');
let config = require('../protected/config')
let actor = process.env.ACTOR;

const APPROVE = 'APPROVE';
const COMMENT = 'COMMENT';

if (actor === undefined) process.exit(5);

async function main() {
    console.log("Main called");
    console.log("Conf: ", config);

    function inDomain(thiz, target) {
        thiz = thiz.replace(/\//g, '.');
        console.log("[inDomain] Checking " + thiz + " is in " + target);
        return thiz === target || thiz.startsWith(target + '.')
    }

    async function fireError(content, type) {
        console.log("FIRE ERROR:", content);
        if (type === undefined) {
            type = 'REQUEST_CHANGES';
        }
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
            event: type,
        }));
        req.end();
    }

    let nameChanged = fs.readFileSync('tmp/name-changed').toString('utf-8').trim();
    console.log("Changed list: " + nameChanged);
    for (const line of nameChanged.split('\n')) {
        if (line[0] === '.') {
            await fireError("Modifying a hidden directory");
            return
        }
        for (let protectedDomain of config.protectedDomains) {
            if (inDomain(line, protectedDomain)) {
                await fireError("Modifying protected domain: " + protectedDomain);
                return
            }
        }
    }
    for (const line of nameChanged.split('\n')) {
        if (line.indexOf('/') === -1) {
            // contains top-level file edit
            await fireError("Contains top level file: " + line, COMMENT);
            return;
        }
    }

    let noDomainFiles = [];
    for (let file of nameChanged.split('\n')) {
        let dom = file.replace('/', '.');
        let hasDomain = false;
        for (let domain in config.domainOwners) {
            if (inDomain(dom, domain)) {
                hasDomain = true;
                let isAllowed = false;
                for (let allowed of config.domainOwners[domain]) {
                    if (allowed.toLowerCase() === actor.toLowerCase()) {
                        isAllowed = true;
                        break;
                    }
                }
                if (!isAllowed) {
                    await fireError("Modifying domain " + domain + " but no permission");
                    return
                }
            }
        }
        if (!hasDomain) {
            noDomainFiles.push(file);
        }
    }

    if (noDomainFiles.length !== 0) {
        await fireError("Contains files with no domain: \n\n" + noDomainFiles.join("\n"));
        return
    }

    const commitCount = parseInt(fs.readFileSync("tmp/count").toString('utf-8'));
    await fireError("OK", APPROVE);

    let mergeRequest = require('https').request({
        host: 'api.github.com',
        port: 443,
        path: `/repos/${process.env.REPO_N}/pulls/${process.env.PR_NUM}/merge`,
        method: 'PUT',
        headers: {
            'User-Agent': 'NodeJs/10',
            'Content-Type': 'application/vnd.github.v3+json',
            'Authorization': `token ${process.env.GH_TOKEN}`,
        }
    }, rsp => {
        rsp.on('data', d => {
            process.stdout.write(d);
        });
    });
    let sha = require('child_process').execSync('git rev-parse THE_PR').toString('utf-8').trim();
    console.log("Merge with sha " + sha);
    mergeRequest.write(JSON.stringify({
        sha: sha,
        merge_method: commitCount > 1 ? 'squash' : 'merge',
    }));
    mergeRequest.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
