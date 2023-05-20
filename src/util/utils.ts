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
