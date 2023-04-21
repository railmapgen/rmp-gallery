import { Heading, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { RmgEnvBadge, RmgWindowHeader } from '@railmapgen/rmg-components';
import { LANGUAGE_NAMES, LanguageCode, SUPPORTED_LANGUAGES } from '@railmapgen/rmg-translate';
import rmgRuntime from '@railmapgen/rmg-runtime';
import { MdTranslate } from 'react-icons/md';

export default function WindowHeader() {
    const { t } = useTranslation();

    const environment = rmgRuntime.getEnv();
    const appVersion = rmgRuntime.getAppVersion();

    const handleSelectLanguage = (language: LanguageCode) => {
        rmgRuntime.setLanguage(language);
        rmgRuntime.getI18nInstance().changeLanguage(language);
    };

    return (
        <RmgWindowHeader>
            <Heading as="h4" size="md">
                {t('Seed Project')}
            </Heading>
            <RmgEnvBadge environment={environment} version={appVersion} />

            <HStack ml="auto">
                <Menu>
                    <MenuButton as={IconButton} icon={<MdTranslate />} variant="ghost" size="sm" />
                    <MenuList>
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <MenuItem key={lang} onClick={() => handleSelectLanguage(lang)}>
                                {LANGUAGE_NAMES[lang][lang]}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </HStack>
        </RmgWindowHeader>
    );
}
