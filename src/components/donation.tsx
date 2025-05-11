import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOpenInNew, MdOutlineFavoriteBorder } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Events, MetadataDetail } from '../util/constant';
import { Accordion, Anchor, Button, Card, Group, List, Modal, Stack, Text, Title } from '@mantine/core';

export default function Donation() {
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();

    const handleBack = () => navigate('/');
    const handleDonate = () => {
        if (i18n.language === 'zh-Hans') {
            window.open('https://afdian.com/a/rail-map-toolkit', '_blank');
        } else {
            window.open('https://opencollective.com/rail-map-toolkit', '_blank');
        }
    };

    const handleNew = () => {
        rmgRuntime.event(Events.UPLOAD_TEMPLATES, { type: 'fantasy' });
        navigate('/new', {
            state: {
                metadata: {
                    name: { en: '' },
                    desc: { en: '' },
                    reference: '',
                    justification: '',
                    remainingUpdateCount: 0,
                } as MetadataDetail,
                type: 'fantasy',
            },
        });
    };

    return (
        <Modal opened onClose={handleBack} size="xl" title={t('donation.title')}>
            <Stack>
                <Text>{t('donation.content1')}</Text>
                <Text>
                    {t('donation.content2')}
                    <Anchor
                        href={`https://${window.location.hostname}/?app=rmp&searchParams=wenxi`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://{window.location.hostname}/?app=rmp&searchParams=wenxi
                    </Anchor>
                </Text>
                <Group grow>
                    <Card withBorder>
                        <Stack align="center">
                            <Title order={2}>{t('donation.typeA')}</Title>
                            <List>
                                <List.Item icon={<Text>✅</Text>}>{t('donation.uniqueLink')}</List.Item>
                                <List.Item icon={<Text>✅</Text>}>{t('donation.duration')}</List.Item>
                                <List.Item icon={<Text>❌</Text>}>{t('donation.noUpdates')}</List.Item>
                            </List>
                        </Stack>
                        <Button
                            color="blue"
                            onClick={() => handleDonate()}
                            leftSection={<MdOutlineFavoriteBorder />}
                            mt="xs"
                        >
                            {t('donation.donate')}
                        </Button>
                    </Card>
                    <Card withBorder>
                        <Stack align="center">
                            <Title order={2}>{t('donation.typeB')}</Title>
                            <List>
                                <List.Item icon={<Text>✅</Text>}>{t('donation.uniqueLink')}</List.Item>
                                <List.Item icon={<Text>✅</Text>}>{t('donation.duration')}</List.Item>
                                <List.Item icon={<Text>✅</Text>}>{t('donation.unlimitedUpdates')}</List.Item>
                            </List>
                        </Stack>
                        <Button
                            color="blue"
                            onClick={() => handleDonate()}
                            leftSection={<MdOutlineFavoriteBorder />}
                            mt="xs"
                        >
                            {t('donation.donate')}
                        </Button>
                    </Card>
                </Group>
                <Text>{t('donation.content3')}</Text>
                <Text>{t('donation.content4')}</Text>
                <Accordion multiple defaultValue={[i18n.language === 'zh-Hans' ? 'methodCN' : 'methodUS']}>
                    <Accordion.Item value="tnc">
                        <Accordion.Control>{t('donation.termsAndConditions')}</Accordion.Control>
                        <Accordion.Panel>
                            <Text>{t('donation.termsLastUpdatedOn')}</Text>
                            <List withPadding>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <List.Item key={i}>{t(`donation.terms${i + 1}`)}</List.Item>
                                ))}
                            </List>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="methodCN">
                        <Accordion.Control>{t('donation.methodCN')}</Accordion.Control>
                        <Accordion.Panel>
                            <Anchor
                                href="https://afdian.com/a/rail-map-toolkit"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://afdian.com/a/rail-map-toolkit <MdOpenInNew />
                            </Anchor>
                            <List withPadding>
                                <List.Item>{t('donation.methodGithubAccount')}</List.Item>
                                <List.Item>{t('donation.methodAfdianAccount')}</List.Item>
                                <List.Item>{t('donation.methodCNMethod')}</List.Item>
                                <List.Item>{t('donation.methodCNLeaveMessage')}</List.Item>
                                <List.Item>{t('donation.methodMessageContains')}</List.Item>
                            </List>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="methodUS">
                        <Accordion.Control>{t('donation.methodUS')}</Accordion.Control>
                        <Accordion.Panel>
                            <Anchor
                                href="https://opencollective.com/rail-map-toolkit"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://opencollective.com/rail-map-toolkit <MdOpenInNew />
                            </Anchor>
                            <List withPadding>
                                <List.Item>{t('donation.methodGithubAccount')}</List.Item>
                                <List.Item>{t('donation.methodOpenCollectiveAccount')}</List.Item>
                                <List.Item>{t('donation.methodUSMethod')}</List.Item>
                                <List.Item>{t('donation.methodUSLeaveMessage')}</List.Item>
                                <List.Item>{t('donation.methodMessageContains')}</List.Item>
                            </List>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>
            <Group mt="xs">
                <Button ml="auto" onClick={handleNew}>
                    {t('donation.next')}
                </Button>
            </Group>
        </Modal>
    );
}
