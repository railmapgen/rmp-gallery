import { LANGUAGE_NAMES } from '@railmapgen/rmg-translate';
import realWorld from '../public/resources/real_world.json';
import fantasy from '../public/resources/fantasy.json';

const translationAssertion = (nameObj: any) => {
    expect(typeof nameObj).toBe('object');
    Object.entries(nameObj).forEach(([lang, name]) => {
        expect(lang in LANGUAGE_NAMES).toBeTruthy();
        expect(typeof name).toBe('string');
    });
};

const allCities = Object.keys({ ...realWorld, ...fantasy });

describe('Sanity', () => {
    it('Check if real_world.json and fantasy.json follow type Gallery', () => {
        [realWorld, fantasy].forEach(gallery => {
            Object.entries(gallery).forEach(([cityName, metadata]) => {
                expect(typeof cityName).toBe('string');
                expect(Array.isArray(metadata.contributors)).toBeTruthy();
                metadata.contributors.forEach(contributor => expect(typeof contributor).toBe('string'));
                translationAssertion(metadata.name);
                expect(typeof metadata.lastUpdateOn).toBe('number');
            });
        });
    });

    it.each(allCities)('Metadata file of %s exists and follows type Metadata', async cityName => {
        const { default: metadata } = await import(`../public/resources/metadata/${cityName}.json`);
        translationAssertion(metadata.name);
        translationAssertion(metadata.desc);
        expect(typeof metadata.reference).toBe('string');
        if (metadata.expireOn) {
            expect(typeof metadata.expireOn).toBe('number');
        }
        if (metadata.remainingUpdateCount) {
            expect(typeof metadata.remainingUpdateCount).toBe('number');
        }
        expect(Array.isArray(metadata.updateHistory)).toBeTruthy();
        metadata.updateHistory.forEach((history: any) => {
            expect(typeof history.id).toBe('number');
            expect(typeof history.issueNumber).toBe('number');
            expect(typeof history.reason).toBe('string');
            expect(typeof history.time).toBe('number');
        });
    });
});
