import { Translation } from '@railmapgen/rmg-translate';

export enum Events {
    APP_LOAD = 'APP_LOAD',
    UPLOAD_TEMPLATES = 'UPLOAD_TEMPLATES',
}

export const GITHUB_ISSUE_HEADER = 'Hi RMP team! I would like to contribute to the gallery with the data below.';
export const GITHUB_ISSUE_PREAMBLE = '**Paste or Upload below. They are meant for BOTS ONLY!!!**';

export interface MetadataDetail {
    name: Translation;
    desc: Translation;
    reference: string;
    justification: string;
    earlyBirdIssue?: string;
    personalizedLink?: string;
    /**
     * 0 for no updates, -1 for unlimited updates.
     * Must exists in fantasy works.
     */
    remainingUpdateCount?: number;
}

export interface Metadata {
    name: Translation;
    desc: Translation;
    reference: string;
    /**
     * The unix timestamp of expiration.
     * Must exists in fantasy works.
     */
    expireOn?: number;
    /**
     * 0 for no updates, -1 for unlimited updates.
     * Must exists in fantasy works.
     */
    remainingUpdateCount?: number;
    updateHistory: {
        id: number;
        issueNumber: number;
        reason: string;
        time: number;
    }[];
}

export interface Gallery {
    [cityName: string]: { contributors: string[]; name: Translation; lastUpdateOn: number };
}
