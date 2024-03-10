import { readFile, unlink } from 'fs/promises';
import { resolve } from 'path';
import { RES_PATH, rebuildTypeJSON } from './common.js';
import { Metadata } from './constants.js';

export const housekeep = async () => {
    const fantasyFile = await readFile(resolve(...RES_PATH, 'fantasy.json'), 'utf-8');
    const fantasy = JSON.parse(fantasyFile) as { [k in string]: any };
    const fantasyIDs = Object.keys(fantasy);
    for (const fantasyID of fantasyIDs) {
        const fantasyMetadataFile = await readFile(resolve(...RES_PATH, 'metadata', `${fantasyID}.json`), 'utf-8');
        const fantasyMetadata = JSON.parse(fantasyMetadataFile) as Metadata;
        const now = Date.now();
        if (fantasyMetadata.expireOn && fantasyMetadata.expireOn < now) {
            console.log(`Removing fantasy work ${fantasyID}. Current: ${now}. Expire on: ${fantasyMetadata.expireOn}`);
            await unlink(resolve(...RES_PATH, 'metadata', `${fantasyID}.json`));
            await unlink(resolve(...RES_PATH, 'fantasy', `${fantasyID}.json`));
            await unlink(resolve(...RES_PATH, 'thumbnails', `${fantasyID}.png`));
            await unlink(resolve(...RES_PATH, 'thumbnails', `${fantasyID}@300.png`));
        }
    }

    await rebuildTypeJSON('fantasy');
};

await housekeep();
