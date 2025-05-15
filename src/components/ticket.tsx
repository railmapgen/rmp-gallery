import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRootSelector } from '../redux';
import { GITHUB_ISSUE_HEADER, GITHUB_ISSUE_PREAMBLE, MetadataDetail } from '../util/constant';
import { downloadAs, makeGitHubIssueDetails, readFileAsText } from '../util/utils';
import MultiLangEntryCard from './multi-lang-entry-card';
import { Button, Code, Divider, Group, Modal, NativeSelect, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { RMPage, RMPageBody, RMPageFooter } from '@railmapgen/mantine-components';

export default function Ticket() {
    const {
        state: { metadata: metadataParam, type, id },
    } = useLocation();
    const navigate = useNavigate();
    const { realWorld: realWorldGallery, fantasy: fantasyGallery } = useRootSelector(state => state.app);
    const { t } = useTranslation();

    const handleBack = () => navigate('/');

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

    const [metadata, setMetadata] = React.useState<MetadataDetail>(metadataParam);
    const [param, setParam] = React.useState('');
    const cityName = metadata.name['en']?.replace(/[^A-Za-z0-9]/g, '').toLowerCase() ?? '';
    const newOrUpdate =
        type === 'real_world'
            ? cityName in realWorldGallery
                ? 'Update'
                : 'New'
            : id in fantasyGallery
              ? 'Update'
              : 'New';
    const issueBody = [
        GITHUB_ISSUE_HEADER,
        GITHUB_ISSUE_PREAMBLE,
        makeGitHubIssueDetails('metadata', JSON.stringify(metadata, null, 4), {}),
        makeGitHubIssueDetails(type, param, {
            compress: 'none',
            city: id ?? cityName,
        }),
    ].join('\n\n');
    const manualSearchParams = new URLSearchParams({
        labels: 'resources',
        title: `${type === 'real_world' ? 'Resources' : 'Donation'}: ${newOrUpdate} work of ${cityName}`,
    });

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log('handleFileUpload():: received file', file);

        if (!file) {
            return;
        }

        if (file.type !== 'application/json') {
            alert('Invalid file type!');
            event.target.value = '';
            return;
        }

        try {
            const paramStr = await readFileAsText(file);
            setParam(paramStr);
        } catch (err) {
            alert('Invalid file!');
            event.target.value = '';
        }
    };
    const handleNew = async () => {
        if (textareaRef?.current) {
            textareaRef.current.select();
            await navigator.clipboard.writeText(issueBody);
        }
        window.open('https://github.com/railmapgen/rmp-gallery/issues/new?' + manualSearchParams.toString(), '_blank');
    };
    const handleDownload = () => {
        downloadAs(`${cityName}.txt`, 'application/json', issueBody);
        const fileParam = new URLSearchParams({
            labels: 'resources',
            title: `${type === 'real_world' ? 'Resources' : 'Donation'}: ${newOrUpdate} work of ${cityName}`,
            body: [GITHUB_ISSUE_HEADER, GITHUB_ISSUE_PREAMBLE, ''].join('\n\n'),
        });
        window.open('https://github.com/railmapgen/rmp-gallery/issues/new?' + fileParam.toString(), '_blank');
    };

    const [donationDate, setDonationDate] = React.useState(new Date());
    const [donationChannel, setDonationChannel] = React.useState('');
    React.useEffect(() => {
        if (type === 'fantasy') setMetadata({ ...metadata, reference: `${donationChannel},${donationDate}` });
    }, [donationDate, donationChannel]);
    const fantasyFields = [
        // legacy fields for reference only
        {
            type: 'input',
            label: t('ticket.earlyBirdIssue'),
            placeholder: t('ticket.earlyBirdIssuePlaceHolder'),
            value: metadata.earlyBirdIssue ?? '',
            isDisabled: id !== undefined,
            onChange: (value: string) => setMetadata({ ...metadata, earlyBirdIssue: value }),
            minW: 250,
            hidden: true,
        },
        {
            type: 'input',
            label: t('ticket.personalizedLink'),
            placeholder: t('ticket.personalizedLinkPlaceHolder'),
            // Enforce a valid personalized link.
            validator: (val: string) => /^[a-zA-Z0-9]{5,20}$/.test(val),
            value: id ?? metadata.personalizedLink ?? '',
            isDisabled: id !== undefined,
            onChange: (value: string) => setMetadata({ ...metadata, personalizedLink: value }),
            minW: 250,
            hidden: true,
        },
    ];

    return (
        <RMPage w={{ base: '100%', sm: 600 }} style={{ alignSelf: 'center' }}>
            <RMPageBody direction="column" px="xs" style={{ overflowY: 'auto' }}>
                <TextInput type="file" label={t('ticket.file')} accept=".json" onChange={handleFileUpload} />
                {type === 'real_world' && (
                    <>
                        <TextInput
                            label={t('ticket.link')}
                            placeholder={t('ticket.linkPlaceHolder')}
                            value={metadata.reference}
                            onChange={({ currentTarget: { value } }) =>
                                setMetadata(prevState => ({
                                    ...prevState,
                                    reference: value,
                                }))
                            }
                        />
                        <TextInput
                            label={t('ticket.justification')}
                            placeholder={t('ticket.justificationPlaceHolder')}
                            value={metadata.justification}
                            onChange={({ currentTarget: { value } }) =>
                                setMetadata(prevState => ({
                                    ...prevState,
                                    justification: value,
                                }))
                            }
                            error={
                                !/^[a-zA-Z0-9. -]+$/.test(metadata.justification)
                                    ? 'Non-English characters are not allowed.'
                                    : undefined
                            }
                        />
                    </>
                )}
                {type === 'fantasy' && (
                    <>
                        <Group gap="xs" grow>
                            <TextInput
                                type="date"
                                label={t('ticket.donationDate')}
                                value={donationDate.toJSON().slice(0, 10)}
                                onChange={({ currentTarget: { value } }) => setDonationDate(new Date(value))}
                            />
                            <NativeSelect
                                label={t('ticket.donation')}
                                data={['', 'Open Collective', '爱发电']}
                                value={donationChannel}
                                onChange={({ currentTarget: { value } }) => setDonationChannel(value)}
                                disabled={id !== undefined}
                            />
                        </Group>
                        <Group gap="xs" grow>
                            <NativeSelect
                                label={t('ticket.remainingUpdateCount')}
                                data={[
                                    { value: '0', label: t('donation.noUpdates') },
                                    { value: '-1', label: t('donation.unlimitedUpdates') },
                                ]}
                                value={metadata.remainingUpdateCount}
                                onChange={({ currentTarget: { value } }) =>
                                    setMetadata(prevState => ({
                                        ...prevState,
                                        remainingUpdateCount: Number(value),
                                    }))
                                }
                                disabled={id !== undefined}
                            />
                            <TextInput
                                label={t('ticket.reasonOptional')}
                                placeholder={t('ticket.reasonPlaceHolder')}
                                value={metadata.justification}
                                onChange={({ currentTarget: { value } }) =>
                                    setMetadata(prevState => ({
                                        ...prevState,
                                        justification: value,
                                    }))
                                }
                            />
                        </Group>
                    </>
                )}
                <MultiLangEntryCard
                    label={t('ticket.cityName')}
                    inputType="input"
                    translations={Object.entries(metadata.name)}
                    onUpdate={(lang, name) => setMetadata({ ...metadata, name: { ...metadata.name, [lang]: name } })}
                    onLangSwitch={(prevLang, nextLang) => {
                        const metadataCopy = structuredClone(metadata);
                        metadataCopy.name[nextLang] = metadataCopy.name[prevLang];
                        delete metadataCopy.name[prevLang];
                        setMetadata(metadataCopy);
                    }}
                    onRemove={lang => {
                        const metadataCopy = structuredClone(metadata);
                        delete metadataCopy.name[lang];
                        setMetadata(metadataCopy);
                    }}
                />
                <MultiLangEntryCard
                    label={t('ticket.description')}
                    inputType="textarea"
                    translations={Object.entries(metadata.desc)}
                    onUpdate={(lang, desc) => setMetadata({ ...metadata, desc: { ...metadata.desc, [lang]: desc } })}
                    onLangSwitch={(prevLang, nextLang) => {
                        const metadataCopy = structuredClone(metadata);
                        metadataCopy.desc[nextLang] = metadataCopy.desc[prevLang];
                        delete metadataCopy.desc[prevLang];
                        setMetadata(metadataCopy);
                    }}
                    onRemove={lang => {
                        const metadataCopy = structuredClone(metadata);
                        delete metadataCopy.desc[lang];
                        setMetadata(metadataCopy);
                    }}
                />
            </RMPageBody>

            <Divider />

            <RMPageFooter>
                <Group flex={1} gap="sm">
                    <Button variant="default" onClick={handleBack}>
                        {t('ticket.back')}
                    </Button>

                    <Button
                        ml="auto"
                        disabled={
                            param === '' ||
                            metadata.reference === '' ||
                            (type === 'real_world' &&
                                (metadata.justification === '' || !/^[a-zA-Z0-9. -]+$/.test(metadata.justification))) ||
                            (type === 'fantasy' &&
                                metadata.personalizedLink &&
                                !/^[a-zA-Z0-9]{5,20}$/.test(metadata.personalizedLink)) ||
                            (Object.keys(metadata.desc).length > 0 && !('en' in metadata.desc)) ||
                            cityName === ''
                        }
                        onClick={() => setIsSubmitModalOpen(true)}
                    >
                        {t('ticket.submit')}
                    </Button>
                </Group>
            </RMPageFooter>

            <Modal
                opened={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title={t('ticket.submitTemplate')}
            >
                {issueBody.length < 100 * 100 ? (
                    <>
                        <Text>{t('ticket.instruction')}</Text>
                        <Textarea
                            ref={textareaRef}
                            readOnly
                            defaultValue={issueBody}
                            onClick={({ target }) => (target as HTMLTextAreaElement).select()}
                            mt="xs"
                            autosize
                            maxRows={3}
                        />
                    </>
                ) : (
                    <>
                        <Text>{t('ticket.instructionFile')}</Text>
                        <Text mt="xs">
                            {t('ticket.instructionFileHint1')}
                            <Code>{t('Uploading your files... (1/1)')}</Code>
                            {t('ticket.instructionFileHint2')}
                        </Text>
                    </>
                )}
                <Group gap="sm" pt="xs">
                    {issueBody.length < 100 * 100 ? (
                        <Button ml="auto" onClick={handleNew}>
                            {t('ticket.openIssue')}
                        </Button>
                    ) : (
                        <Button ml="auto" onClick={handleDownload}>
                            {t('ticket.download')}
                        </Button>
                    )}
                </Group>
            </Modal>
        </RMPage>
    );
}
