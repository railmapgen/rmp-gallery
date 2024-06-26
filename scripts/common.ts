import * as core from '@actions/core';
import { Translation } from '@railmapgen/rmg-translate';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import { existsSync } from 'fs';
import { readFile, readdir, writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import { EOL, homedir } from 'os';
import { resolve } from 'path';
import { parse } from 'zipson';
import { Metadata, MetadataDetail } from './constants';

export const RES_PATH = ['..', 'public', 'resources'];

export const getMetadataFromCity = async (
    cityNameWithExtension: string,
    type: 'real_world' | 'fantasy'
): Promise<{
    contributors: string[];
    name: Translation;
    lastUpdateOn: number;
}> => {
    const filePath = resolve(...RES_PATH, type, cityNameWithExtension);
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

    const metadataString = await readFile(resolve(...RES_PATH, 'metadata', cityNameWithExtension), 'utf-8');
    const metadata = JSON.parse(metadataString) as Metadata;
    const name = metadata.name;
    if (!name) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('Metadata must contain name.');
    }

    const lastUpdateOn = Math.max(...metadata.updateHistory.map(entry => entry.time));

    return { contributors, name, lastUpdateOn };
};

export const rebuildTypeJSON = async (type: 'real_world' | 'fantasy') => {
    const citiesNameWithExtension = await readdir(resolve(...RES_PATH, type));
    const citiesWithMetadata = Object.fromEntries(
        await Promise.all(
            citiesNameWithExtension.map(async cityNameWithExtension => {
                const metadata = await getMetadataFromCity(cityNameWithExtension, type);
                return [cityNameWithExtension.split('.').at(0)!, metadata];
            })
        )
    );
    await writeFile(resolve(...RES_PATH, `${type}.json`), JSON.stringify(citiesWithMetadata, null, 4), {
        encoding: 'utf-8',
    });
};

export const readIssueBody = async (): Promise<HTMLDetailsElement[]> => {
    const issue = await readFile(resolve(homedir(), 'issue.json'), 'utf-8');
    const data = JSON.parse(issue);
    let issueBody = data.body as string;

    if (issueBody.includes('https://github.com/user-attachments/files/')) {
        const bodyURL = issueBody.match(/\(https:\/\/github.com\/user-attachments\/files\/.+\)/)?.at(0);
        if (bodyURL === undefined) {
            core.setOutput(
                'message',
                'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
            );
            throw new Error('The file link must be valid.');
        }
        issueBody = await (await fetch(bodyURL.substring(1, bodyURL.length - 1))).text();
    }

    const dom = new JSDOM(issueBody);
    return Array.from(dom.window.document.querySelectorAll('details[repo="rmp-gallery"]'));
};

export const parseDetailsEl = (detailsEls: HTMLDetailsElement[]) => {
    if (detailsEls.length !== 2) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('There must be only two details elements.');
    }
    const metadataDetailEl = detailsEls.find(el => el.getAttribute('type') === 'metadata');
    if (!metadataDetailEl) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('Detail element of metadata is required.');
    }
    const metadataDetail = JSON.parse(metadataDetailEl.textContent!.trim()) as MetadataDetail;

    const paramDetailEl = detailsEls.find(el => ['real_world', 'fantasy'].includes(el.getAttribute('type') ?? ''));
    if (!paramDetailEl) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('Detail element of real world data is required.');
    }
    const compressMethod = paramDetailEl.getAttribute('compress');
    if (compressMethod !== 'zipson' && compressMethod !== 'none') {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('Data must be compressed by zipson or be raw.');
    }
    if (paramDetailEl.textContent === null) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
        throw new Error('textContent must contains data.');
    }

    const decompress: (s: string) => any = compressMethod === 'zipson' ? parse : (s: string) => JSON.parse(s);
    // trim to make a valid zipson data
    const param = decompress(paramDetailEl.textContent.trim());

    const cityName = paramDetailEl.getAttribute('city');
    if (!cityName || cityName === '') {
        core.setOutput(
            'message',
            'City name is missing. To address this, Enter the appropriate name in the City Name field on the gallery submission page.'
        );
        throw new Error('City name must be a non empty string.');
    }
    const type = paramDetailEl.getAttribute('type') as 'real_world' | 'fantasy';
    if (!type || !(type === 'real_world' || type === 'fantasy')) {
        core.setOutput(
            'message',
            'Remember to follow the gallery guidelines to upload the file generated by the gallery or paste the text into issue content.'
        );
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

        if (!metadataDetail.personalizedLink || !/^[a-zA-Z0-9]{5,20}$/.test(metadataDetail.personalizedLink)) {
            core.setOutput(
                'message',
                'Your personalized link for early bird donation is invalid. You can fill in `a-z` `A-Z` `0-9`.'
            );
            throw new Error('Invalid personalized link for early bird donation.');
        }
        if (existsSync(resolve(...RES_PATH, 'real_world', `${metadataDetail.personalizedLink}.json`))) {
            core.setOutput(
                'message',
                'Your personalized link for early bird donation is duplicated. Please change another one.'
            );
            throw new Error('Duplicated personalized link for early bird donation.');
        }
        if (existsSync(resolve(...RES_PATH, 'fantasy', `${metadataDetail.personalizedLink}.json`))) {
            core.setOutput(
                'message',
                'Your personalized link for early bird donation is duplicated. Please change another one.'
            );
            throw new Error('Duplicated personalized link for early bird donation.');
        }

        return { metadataDetail, param, cityName: metadataDetail.personalizedLink, type };
    }

    return { metadataDetail, param, cityName, type };
};
