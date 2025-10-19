// https://askubuntu.com/questions/1444962/how-do-i-install-firefox-in-wsl-when-it-requires-snap-but-snap-doesnt-work

import { readdir, readFile } from 'fs/promises';
import { homedir } from 'os';
import { resolve } from 'path';

import { Browser, Builder, By, Capabilities, until } from 'selenium-webdriver';
import sharp from 'sharp';

export const makeImage = async (filePath: string, svg = false) => {
    const capabilities = new Capabilities();
    capabilities.set('browserName', Browser.FIREFOX);
    // https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions
    capabilities.set('moz:firefoxOptions', {
        args: ['-headless'],
        // increase localStorage size to allow super big saves
        prefs: { 'dom.storage.default_quota': 102400 },
    });

    const driver = await new Builder().withCapabilities(capabilities).build();
    await driver.get('https://railmapgen.github.io/rmp/');

    const uploadMenuButtonXPath = '//*[@id="upload_project"]';
    await driver.wait(until.elementLocated(By.xpath(uploadMenuButtonXPath)), 10000);
    await driver.findElement(By.xpath(uploadMenuButtonXPath)).sendKeys(filePath);

    const confirmButtonXPath = '//*[@id="confirm_overwrite"]';
    await driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 10000);
    await driver.findElement(By.xpath(confirmButtonXPath)).click();

    await new Promise(r => setTimeout(r, 1000)); // wait a second to be fully loaded

    const downloadMenuButtonXPath = '//*[@id="menu-button-download"]';
    await driver.findElement(By.xpath(downloadMenuButtonXPath)).click();

    // https://stackoverflow.com/questions/75168142/how-to-choose-an-option-from-a-non-select-dropdown-menu-in-selenium-python
    const exportImageButtonXPath =
        "//button[contains(@class, 'chakra-menu__menuitem')][starts-with(@id, 'menu-list-download-menuitem-')][3]";
    await driver.findElement(By.xpath(exportImageButtonXPath)).click();

    if (svg) {
        const dropdownXpath = '/html/body/div[7]/div[3]/div/section/div/div[1]/div/div/select';
        await driver.findElement(By.xpath(dropdownXpath)).click();
        const option2Xpath = '/html/body/div[7]/div[3]/div/section/div/div[1]/div/div/select/option[2]';
        await driver.findElement(By.xpath(option2Xpath)).click();
    }

    driver.findElement(By.xpath('/html/body/div[7]/div[3]/div/section/div/div[3]/label/span[2]')).click();
    driver.findElement(By.xpath('/html/body/div[7]/div[3]/div/section/div/label[2]/span[1]')).click();

    const downloadButtonXPath = '//*[@id="download_button"]';
    await driver.findElement(By.xpath(downloadButtonXPath)).click();

    let retry = 0;
    while (retry < 3) {
        retry += 1;
        await new Promise(r => setTimeout(r, svg ? 5000 : 20000));
        const files = await readdir(resolve(homedir(), 'Downloads'));
        const filename = files.find(s => s.startsWith('RMP_') && s.endsWith(svg ? '.svg' : '.png'));
        if (!filename) continue;

        await driver.quit();
        const file = await readFile(resolve(homedir(), 'Downloads', filename));
        return file;
    }

    throw new Error('No image generated after 60 secs.');
};

export const makeThumbnail = async (image: Buffer) => {
    const img = sharp(image, { limitInputPixels: 1024000000 });
    const metadata = await img.metadata();
    const width = Math.floor((metadata.width! * 2) / 3);
    const height = Math.floor((metadata.height! * 2) / 3);
    const sideLength = Math.min(width, height);
    const left = Math.floor((metadata.width! - sideLength) / 2);
    const top = Math.floor((metadata.height! - sideLength) / 2);
    return await img.extract({ width: sideLength, height: sideLength, left, top }).resize(300, 300).toBuffer();
};
