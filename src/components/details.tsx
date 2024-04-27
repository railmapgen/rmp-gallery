import {
    Avatar,
    Flex,
    Heading,
    IconButton,
    Image,
    Link,
    List,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useToast,
    VStack,
} from '@chakra-ui/react';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BiImport } from 'react-icons/bi';
import { IoHeartOutline, IoStarOutline } from 'react-icons/io5';
import { MdDownload, MdEdit, MdShare } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { Metadata, MetadataDetail } from '../util/constant';
import useTranslatedName from './hooks/use-translated-name';

const RMP_GALLERY_CHANNEL_NAME = 'RMP_GALLERY_CHANNEL';
const RMP_GALLERY_CHANNEL_EVENT = 'OPEN_TEMPLATE';
const CHN = new BroadcastChannel(RMP_GALLERY_CHANNEL_NAME);

const DetailsModal = (props: {
    city: string;
    type: 'real_world' | 'fantasy';
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { city, type, isOpen, onClose } = props;
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const translateName = useTranslatedName();

    const [metadata, setMetadata] = React.useState<Metadata>({
        name: { en: '' },
        desc: { en: '' },
        reference: '',
        updateHistory: [],
    });
    React.useEffect(() => {
        fetch(`resources/metadata/${city}.json`)
            .then(res => res.json())
            .then(data => setMetadata({ ...data, justification: '' }));
    }, [city]);

    const handleEdit = () => {
        const metadataCopy = structuredClone(metadata);
        const metadataDetail = (({ updateHistory, expireOn, ...rest }) => ({
            ...rest,
            justification: '',
        }))(metadataCopy) as MetadataDetail;
        navigate('/new', { state: { metadata: metadataDetail, type, id: city } });
    };
    const handleOpenTemplate = () => {
        CHN.postMessage({ event: RMP_GALLERY_CHANNEL_EVENT, data: city });
        toast({
            title: t(`Template ${city} imported in Rail Map Painter.`),
            status: 'success' as const,
            duration: 9000,
            isClosable: true,
        });
        onClose();
    };

    const rmpShareLink = `https://${window.location.hostname}/?app=rmp&searchParams=${city}`;
    const rmpShareLinkClickedToast = {
        title: t('Link copied.'),
        status: 'success' as const,
        duration: 9000,
        isClosable: true,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('details.title')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody paddingBottom={10}>
                    <VStack>
                        <a href={`resources/thumbnails/${city}.png`} target="_blank" rel="noopener noreferrer">
                            <Image src={`resources/thumbnails/${city}.png`} alt={city} borderRadius="lg" />
                        </a>
                    </VStack>
                    <Heading as="h5" size="md" mt={3} mb={2}>
                        {translateName(metadata.name)}
                    </Heading>
                    <Text>{translateName(metadata.desc)}</Text>

                    <Heading as="h5" size="sm" mt={3} mb={2}>
                        {t('details.updateHistory')}
                    </Heading>
                    <List>
                        {metadata.updateHistory.map(entry => (
                            <ListItem key={entry.issueNumber}>
                                <Flex flexDirection="row" alignItems="center">
                                    <Avatar
                                        size="sm"
                                        mr="2"
                                        src={`https://avatars.githubusercontent.com/u/${entry.id}`}
                                        cursor="pointer"
                                        onClick={() =>
                                            fetch(`https://api.github.com/user/${entry.id}`)
                                                .then(res => res.json())
                                                .then(user => window.open(`https://github.com/${user.login}`))
                                        }
                                    />
                                    <Link
                                        mr="auto"
                                        href={`https://github.com/railmapgen/rmp-gallery/issues/${entry.issueNumber}`}
                                        isExternal
                                    >
                                        {entry.reason}
                                    </Link>
                                    <Text>{new Date(entry.time).toLocaleDateString(undefined, { hour12: false })}</Text>
                                </Flex>
                            </ListItem>
                        ))}
                    </List>

                    {type === 'fantasy' && (
                        <Text mt={3}>
                            {t('details.expireOn')}
                            {new Date(metadata.expireOn ?? 0).toLocaleDateString()}
                        </Text>
                    )}
                </ModalBody>

                <ModalFooter>
                    <IconButton aria-label="Like" variant="ghost" icon={<IoHeartOutline />} isDisabled />
                    <IconButton aria-label="Favorite" variant="ghost" icon={<IoStarOutline />} isDisabled />
                    <Tooltip label={rmpShareLink}>
                        <IconButton
                            aria-label="Share"
                            variant="ghost"
                            icon={<MdShare />}
                            onClick={() => {
                                navigator.clipboard.writeText(rmpShareLink);
                                toast(rmpShareLinkClickedToast);
                            }}
                        />
                    </Tooltip>
                    <IconButton
                        aria-label="Edit"
                        variant="ghost"
                        isDisabled={type === 'fantasy' && (metadata.remainingUpdateCount ?? 0) === 0}
                        icon={<MdEdit />}
                        onClick={handleEdit}
                    />
                    <a href={`resources/${type}/${city}.json`} target="_blank" rel="noopener noreferrer">
                        <IconButton aria-label="Download" variant="ghost" icon={<MdDownload />} />
                    </a>
                    {rmgRuntime.isStandaloneWindow() ? (
                        <Tooltip label={t('details.import')}>
                            <IconButton aria-label="Import" variant="ghost" icon={<BiImport />} isDisabled />
                        </Tooltip>
                    ) : (
                        <IconButton
                            aria-label="Import"
                            variant="ghost"
                            icon={<BiImport />}
                            onClick={handleOpenTemplate}
                        />
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DetailsModal;
