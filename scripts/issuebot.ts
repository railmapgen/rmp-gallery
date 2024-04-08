import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { resolve } from 'path';

import { parseDetailsEl, readIssueBody, rebuildTypeJSON } from './common.ts';
import { Metadata, MetadataDetail } from './constants.ts';
import { makeImage, makeThumbnail } from './images.ts';

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

        if (type === 'fantasy') {
            // overwrite previous donation date and expiration date
            metadata.reference = oldMetadata.reference;
            metadata.expireOn = oldMetadata.expireOn;
        }
    }
    updateHistory.push({
        id: parseInt(process.env.USER_ID!),
        issueNumber: parseInt(process.env.ISSUE_NUMBER!),
        reason: metadataDetail.justification,
        time: Date.now(),
    });
    metadata.updateHistory = updateHistory;

    // new template under fantasy type
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
    if (!existsSync(resolve(homedir(), 'Downloads'))) await mkdir(resolve(homedir(), 'Downloads'));
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

    await rebuildTypeJSON(type);

    execSync(`git add ${resolve('..', 'public', 'resources')}`);
    execSync(`git commit --amend --no-edit`);

    return 0;
};

await main();
