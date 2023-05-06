import { Translation } from '@railmapgen/rmg-translate';

export enum Events {
    APP_LOAD = 'APP_LOAD',
    UPLOAD_TEMPLATES = 'UPLOAD_TEMPLATES',
}

export const GITHUB_ISSUE_HEADER = 'Hi RMP team! I would like to contribute to the gallery with the data below.';
export const GITHUB_ISSUE_PREAMBLE = '**Do not edit lines below, they are meant for bots only!!!**';

export interface Metadata {
    name: Translation;
    desc: Translation;
    reference: string;
    justification: string;
}

export interface Gallery {
    [cityName: string]: { contributors: string[]; name: Translation };
}
