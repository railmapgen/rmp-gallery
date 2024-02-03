import { TextEncoder } from 'util';
import { vi } from 'vitest';

const originalFetch = global.fetch;
global.fetch = vi.fn().mockImplementation((...args: any[]) => {
    if (args[0].toString().includes('/info.json')) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => import('../info.json').then(module => module.default),
        }) as any;
    } else {
        return originalFetch(args[0], args[1]);
    }
});

global.TextEncoder = TextEncoder;
