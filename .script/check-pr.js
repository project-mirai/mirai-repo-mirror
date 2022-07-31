let fs = require('fs');
let config = require('../protected/config')
const https = require("https");
let actor = process.env.ACTOR;

const APPROVE = 'APPROVE';
const COMMENT = 'COMMENT';

if (actor === undefined) process.exit(5);

async function main() {
    console.log("Main called");
    console.log("Conf: ", config);

    const RW_TOKEN = (() => {
        let token = process.env.RW_TOKEN;
        if (token !== undefined && token.length > 0) {
            return token;
        }
        return process.env.GH_TOKEN;
    })();

    let all_failures = [];

    function inDomain(thiz, target) {
        thiz = thiz.replace(/\//g, '.');
        console.log("[inDomain] Checking " + thiz + " is in " + target);
        return thiz === target || thiz.startsWith(target + '.')
    }

    function fireError(content, type) {
        console.log("FIRE ERROR:", content);
        if (type === undefined) {
            type = 'REQUEST_CHANGES';
        }
        let https = require('https');
        return new Promise((resolve, reject) => {
            let req = https.request({
                host: 'api.github.com',
                port: 443,
                path: `/repos/${process.env.REPO_N}/pulls/${process.env.PR_NUM}/reviews`,
                method: 'POST',
                headers: {
                    'User-Agent': 'NodeJs/10',
                    'Content-Type': 'application/vnd.github.v3+json',
                    'Authorization': `token ${RW_TOKEN}`
                }
            }, res => {
                if (res.statusCode !== 200) {
                    res.on('data', buf => {
                        process.stderr.write(buf);
                    });
                }
            });
            req.on('close', resolve);
            req.on('error', msg => {
                console.error(msg);
                process.exit(1);
            });
            req.write(JSON.stringify({
                body: content,
                event: type,
            }));
            req.end();
        });
    }

    let nameChanged = fs.readFileSync('tmp/name-changed').toString('utf-8').trim();
    console.log("Changed list: " + nameChanged);
    for (const line of nameChanged.split('\n')) {
        if (line[0] === '.') {
            all_failures.push("Modified a entry starts with '.': `" + line + "`")
        }
        if (line.indexOf('/') === -1) {
            // contains top-level file edit
            all_failures.push("Modified top-level file: `" + line + '`');
        }
        for (let protectedDomain of config.protectedDomains) {
            if (inDomain(line, protectedDomain)) {
                all_failures.push("Protected domain: `" + protectedDomain + '`: `' + line + '`');
            }
        }
    }
    let noDomainFiles = [];
    for (let file of nameChanged.split('\n')) {
        let dom = file.replace('/', '.');
        let hasDomain = false;
        let passed = false;
        let matchedDomain = '';
        for (let domain in config.domainOwners) {
            if (inDomain(dom, domain)) {
                hasDomain = true;
                if (domain.length > matchedDomain.length) {
                    matchedDomain = domain
                }
                for (let allowed of config.domainOwners[domain]) {
                    if (allowed.toLowerCase() === actor.toLowerCase()) {
                        passed = true;
                        break;
                    }
                }
            }
        }
        if (!hasDomain) {
            noDomainFiles.push(file);
        } else if (!passed) {
            all_failures.push("No permission to modify domain `" + matchedDomain + '`: `' + file + '`')
        }
    }

    if (noDomainFiles.length !== 0) {
        all_failures.push("Modifying dummy files:\n\n- `" + noDomainFiles.join("`\n- `") + '`')
    }

    // noinspection EqualityComparisonWithCoercionJS
    if (all_failures.length != 0) {
        console.log(all_failures);

        await fireError(""
            + "Automatic checking failed:\n\n" + all_failures.join("\n\n") + "\n\n ---------------\n\n"
            + "当一切无误后，请将此 PR 转为 `Draft` 再标记回 `Ready for review`\n\n"
            + "> 将 PR 标记为 Draft 的方法: PR 页右上角有一方 `Convert to draft`"
        )
        // https://api.github.com/repos/OWNER/REPO/pulls/PULL_NUMBER/requested_reviewers


        let requestReviewRequest = require('https').request({
            host: 'api.github.com',
            port: 443,
            path: `/repos/${process.env.REPO_N}/pulls/${process.env.PR_NUM}/requested_reviewers`,
            method: 'POST',
            headers: {
                'User-Agent': 'NodeJs/10',
                'Content-Type': 'application/vnd.github.v3+json',
                'Authorization': `token ${RW_TOKEN}`,
            }
        }, rsp => {
            rsp.on('data', d => {
                process.stdout.write(d);
            });
        });
        requestReviewRequest.write(JSON.stringify({
            // "reviewers": ["octocat", "hubot", "other_user"],
            "team_reviewers": ["mirai-repo-review"]
        }));
        requestReviewRequest.end();
        return
    }

    const commitCount = parseInt(fs.readFileSync("tmp/count").toString('utf-8'));
    await fireError("OK", APPROVE);

    let doSquash = commitCount !== 1;
    let method = doSquash ? 'squash' : 'merge';
    if (!doSquash) {
        let childProcess = require('child_process');
        childProcess.spawnSync(
            'git',
            ['remote', 'add', 'token',
                'https://x-access-token:' + RW_TOKEN + '@github.com/' + process.env.REPO_N + '.git'
            ],
            {stdio: 'inherit'}
        );
        childProcess.spawnSync(
            'git',
            ['config', '--local', '--unset', 'http.https://github.com/.extraheader'],
            {stdio: 'inherit'}
        );
        let proc = childProcess.spawnSync(
            'git',
            ['push', 'token', 'THE_PR:master'],
            {stdio: 'inherit'}
        );
        if (proc.status === 0) {
            method = 'rebase';
        }
    }

    let mergeRequest = require('https').request({
        host: 'api.github.com',
        port: 443,
        path: `/repos/${process.env.REPO_N}/pulls/${process.env.PR_NUM}/merge`,
        method: 'PUT',
        headers: {
            'User-Agent': 'NodeJs/10',
            'Content-Type': 'application/vnd.github.v3+json',
            'Authorization': `token ${RW_TOKEN}`,
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
        merge_method: method,
    }));
    mergeRequest.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
