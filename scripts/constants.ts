import { Translation } from '@railmapgen/rmg-translate';

export interface MetadataDetail {
    name: Translation;
    desc: Translation;
    reference: string;
    justification: string;
}

export interface Metadata {
    name: Translation;
    desc: Translation;
    reference: string;
    updateHistory: {
        id: number;
        issueNumber: number;
        reason: string;
        time: number;
    }[];
}
