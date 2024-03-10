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
                    throw new Error(`No simple path for style: ${attr.style}`);
                }
            }
        );
        console.log('Passed the sanity check!');
    }
};

await sanityCheck();
