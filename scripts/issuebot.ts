import { existsSync } from 'fs';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { EOL, type } from 'os';
import { stringify, parse } from 'zipson';
import { JSDOM } from 'jsdom';

import { makeImage } from './images.js';

// const file = await readFile('./santiago.zipson', 'utf-8');

// process.env.ISSUE_BODY = `
// Hi RMP team! I would like to contribute the gallery below.

// **Do not edit lines below, they are meant for bots only!!!**

// <details repo="rmp-gallery" compress="zipson" type="real_world" city="santiago" desc="">${file}</details>
// `;

const readIssueBody = async (): Promise<HTMLDetailsElement[]> => {
    execSync(
        `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" /repos/railmapgen/rmp-gallery/issues/${process.env.ISSUE_NUMBER} > issue.json`
    );
    const issue = await readFile('issue.json', 'utf-8');
    const data = JSON.parse(issue);

    const issueBody = data.body;
    // const issueBody = process.env.ISSUE_BODY;
    const dom = new JSDOM(issueBody);
    return Array.from(dom.window.document.querySelectorAll('details[repo="rmp-gallery"]'));
};

const getMetadataFromCity = (
    cityName: string
): {
    contributors: string[];
    // lastUpdateOn: number;
} => {
    const filePath = resolve('..', 'public', 'resources', 'real_world', `${cityName}.json`);
    // const filePath = resolve('..', 'README.md');
    // https://stackoverflow.com/questions/15564185/exec-not-returning-anything-when-trying-to-run-git-shortlog-with-nodejs
    // https://stackoverflow.com/questions/73085141/git-shortlog-in-a-github-workflow-for-a-specific-directory
    const stdout = execSync(`git log | git shortlog -s -e -- ${filePath}`, { encoding: 'utf-8' });
    const contributors = stdout
        .split(EOL)
        .map(line => line.match(/<\d+/)?.at(0))
        .filter(uid => uid !== undefined)
        .map(s => s?.substring(1)) as string[];
    return { contributors };
};

const main = async () => {
    const detailsEls = await readIssueBody();
    if (detailsEls.length !== 1) {
        console.error('There must be only one details element.');
        return 1;
    }
    const paramEl = detailsEls.at(0)!;
    if (paramEl.getAttribute('compress') !== 'zipson') {
        console.error('Data must be compressed by zipson.');
        return 1;
    }
    if (paramEl.getAttribute('type') !== 'real_world') {
        console.error('Data must come from real world.');
        return 1;
    }
    if (paramEl.textContent === null) {
        console.error('textContent must contains data.');
        return 1;
    }
    const data = parse(paramEl.textContent.trim()); // zipson requirement
    const cityName = paramEl.getAttribute('city');
    if (!cityName || cityName === '') {
        console.error('City name must be a non empty string.');
        return 1;
    }

    if (!existsSync(resolve('..', 'public', 'resources'))) await mkdir(resolve('..', 'public', 'resources'));
    if (!existsSync(resolve('..', 'public', 'resources', 'real_world')))
        await mkdir(resolve('..', 'public', 'resources', 'real_world'));
    await writeFile(resolve('..', 'public', 'resources', 'real_world', `${cityName}.json`), JSON.stringify(data), {
        encoding: 'utf-8',
    });

    if (!existsSync(resolve('..', 'public', 'resources', 'thumbnails')))
        await mkdir(resolve('..', 'public', 'resources', 'thumbnails'));
    const image = await makeImage(resolve('..', 'public', 'resources', 'real_world', `${cityName}.json`));
    await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}.png`), image);

    execSync("git config --global user.name 'github-actions[bot]'");
    execSync("git config --global user.email 'github-actions[bot]@users.noreply.github.com'");

    execSync(`git checkout -b bot-${process.env.ISSUE_NUMBER}`);

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(
        `git commit -m "#${process.env.ISSUE_NUMBER} Update ${cityName}.json" ` +
            `--author="${process.env.USER_LOGIN} <${process.env.USER_ID}+${process.env.USER_LOGIN}@users.noreply.github.com>"`
    );

    const cities = await readdir(resolve('..', 'public', 'resources', 'real_world'));
    const citiesWithMetadata = Object.fromEntries(cities.map(cityName => [cityName, getMetadataFromCity(cityName)]));
    await writeFile(resolve('..', 'public', 'resources', 'real_world.json'), JSON.stringify(citiesWithMetadata), {
        encoding: 'utf-8',
    });

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(
        `git commit -m "#${process.env.ISSUE_NUMBER} Update real_world.json" ` +
            `--author="${process.env.USER_LOGIN} <${process.env.USER_ID}+${process.env.USER_LOGIN}@users.noreply.github.com>"`
    );

    execSync(`git push --set-upstream origin bot-${process.env.ISSUE_NUMBER}`);

    return 0;
};

await main();
