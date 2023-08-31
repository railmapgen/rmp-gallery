import { Translation } from '@railmapgen/rmg-translate';

export interface MetadataDetail {
    name: Translation;
    desc: Translation;
    reference: string;
    justification: string;
    earlyBirdIssue?: string;
    personalizedLink?: string;
}

export interface Metadata {
    name: Translation;
    desc: Translation;
    reference: string;
    expireOn?: number;
    updateHistory: {
        id: number;
        issueNumber: number;
        reason: string;
        time: number;
    }[];
}
