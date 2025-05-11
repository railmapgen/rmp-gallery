import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineHelpOutline } from 'react-icons/md';

import AboutModal from './about';
import { RMEnvBadge, RMWindowHeader } from '@railmapgen/mantine-components';
import { ActionIcon, Title } from '@mantine/core';

export default function WindowHeader() {
    const { t } = useTranslation();

    const environment = rmgRuntime.getEnv();
    const appVersion = rmgRuntime.getAppVersion();

    const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);

    return (
        <RMWindowHeader>
            <Title>{t('header.about.rmpGallery')}</Title>
            <RMEnvBadge env={environment} ver={appVersion} />

            <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                aria-label="Help"
                title="help"
                onClick={() => setIsAboutModalOpen(true)}
                ml="auto"
            >
                <MdOutlineHelpOutline />
            </ActionIcon>

            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </RMWindowHeader>
    );
}
