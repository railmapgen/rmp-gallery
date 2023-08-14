import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const getLoginsByType = async type => {
    // const data = JSON.parse(await readFile(`${type}.json`, 'utf-8'));
    const data = JSON.parse(await readFile(resolve('..', 'public', 'resources', `${type}.json`), 'utf-8'));
    const ids = new Set(
        Object.values(data)
            .map(_ => _.contributors)
            .flat()
    );
    const ret = {};
    for (const id of ids) {
        const rep = await (await fetch(`https://api.github.com/user/${id}`)).json();
        ret[id] = rep.login;
        console.log(`login for id: ${id} is ${ret[id]}`);
        await sleep(1000);
    }
    return ret;
};

export const getLogins = async () => {
    const logins = {
        realWorld: await getLoginsByType('real_world'),
        fantasy: await getLoginsByType('fantasy'),
    };

    // await writeFile('logins.json', JSON.stringify(logins, null, 4), {
    //     encoding: 'utf-8',
    // });
    await writeFile(resolve('..', 'public', 'resources', 'logins.json'), JSON.stringify(logins, null, 4), {
        encoding: 'utf-8',
    });
};

await getLogins();
