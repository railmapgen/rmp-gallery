import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const getLoginsByType = async (type, cachedLogins) => {
    // const data = JSON.parse(await readFile(`${type}.json`, 'utf-8'));
    const data = JSON.parse(await readFile(resolve('..', 'public', 'resources', `${type}.json`), 'utf-8'));
    const ids = new Set(
        Object.values(data)
            .map(_ => _.contributors)
            .flat()
    );
    const jsonType = type === 'real_world' ? 'realWorld' : type; // real_world -> realWorld
    const ret = cachedLogins[jsonType];
    for (const id of ids) {
        if (id in cachedLogins[jsonType]) {
            continue;
        }
        const rep = await (await fetch(`https://api.github.com/user/${id}`)).json();
        ret[id] = rep.login;
        console.log(`login for id: ${id} is ${ret[id]}`);
        await sleep(500);
    }
    return ret;
};

export const makeLogins = async () => {
    const loginPath = resolve('..', 'public', 'resources', 'logins.json');
    const cachedLogins = JSON.parse(await readFile(loginPath, 'utf-8'));

    const logins = {
        realWorld: await getLoginsByType('real_world', cachedLogins),
        fantasy: await getLoginsByType('fantasy', cachedLogins),
    };

    await writeFile(loginPath, JSON.stringify(logins, null, 4), {
        encoding: 'utf-8',
    });
};

await makeLogins();
