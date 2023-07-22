// https://askubuntu.com/questions/1444962/how-do-i-install-firefox-in-wsl-when-it-requires-snap-but-snap-doesnt-work

import { readdir, readFile } from 'fs/promises';
import { homedir } from 'os';
import { resolve } from 'path';

import { Builder, Browser, By, Capabilities, until } from 'selenium-webdriver';
import sharp from 'sharp';

export const makeImage = async (filePath: string) => {
    const capabilities = new Capabilities();
    capabilities.set('browserName', Browser.FIREFOX);
    capabilities.set('moz:firefoxOptions', { args: ['-headless'] });

    const driver = await new Builder().withCapabilities(capabilities).build();
    await driver.get('https://railmapgen.github.io/rmp/');

    const uploadMenuButtonXPath = '//*[@id="upload_project"]';
    await driver.wait(until.elementLocated(By.xpath(uploadMenuButtonXPath)), 10000);
    await driver.findElement(By.xpath(uploadMenuButtonXPath)).sendKeys(filePath);

    const downloadMenuButtonXPath = '//*[@id="menu-button-download"]';
    await driver.findElement(By.xpath(downloadMenuButtonXPath)).click();

    // https://stackoverflow.com/questions/75168142/how-to-choose-an-option-from-a-non-select-dropdown-menu-in-selenium-python
    const exportImageButtonXPath =
        "//button[contains(@class, 'chakra-menu__menuitem')][starts-with(@id, 'menu-list-download-menuitem-')][3]";
    await driver.findElement(By.xpath(exportImageButtonXPath)).click();

    Promise.all(
        [1, 2].map(i =>
            driver.findElement(By.xpath(`/html/body/div[5]/div[3]/div/section/div/label[${i}]/span[1]`)).click()
        )
    );

    const downloadButtonXPath = '/html/body/div[5]/div[3]/div/section/footer/div/button';
    await driver.findElement(By.xpath(downloadButtonXPath)).click();

    await new Promise(r => setTimeout(r, 2000));
    // await driver.wait(async () => {
    //     const files = await readdir(resolve(homedir(), 'Downloads'));
    //     return files.some(file => file.endsWith('.png'));
    // });

    const files = await readdir(resolve(homedir(), 'Downloads'));
    const filename = files.find(s => s.startsWith('RMP_') && s.endsWith('.png'))!;
    const file = await readFile(resolve(homedir(), 'Downloads', filename));

    await driver.quit();

    return file;
};

export const makeThumbnail = async (image: Buffer) => {
    const img = sharp(image);
    const metadata = await img.metadata();
    const width = Math.floor((metadata.width! * 2) / 3);
    const height = Math.floor((metadata.height! * 2) / 3);
    const left = Math.floor(metadata.width! / 6);
    const top = Math.floor(metadata.height! / 6);
    return await img.extract({ width, height, left, top }).resize(300, 300).toBuffer();
};
