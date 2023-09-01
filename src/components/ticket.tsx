import {
    Button,
    Code,
    Divider,
    Flex,
    HStack,
    Input,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SystemStyleObject,
    Text,
    UnorderedList,
} from '@chakra-ui/react';
import { RmgDebouncedTextarea, RmgFields, RmgFieldsField, RmgLabel, RmgPage } from '@railmapgen/rmg-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { stringify } from 'zipson';

import { useRootSelector } from '../redux';
import { GITHUB_ISSUE_HEADER, GITHUB_ISSUE_PREAMBLE, MetadataDetail } from '../util/constant';
import { downloadAs, makeGitHubIssueDetails, readFileAsText } from '../util/utils';
import MultiLangEntryCard from './multi-lang-entry-card';

const styles: SystemStyleObject = {
    px: 2,
    pt: 2,
    width: { base: '100%', md: 520 },

    '& > div:first-of-type': {
        flexDirection: 'column',
        flex: 1,
        overflowY: 'auto',
    },

    '& > div:nth-of-type(2)': {
        my: 2,
    },
};

export default function Ticket() {
    const {
        state: { metadata: metadataParam, type, id },
    } = useLocation();
    const navigate = useNavigate();
    const gallery = useRootSelector(state => state.app.realWorld);
    const { t } = useTranslation();

    const handleBack = () => navigate('/');

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

    const [metadata, setMetadata] = React.useState<MetadataDetail>(metadataParam);
    const [param, setParam] = React.useState('');
    const cityName = metadata.name['en']?.replace(/[^A-Za-z0-9]/g, '').toLowerCase() ?? '';
    const issueBody = [
        GITHUB_ISSUE_HEADER,
        GITHUB_ISSUE_PREAMBLE,
        makeGitHubIssueDetails('metadata', JSON.stringify(metadata, null, 4), {}),
        makeGitHubIssueDetails(type, param, {
            compress: 'zipson',
            city: id ?? cityName,
        }),
    ].join('\n\n');
    const manualSearchParams = new URLSearchParams({
        labels: 'resources',
        title: `${type === 'real_world' ? 'Resources' : 'Donation'}: ${
            cityName in gallery ? 'Update' : 'New'
        } template of ${cityName}`,
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
            setParam(stringify(JSON.parse(paramStr.trim())).trim());
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
            title: `${type === 'real_world' ? 'Resources' : 'Donation'}: ${
                cityName in gallery ? 'Update' : 'New'
            } template of ${cityName}`,
            body: [GITHUB_ISSUE_HEADER, GITHUB_ISSUE_PREAMBLE, ''].join('\n\n'),
        });
        window.open('https://github.com/railmapgen/rmp-gallery/issues/new?' + fileParam.toString(), '_blank');
    };

    const fileField: RmgFieldsField[] = [
        {
            type: 'custom',
            label: t('ticket.file'),
            component: <Input variant="flushed" size="xs" type="file" accept=".json" onChange={handleFileUpload} />,
            minW: 250,
        },
    ];
    const realWorldFields: RmgFieldsField[] = [
        {
            type: 'input',
            label: t('ticket.link'),
            placeholder: t('ticket.linkPlaceHolder'),
            value: metadata.reference,
            onChange: value => setMetadata({ ...metadata, reference: value }),
            minW: 250,
        },
        {
            type: 'input',
            label: t('ticket.justification'),
            placeholder: t('ticket.justificationPlaceHolder'),
            // Enforce a pure English update history.
            validator: val => /^[a-zA-Z0-9. -]+$/.test(val),
            value: metadata.justification,
            onChange: value => setMetadata({ ...metadata, justification: value }),
            minW: 250,
        },
    ];
    const fantasyFields: RmgFieldsField[] = [
        {
            type: 'input',
            label: t('ticket.donation'),
            placeholder: t('ticket.donationPlaceHolder'),
            value: metadata.reference,
            onChange: value => setMetadata({ ...metadata, reference: value }),
            minW: 250,
        },
        {
            type: 'input',
            label: t('ticket.reasonOptional'),
            placeholder: t('ticket.reasonPlaceHolder'),
            value: metadata.justification,
            onChange: value => setMetadata({ ...metadata, justification: value }),
            minW: 250,
        },
        {
            type: 'input',
            label: t('ticket.earlyBirdIssue'),
            placeholder: t('ticket.earlyBirdIssuePlaceHolder'),
            value: metadata.earlyBirdIssue ?? '',
            isDisabled: id !== undefined,
            onChange: value => setMetadata({ ...metadata, earlyBirdIssue: value }),
            minW: 250,
        },
        {
            type: 'input',
            label: t('ticket.personalizedLink'),
            placeholder: t('ticket.personalizedLinkPlaceHolder'),
            // Enforce a valid personalized link.
            validator: val => /^[a-zA-Z0-9]{6,20}$/.test(val),
            value: id ?? metadata.personalizedLink ?? '',
            isDisabled: id !== undefined,
            onChange: value => setMetadata({ ...metadata, personalizedLink: value }),
            minW: 250,
        },
    ];

    return (
        <RmgPage sx={styles}>
            <Flex>
                <RmgFields fields={fileField} />
                {type === 'real_world' && <RmgFields fields={realWorldFields} />}
                {type === 'fantasy' && (
                    <>
                        <Text>{t('ticket.donationInfo')}</Text>
                        <UnorderedList>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <ListItem key={i}>{t(`ticket.donationInfo${i + 1}`)}</ListItem>
                            ))}
                        </UnorderedList>
                    </>
                )}
                {type === 'fantasy' && <RmgFields fields={fantasyFields} />}
                <RmgLabel label={t('ticket.cityName')}>
                    <MultiLangEntryCard
                        inputType="input"
                        translations={Object.entries(metadata.name)}
                        onUpdate={(lang, name) =>
                            setMetadata({ ...metadata, name: { ...metadata.name, [lang]: name } })
                        }
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
                </RmgLabel>
                <RmgLabel label={t('ticket.description')}>
                    <MultiLangEntryCard
                        inputType="textarea"
                        translations={Object.entries(metadata.desc)}
                        onUpdate={(lang, desc) =>
                            setMetadata({ ...metadata, desc: { ...metadata.desc, [lang]: desc } })
                        }
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
                </RmgLabel>
            </Flex>

            <Flex>
                <Button size="sm" onClick={handleBack}>
                    {t('ticket.back')}
                </Button>

                <HStack ml="auto">
                    <Button
                        size="sm"
                        colorScheme="primary"
                        isDisabled={
                            param === '' ||
                            metadata.reference === '' ||
                            (type === 'real_world' &&
                                (metadata.justification === '' || !/^[a-zA-Z0-9. -]+$/.test(metadata.justification))) ||
                            (type === 'fantasy' &&
                                metadata.personalizedLink &&
                                (metadata.personalizedLink.length < 6 ||
                                    metadata.personalizedLink.length > 20 ||
                                    !/^[a-zA-Z0-9]{6,20}$/.test(metadata.personalizedLink))) ||
                            (Object.keys(metadata.desc).length > 0 && !('en' in metadata.desc)) ||
                            cityName === ''
                        }
                        onClick={() => setIsSubmitModalOpen(true)}
                    >
                        {t('ticket.submit')}
                    </Button>
                </HStack>
            </Flex>

            <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('ticket.submitTemplate')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {issueBody.length < 100 * 100 ? (
                            <>
                                <Text>{t('ticket.instruction')}</Text>
                                <Divider mt="2" mb="4" />
                                <RmgDebouncedTextarea
                                    ref={textareaRef}
                                    isReadOnly
                                    defaultValue={issueBody}
                                    onClick={({ target }) => (target as HTMLTextAreaElement).select()}
                                />
                            </>
                        ) : (
                            <>
                                <Text>{t('ticket.instructionFile')}</Text>
                                <Text>
                                    {t('ticket.instructionFileHint1')}
                                    <Code>{t('Uploading your files... (1/1)')}</Code>
                                    {t('ticket.instructionFileHint2')}
                                </Text>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {issueBody.length < 100 * 100 ? (
                            <Button colorScheme="primary" onClick={handleNew}>
                                {t('ticket.openIssue')}
                            </Button>
                        ) : (
                            <Button colorScheme="primary" onClick={handleDownload}>
                                {t('ticket.download')}
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </RmgPage>
    );
}