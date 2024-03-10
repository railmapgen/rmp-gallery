import { Translation } from '@railmapgen/rmg-translate';
import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { EOL } from 'os';
import { resolve } from 'path';
import { Metadata } from './constants.js';

export const getMetadataFromCity = async (
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
