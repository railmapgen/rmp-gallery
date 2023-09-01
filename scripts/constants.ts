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