import { readFile, readdir, unlink, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { getMetadataFromCity } from './common.js';
import { Metadata } from './constants.js';

const resPath = ['..', 'public', 'resources'];

const rebuildFantasy = async () => {
    const type = 'fantasy';

    const citiesNameWithExtension = await readdir(resolve(...resPath, type));
    const citiesWithMetadata = Object.fromEntries(
        await Promise.all(
            citiesNameWithExtension.map(async cityNameWithExtension => {
                const metadata = await getMetadataFromCity(cityNameWithExtension, type);
                return [cityNameWithExtension.split('.').at(0)!, metadata];
            })
        )
    );
    await writeFile(resolve(...resPath, `${type}.json`), JSON.stringify(citiesWithMetadata, null, 4), {
        encoding: 'utf-8',
    });
};

export const housekeep = async () => {
    const fantasyFile = await readFile(resolve(...resPath, 'fantasy.json'), 'utf-8');
    const fantasy = JSON.parse(fantasyFile) as { [k in string]: any };
    const fantasyIDs = Object.keys(fantasy);
    for (const fantasyID of fantasyIDs) {
        const fantasyMetadataFile = await readFile(resolve(...resPath, 'metadata', `${fantasyID}.json`), 'utf-8');
        const fantasyMetadata = JSON.parse(fantasyMetadataFile) as Metadata;
        const now = Date.now();
        if (fantasyMetadata.expireOn && fantasyMetadata.expireOn < now) {
            console.log(`Removing fantasy work ${fantasyID}. Current: ${now}. Expire on: ${fantasyMetadata.expireOn}`);
            await unlink(resolve(...resPath, 'metadata', `${fantasyID}.json`));
            await unlink(resolve(...resPath, 'fantasy', `${fantasyID}.json`));
            await unlink(resolve(...resPath, 'thumbnails', `${fantasyID}.png`));
            await unlink(resolve(...resPath, 'thumbnails', `${fantasyID}@300.png`));
        }
    }

    await rebuildFantasy();
};

await housekeep();
