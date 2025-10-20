import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve } from 'path';
import { homedir } from 'os';
import sharp from 'sharp';

const makeThumbnail = async (image: Buffer): Promise<Buffer> => {
    const img = sharp(image, { limitInputPixels: 2048000000 });
    const metadata = await img.metadata();
    const width = Math.floor((metadata.width! * 2) / 3);
    const height = Math.floor((metadata.height! * 2) / 3);
    const sideLength = Math.min(width, height);
    const left = Math.floor((metadata.width! - sideLength) / 2);
    const top = Math.floor((metadata.height! - sideLength) / 2);
    return await img.extract({ width: sideLength, height: sideLength, left, top }).resize(300, 300).toBuffer();
};

const directory = resolve(homedir(), 'Downloads');
const files = await readdir(directory);
const pngFile = files.find(s => s.endsWith('.png') && !s.includes('@300'));
if (!pngFile) throw new Error('PNG file not found');

const cityName = pngFile.replace('.png', '');
const image = await readFile(resolve(directory, pngFile));
const thumbnail = await makeThumbnail(image);
await writeFile(resolve('..', 'public', 'resources', 'thumbnails', `${cityName}@300.png`), thumbnail);
console.log('Thumbnail generated successfully');
