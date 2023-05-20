import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { EOL } from 'os';
import { resolve } from 'path';

import { JSDOM } from 'jsdom';
import { parse } from 'zipson';
import { Translation } from '@railmapgen/rmg-translate';

import { makeImage, makeThumbnail } from './images.js';
import { Metadata, MetadataDetail } from './constants.js';

const readIssueBody = async (): Promise<HTMLDetailsElement[]> => {
    execSync(
        `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" /repos/railmapgen/rmp-gallery/issues/${process.env.ISSUE_NUMBER} > issue.json`
    );
    const issue = await readFile('issue.json', 'utf-8');
    const data = JSON.parse(issue);
    let issueBody = data.body as string;

    if (issueBody.includes('https://github.com/railmapgen/rmp-gallery/files/')) {
        const bodyURL = issueBody.match(/\(https:\/\/github.com\/railmapgen\/rmp-gallery\/files\/.+\)/)?.at(0);
        if (bodyURL === undefined) throw new Error('The file link must be valid.');
        issueBody = await(await fetch(bodyURL.substring(1, bodyURL.length - 1))).text();
    }

    const dom = new JSDOM(issueBody);
    return Array.from(dom.window.document.querySelectorAll('details[repo="rmp-gallery"]'));
};

const parseDetailsEl = (detailsEls: HTMLDetailsElement[]) => {
    if (detailsEls.length !== 2) {
        throw new Error('There must be only two details elements.');
    }
    const metadataDetailEl = detailsEls.find(el => el.getAttribute('type') === 'metadata');
    if (!metadataDetailEl) {
        throw new Error('Detail element of metadata is required.');
    }
    const metadataDetail = JSON.parse(metadataDetailEl.textContent!.trim()) as MetadataDetail;

    const paramDetailEl = detailsEls.find(el => el.getAttribute('type') === 'real_world');
    if (!paramDetailEl) {
        throw new Error('Detail element of real world data is required.');
    }
    if (paramDetailEl.getAttribute('compress') !== 'zipson') {
        throw new Error('Data must be compressed by zipson.');
    }
    if (paramDetailEl.getAttribute('type') !== 'real_world') {
        throw new Error('Data must come from real world.');
    }
    if (paramDetailEl.textContent === null) {
        throw new Error('textContent must contains data.');
    }
    const param = parse(paramDetailEl.textContent.trim()); // trim to make a valid zipson data
    const cityName = paramDetailEl.getAttribute('city');
    if (!cityName || cityName === '') {
        throw new Error('City name must be a non empty string.');
    }

    return { metadataDetail, param, cityName };
};

const makeMetadataWithUpdateHistory = async (cityName: string, metadataDetail: MetadataDetail) => {
    const { justification, ...metadataWithoutJustification } = metadataDetail;
    const metadata = structuredClone(metadataWithoutJustification) as Metadata;

    const oldMetadataFilePath = resolve('..', 'public', 'resources', 'metadata', `${cityName}.json`);
    const updateHistory: Metadata['updateHistory'] = [];
    if (existsSync(oldMetadataFilePath)) {
        const oldMetadataFile = await readFile(oldMetadataFilePath, { encoding: 'utf-8' });
        const oldMetadata = JSON.parse(oldMetadataFile) as Metadata;
        updateHistory.push(...structuredClone(oldMetadata.updateHistory));
    }
    updateHistory.push({
        id: parseInt(process.env.USER_ID!),
        issueNumber: parseInt(process.env.ISSUE_NUMBER!),
        reason: metadataDetail.justification,
        time: Date.now(),
    });
    metadata.updateHistory = updateHistory;

    return metadata;
};

const getMetadataFromCity = async (
    cityNameWithExtension: string
): Promise<{
    contributors: string[];
    name: Translation;
    lastUpdateOn: number;
}> => {
    const filePath = resolve('..', 'public', 'resources', 'real_world', cityNameWithExtension);
    // https://stackoverflow.com/questions/15564185/exec-not-returning-anything-when-trying-to-run-git-shortlog-with-nodejs
    // https://stackoverflow.com/questions/73085141/git-shortlog-in-a-github-workflow-for-a-specific-directory
    const stdout = execSync(`git log -- ${filePath} | git shortlog -s -e`, { encoding: 'utf-8' });
    const contributors = stdout
        .split(EOL)
        .map(line => line.match(/<\d+/)?.at(0))
        .filter(uid => uid !== undefined)
        .map(s => s?.substring(1)) as string[];

    const metadataString = await readFile(
        resolve('..', 'public', 'resources', 'metadata', cityNameWithExtension),
        'utf-8'
    );
    const metadata = JSON.parse(metadataString) as Metadata;
    const name = metadata.name;
    if (!name) throw new Error('Metadata must contain name.');

    const lastUpdateOn = Math.max(...metadata.updateHistory.map(entry => entry.time));

    return { contributors, name, lastUpdateOn };
};

const main = async () => {
    const detailsEls = await readIssueBody();
    const { metadataDetail, param, cityName } = parseDetailsEl(detailsEls);

    if (!existsSync(resolve('..', 'public', 'resources'))) await mkdir(resolve('..', 'public', 'resources'));
    if (!existsSync(resolve('..', 'public', 'resources', 'real_world')))
        await mkdir(resolve('..', 'public', 'resources', 'real_world'));
    await writeFile(resolve('..', 'public', 'resources', 'real_world', `${cityName}.json`), JSON.stringify(param), {
        encoding: 'utf-8',
    });

    const metadata = await makeMetadataWithUpdateHistory(cityName, metadataDetail);
    if (!existsSync(resolve('..', 'public', 'resources', 'metadata')))
        await mkdir(resolve('..', 'public', 'resources', 'metadata'));
    await writeFile(
        resolve('..', 'public', 'resources', 'metadata', `${cityName}.json`),
        JSON.stringify(metadata, null, 4),
        { encoding: 'utf-8' }
    );

    if (!existsSync(resolve('..', 'public', 'resources', 'thumbnails')))
        await mkdir(resolve('..', 'public', 'resources', 'thumbnails'));
    const image = await makeImage(resolve('..', 'public', 'resources', 'real_world', `${cityName}.json`));
    await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}.png`), image);
    const thumbnail = await makeThumbnail(image);
    await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}@300.png`), thumbnail);

    execSync("git config --global user.name 'github-actions[bot]'");
    execSync("git config --global user.email 'github-actions[bot]@users.noreply.github.com'");

    execSync(`git checkout -b bot-${process.env.ISSUE_NUMBER}`);

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(
        `git commit -m "#${process.env.ISSUE_NUMBER} ${process.env.ISSUE_TITLE}" ` +
            `--author="${process.env.USER_LOGIN} <${process.env.USER_ID}+${process.env.USER_LOGIN}@users.noreply.github.com>"`
    );

    const citiesNameWithExtension = await readdir(resolve('..', 'public', 'resources', 'real_world'));
    const citiesWithMetadata = Object.fromEntries(
        await Promise.all(
            citiesNameWithExtension.map(async cityNameWithExtension => {
                const metadata = await getMetadataFromCity(cityNameWithExtension);
                return [cityNameWithExtension.split('.').at(0)!, metadata];
            })
        )
    );
    await writeFile(
        resolve('..', 'public', 'resources', 'real_world.json'),
        JSON.stringify(citiesWithMetadata, null, 4),
        { encoding: 'utf-8' }
    );

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(`git commit --amend --no-edit`);

    execSync(`git push --set-upstream origin bot-${process.env.ISSUE_NUMBER}`);

    return 0;
};

await main();
