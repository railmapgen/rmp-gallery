import {
    Button,
    Divider,
    Flex,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SystemStyleObject,
    Text,
} from '@chakra-ui/react';
import { RmgDebouncedTextarea, RmgFields, RmgFieldsField, RmgLabel, RmgPage } from '@railmapgen/rmg-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { stringify } from 'zipson';

import { useRootSelector } from '../redux';
import { GITHUB_ISSUE_HEADER, GITHUB_ISSUE_PREAMBLE, Metadata } from '../util/constant';
import { makeGitHubIssueDetails, readFileAsText } from '../util/utils';
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
        state: { metadata: metadataParam },
    } = useLocation();
    const navigate = useNavigate();
    const gallery = useRootSelector(state => state.app.gallery);
    const { t } = useTranslation();

    const handleBack = () => navigate('/');

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

    const [metadata, setMetadata] = React.useState<Metadata>(metadataParam);
    const [param, setParam] = React.useState('');
    const cityName = metadata.name['en']?.replace(/[^A-Za-z0-9]/g, '').toLowerCase() ?? '';
    const issueBody = [
        GITHUB_ISSUE_HEADER,
        GITHUB_ISSUE_PREAMBLE,
        makeGitHubIssueDetails('metadata', JSON.stringify(metadata, null, 4), {}),
        makeGitHubIssueDetails('real_world', param, {
            compress: 'zipson',
            city: cityName,
        }),
    ].join('\n\n');
    const manualSearchParams = new URLSearchParams({
        labels: 'resources',
        title: `Resources: ${cityName in gallery ? 'Update' : 'New'} template of ${cityName}`,
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

    const fields: RmgFieldsField[] = [
        {
            type: 'custom',
            label: t('Project file'),
            component: <Input variant="flushed" size="xs" type="file" accept=".json" onChange={handleFileUpload} />,
            minW: 250,
        },
        {
            type: 'input',
            label: t('Reference link'),
            placeholder: 'Enter the link where you get the valid data',
            value: metadata.reference,
            onChange: value => setMetadata({ ...metadata, reference: value }),
            minW: 250,
        },
        {
            type: 'input',
            label: t('Justification'),
            placeholder: 'The reason why you make these changes',
            value: metadata.justification,
            onChange: value => setMetadata({ ...metadata, justification: value }),
            minW: 250,
        },
    ];

    return (
        <RmgPage sx={styles}>
            <Flex>
                <RmgFields fields={fields} />
                <RmgLabel label={t('City Name')}>
                    <MultiLangEntryCard
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
                <RmgLabel label={t('Description (Optional)')}>
                    <MultiLangEntryCard
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
                    {t('Back to list')}
                </Button>

                <HStack ml="auto">
                    <Button
                        size="sm"
                        colorScheme="primary"
                        isDisabled={param === '' || metadata.reference === '' || cityName === ''}
                        onClick={() => setIsSubmitModalOpen(true)}
                    >
                        {t('Submit')}
                    </Button>
                </HStack>
            </Flex>

            <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('Submit template')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>{t("You may now copy the following text into your new issue's body.")}</Text>
                        <Divider mt="2" mb="2" />
                        <RmgDebouncedTextarea
                            ref={textareaRef}
                            isReadOnly
                            defaultValue={issueBody}
                            onClick={({ target }) => (target as HTMLTextAreaElement).select()}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="primary" onClick={handleNew}>
                            {t('Copy issue body and open a new issue')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </RmgPage>
    );
}
