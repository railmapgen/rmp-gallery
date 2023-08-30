import { execSync } from 'child_process';
import * as crypto from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { EOL, homedir } from 'os';
import { resolve } from 'path';

import { Translation } from '@railmapgen/rmg-translate';
import { JSDOM } from 'jsdom';
import { parse } from 'zipson';

import { Metadata, MetadataDetail } from './constants.js';
import { makeImage, makeThumbnail } from './images.js';

const readIssueBody = async (): Promise<HTMLDetailsElement[]> => {
    const issue = await readFile(resolve(homedir(), 'issue.json'), 'utf-8');
    const data = JSON.parse(issue);
    let issueBody = data.body as string;

    if (issueBody.includes('https://github.com/railmapgen/rmp-gallery/files/')) {
        const bodyURL = issueBody.match(/\(https:\/\/github.com\/railmapgen\/rmp-gallery\/files\/.+\)/)?.at(0);
        if (bodyURL === undefined) throw new Error('The file link must be valid.');
        issueBody = await (await fetch(bodyURL.substring(1, bodyURL.length - 1))).text();
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

    const paramDetailEl = detailsEls.find(el => ['real_world', 'fantasy'].includes(el.getAttribute('type') ?? ''));
    if (!paramDetailEl) {
        throw new Error('Detail element of real world data is required.');
    }
    if (paramDetailEl.getAttribute('compress') !== 'zipson') {
        throw new Error('Data must be compressed by zipson.');
    }
    if (paramDetailEl.textContent === null) {
        throw new Error('textContent must contains data.');
    }

    const param = parse(paramDetailEl.textContent.trim()); // trim to make a valid zipson data
    const cityName = paramDetailEl.getAttribute('city');
    if (!cityName || cityName === '') {
        throw new Error('City name must be a non empty string.');
    }
    const type = paramDetailEl.getAttribute('type') as 'real_world' | 'fantasy';
    if (!type || !(type === 'real_world' || type === 'fantasy')) {
        throw new Error('Type must be real_world or fantasy.');
    }

    // additional checks for submitting a new fantasy work for the first time
    if (type === 'fantasy' && process.env.ISSUE_TITLE?.includes('New')) {
        // no early bird donation means no personalized link, thus we use a random name
        if (!metadataDetail.earlyBirdIssue && !metadataDetail.personalizedLink) {
            // https://stackoverflow.com/a/27747377 random string in node
            const id = crypto.randomBytes(4).toString('hex');
            return { metadataDetail, param, cityName: id, type };
        }

        if (!metadataDetail.personalizedLink || !/^[a-zA-Z0-9]{5,20}$/.test(metadataDetail.personalizedLink))
            throw new Error('Invalid personalized link for early bird donation.');
        return { metadataDetail, param, cityName: metadataDetail.personalizedLink, type };
    }

    return { metadataDetail, param, cityName, type };
};

const makeMetadataWithUpdateHistory = async (
    cityName: string,
    metadataDetail: MetadataDetail,
    type: 'real_world' | 'fantasy'
) => {
    const { justification, ...metadataWithoutJustification } = metadataDetail;
    const metadata = structuredClone(metadataWithoutJustification) as Metadata;

    const oldMetadataFilePath = resolve('..', 'public', 'resources', 'metadata', `${cityName}.json`);
    const updateHistory: Metadata['updateHistory'] = [];
    if (existsSync(oldMetadataFilePath)) {
        const oldMetadataFile = await readFile(oldMetadataFilePath, { encoding: 'utf-8' });
        const oldMetadata = JSON.parse(oldMetadataFile) as Metadata;

        if (type === 'fantasy' && oldMetadata.remainingUpdateCount! === 0)
            throw new Error('This work can not be changed.');

        updateHistory.push(...structuredClone(oldMetadata.updateHistory));
    }
    updateHistory.push({
        id: parseInt(process.env.USER_ID!),
        issueNumber: parseInt(process.env.ISSUE_NUMBER!),
        reason: metadataDetail.justification,
        time: Date.now(),
    });
    metadata.updateHistory = updateHistory;

    // New template under fantasy type
    if (type === 'fantasy' && updateHistory.length === 1 && metadata.expireOn === undefined) {
        const now = new Date();
        // extra 4 days in case of delay
        const nextYear = now.setUTCDate(now.getUTCDate() + 366 + 4);
        metadata.expireOn = nextYear;

        if (metadata.remainingUpdateCount !== 0 && metadata.remainingUpdateCount !== -1)
            throw new Error('remainingUpdateCount is invalid.');
    }

    return metadata;
};

const getMetadataFromCity = async (
    cityNameWithExtension: string,
    type: 'real_world' | 'fantasy'
): Promise<{
    contributors: string[];
    name: Translation;
    lastUpdateOn: number;
}> => {
    const filePath = resolve('..', 'public', 'resources', type, cityNameWithExtension);
    // https://stackoverflow.com/questions/15564185/exec-not-returning-anything-when-trying-to-run-git-shortlog-with-nodejs
    // https://stackoverflow.com/questions/73085141/git-shortlog-in-a-github-workflow-for-a-specific-directory
    const stdout = execSync(`git log -- ${filePath} | git shortlog -s -e`, { encoding: 'utf-8' });
    const contributors = [
        ...new Set(
            stdout
                .split(EOL)
                .map(line => line.match(/<\d+/)?.at(0))
                .filter(uid => uid !== undefined)
                .map(s => s?.substring(1))
                .reverse() as string[]
        ),
    ];

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

export const main = async () => {
    const detailsEls = await readIssueBody();
    const { metadataDetail, param, cityName, type } = parseDetailsEl(detailsEls);

    if (!existsSync(resolve('..', 'public', 'resources'))) await mkdir(resolve('..', 'public', 'resources'));
    if (!existsSync(resolve('..', 'public', 'resources', 'real_world')))
        await mkdir(resolve('..', 'public', 'resources', 'real_world'));
    if (!existsSync(resolve('..', 'public', 'resources', 'fantasy')))
        await mkdir(resolve('..', 'public', 'resources', 'fantasy'));
    await writeFile(resolve('..', 'public', 'resources', type, `${cityName}.json`), JSON.stringify(param, null, 4), {
        encoding: 'utf-8',
    });

    const metadata = await makeMetadataWithUpdateHistory(cityName, metadataDetail, type);
    if (!existsSync(resolve('..', 'public', 'resources', 'metadata')))
        await mkdir(resolve('..', 'public', 'resources', 'metadata'));
    await writeFile(
        resolve('..', 'public', 'resources', 'metadata', `${cityName}.json`),
        JSON.stringify(metadata, null, 4),
        { encoding: 'utf-8' }
    );

    if (!existsSync(resolve('..', 'public', 'resources', 'thumbnails')))
        await mkdir(resolve('..', 'public', 'resources', 'thumbnails'));
    const image = await makeImage(resolve('..', 'public', 'resources', type, `${cityName}.json`));
    await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}.png`), image);
    const thumbnail = await makeThumbnail(image);
    await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}@300.png`), thumbnail);

    execSync(`git checkout -b bot-${process.env.ISSUE_NUMBER}`);

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(
        `git commit -m "#${process.env.ISSUE_NUMBER} ${process.env.ISSUE_TITLE}" ` +
            `--author="${process.env.USER_LOGIN} <${process.env.USER_ID}+${process.env.USER_LOGIN}@users.noreply.github.com>"`
    );

    const citiesNameWithExtension = await readdir(resolve('..', 'public', 'resources', type));
    const citiesWithMetadata = Object.fromEntries(
        await Promise.all(
            citiesNameWithExtension.map(async cityNameWithExtension => {
                const metadata = await getMetadataFromCity(cityNameWithExtension, type);
                return [cityNameWithExtension.split('.').at(0)!, metadata];
            })
        )
    );
    await writeFile(resolve('..', 'public', 'resources', `${type}.json`), JSON.stringify(citiesWithMetadata, null, 4), {
        encoding: 'utf-8',
    });

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(`git commit --amend --no-edit`);

    return 0;
};

await main();
