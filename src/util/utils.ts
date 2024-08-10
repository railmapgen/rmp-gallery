import pako from 'pako';

export const readFileAsText = (file: File) => {
    return new Promise((resolve: (text: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsText(file);
    });
};

export const makeGitHubIssueDetails = (
    type: 'metadata' | 'real_world' | 'fantasy',
    data: string,
    attrs: Record<string, string>
): string => {
    if (data !== null) {
        const details = document.createElement('details');
        details.setAttribute('repo', 'rmp-gallery');
        details.setAttribute('type', type);
        Object.entries(attrs).forEach(([key, val]) => {
            details.setAttribute(key, val);
        });
        details.textContent = data;
        return details.outerHTML;
    } else {
        return '';
    }
};

export const downloadAs = (filename: string, type: string, data: any) => {
    const blob = new Blob([data], { type });
    downloadBlobAs(filename, blob);
};

export const downloadBlobAs = (filename: string, blob: Blob) => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

export const compressToBase64 = (input: string): string => {
    const uint8Array = new TextEncoder().encode(input);
    const compressed = pako.deflate(uint8Array);
    return btoa(String.fromCharCode(...new Uint8Array(compressed.buffer)));
};

export const decompressFromBase64 = (base64: string): string => {
    const binaryString = atob(base64);
    const uint8Array = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const decompressed = pako.inflate(uint8Array);
    return new TextDecoder().decode(decompressed);
};
