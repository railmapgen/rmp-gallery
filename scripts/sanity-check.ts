import * as core from '@actions/core';
import { SerializedGraph } from 'graphology-types';
import pkg from 'graphology';
// @ts-expect-error cjs compatibility
const { MultiDirectedGraph } = pkg;

import { parseDetailsEl, readIssueBody } from './common.js';

const noSimplePathStyle = [
    'single-color',
    'china-railway',
    'bjsubway-single-color',
    'bjsubway-tram',
    'bjsubway-dotted',
    'dual-color',
    'mtr-race-days',
    'mtr-light-rail',
    'mrt-under-constr',
    'mrt-sentosa-express',
    'jr-east-single-color',
    'jr-east-single-color-pattern',
];

export type EdgeAttributes = {
    type: string;
    style: string;
};

export const sanityCheck = async () => {
    const detailsEls = await readIssueBody();
    const { param, type } = parseDetailsEl(detailsEls);

    if (type === 'real_world') {
        const g = MultiDirectedGraph.from(param.graph as SerializedGraph<any, any, EdgeAttributes>);
        g.forEachEdge(
            (
                edge: string,
                attr: EdgeAttributes,
                source: string,
                target: string,
                sourceAttr: any,
                targetAttr: any,
                undirected: boolean
            ) => {
                console.log(edge, attr.type, attr.style);
                if (attr.type === 'simple' && noSimplePathStyle.includes(attr.style)) {
                    core.setOutput(
                        'message',
                        "Your work contains line(s) that utilize the single-color style with a simple line path. To address this, you can modify the line path type to something other than the simple path in _Settings > Procedures > Change all objects' attributes_."
                    );
                    throw new Error(`No simple path for style: ${attr.style}`);
                }
            }
        );
        core.setOutput('message', 'pass');
        console.log('Passed the sanity check!');
    }
};

await sanityCheck();
