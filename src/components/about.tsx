import classes from './about.module.css';
import rmgRuntime from '@railmapgen/rmg-runtime';
import { useTranslation } from 'react-i18next';
import GithubIcon from '../images/github-mark.svg';
import SlackIcon from '../images/slack-mark.svg';
import { Avatar, Card, Flex, Group, Image, Modal, Stack, Text, Title } from '@mantine/core';
import { RMSection, RMSectionBody, RMSectionHeader } from '@railmapgen/mantine-components';

const AboutModal = (props: { isOpen: boolean; onClose: () => void }) => {
    const { isOpen, onClose } = props;
    const { t } = useTranslation();
    const appVersion = rmgRuntime.getAppVersion();

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={t('header.about.title')}
            size="lg"
            classNames={{ body: classes.body }}
        >
            <Stack align="center">
                <Group>
                    <Image w={128} src="/rmp-gallery/logo192.png" />
                    <Stack gap="sm">
                        <Text size="xl" component="b">
                            {t('header.about.rmpGallery')}
                        </Text>
                        <Text>{appVersion}</Text>
                        <Text size="sm">{t('header.about.railmapgen')}</Text>
                    </Stack>
                </Group>

                <Text size="md">{t('header.about.desc')}</Text>
            </Stack>

            <RMSection>
                <RMSectionHeader>
                    <Title order={2} size="h4">
                        {t('header.about.coreContributors')}
                    </Title>
                </RMSectionHeader>

                <RMSectionBody className={classes['dev-section-body']}>
                    <Card
                        component="a"
                        className={classes['dev-card']}
                        href="https://github.com/thekingofcity"
                        target="_blank"
                        withBorder
                    >
                        <Avatar src="https://github.com/thekingofcity.png" size="lg" />
                        <Flex>
                            <Title order={3}>thekingofcity</Title>
                            <Text span>{t('header.about.content1')}</Text>
                            <Text span>{t('header.about.content2')}</Text>
                        </Flex>
                    </Card>
                </RMSectionBody>
            </RMSection>

            <RMSection>
                <RMSectionHeader>
                    <Title order={2} size="h4">
                        {t('header.about.templateAdministrators')}
                    </Title>
                </RMSectionHeader>
                <RMSectionBody className={classes['dev-section-body']}>
                    {['52PD', 'linchen1965'].map(id => (
                        <Card
                            key={id}
                            component="a"
                            className={classes['dev-card']}
                            href={`https://github.com/${id}`}
                            target="_blank"
                            withBorder
                        >
                            <Avatar src={`https://github.com/${id}.png`} size="lg" />
                            <Flex>
                                <Title order={3}>{id}</Title>
                                <Text span>{t(`header.about.${id}`)}</Text>
                            </Flex>
                        </Card>
                    ))}
                </RMSectionBody>
            </RMSection>

            <RMSection>
                <RMSectionHeader>
                    <Title order={2} size="h4">
                        {t('header.about.contactUs')}
                    </Title>
                </RMSectionHeader>

                <RMSectionBody className={classes['dev-section-body']}>
                    <Card
                        component="a"
                        className={classes['dev-card']}
                        href="https://github.com/railmapgen/rmp-gallery/issues"
                        target="_blank"
                        withBorder
                    >
                        <Avatar src={GithubIcon} size="lg" />
                        <Flex>
                            <Title order={3}>{t('header.about.github')}</Title>
                            <Text span>{t('header.about.githubContent')}</Text>
                        </Flex>
                    </Card>
                    <Card
                        component="a"
                        className={classes['dev-card']}
                        href="https://join.slack.com/t/railmapgenerator/shared_invite/zt-1odhhta3n-DdZF~fnVwo_q0S0RJmgV8A"
                        target="_blank"
                        withBorder
                    >
                        <Avatar src={SlackIcon} size="lg" />
                        <Flex>
                            <Title order={3}>{t('header.about.slack')}</Title>
                            <Text span>{t('header.about.slackContent')}</Text>
                            <Text component="i" span>
                                #rmg, #rmp, #gallery, #random
                            </Text>
                        </Flex>
                    </Card>
                </RMSectionBody>
            </RMSection>
        </Modal>
    );
};

export default AboutModal;
