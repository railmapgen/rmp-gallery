import { Heading, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { RmgEnvBadge, RmgWindowHeader } from '@railmapgen/rmg-components';
import rmgRuntime from '@railmapgen/rmg-runtime';
import { LanguageCode, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '@railmapgen/rmg-translate';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdHelp, MdTranslate } from 'react-icons/md';

import AboutModal from './about';

export default function WindowHeader() {
    const { t } = useTranslation();

    const environment = rmgRuntime.getEnv();
    const appVersion = rmgRuntime.getAppVersion();

    const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);

    const handleSelectLanguage = (language: LanguageCode) => {
        rmgRuntime.setLanguage(language);
        rmgRuntime.getI18nInstance().changeLanguage(language);
    };

    return (
        <RmgWindowHeader>
            <Heading as="h4" size="md">
                {t('header.about.rmpGallery')}
            </Heading>
            <RmgEnvBadge environment={environment} version={appVersion} />

            <HStack ml="auto">
                <Menu>
                    <MenuButton as={IconButton} icon={<MdTranslate />} variant="ghost" size="sm" />
                    <MenuList>
                        {(['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko'] as LanguageCode[]).map(lang => (
                            <MenuItem key={lang} onClick={() => handleSelectLanguage(lang)}>
                                {LANGUAGE_NAMES[lang][lang]}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
                <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Help"
                    icon={<MdHelp />}
                    onClick={() => setIsAboutModalOpen(true)}
                />
            </HStack>

            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </RmgWindowHeader>
    );
}
