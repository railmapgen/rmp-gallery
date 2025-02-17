import {
    Avatar,
    Button,
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
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
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
import { MdDownload, MdEdit, MdShare, MdVisibility } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { useRootSelector } from '../redux';
import {
    DesignerDetails,
    DesignerDetailsResponse,
    DesignerMetadata,
    Metadata,
    MetadataDetail,
    RMT_SERVER,
} from '../util/constant';
import { decompressFromBase64, downloadAs } from '../util/utils';
import useTranslatedName from './hooks/use-translated-name';

const RMP_GALLERY_CHANNEL_NAME = 'RMP_GALLERY_CHANNEL';
const RMP_GALLERY_CHANNEL_EVENT = 'OPEN_TEMPLATE';
const RMP_GALLERY_CHANNEL_DESIGNER_OPEN_EVENT = 'OPEN_DESIGNER';
const RMP_GALLERY_CHANNEL_DESIGNER_NEW_EVENT = 'NEW_DESIGNER';
const CHN = new BroadcastChannel(RMP_GALLERY_CHANNEL_NAME);

const RMP_MASTER_CHANNEL_NAME = 'RMP_MASTER_CHANNEL';
const RMP_MASTER_CHANNEL_POST = 'MASTER_POST';
const CHN_MASTER = new BroadcastChannel(RMP_MASTER_CHANNEL_NAME);

const DetailsModal = (props: {
    city: string;
    type: 'real_world' | 'fantasy' | 'designer' | 'user' | 'admin';
    userRole: 'USER' | 'ADMIN';
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { city, type, userRole, isOpen, onClose } = props;
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const { rmtToken } = useRootSelector(state => state.app);
    const translateName = useTranslatedName();

    const [isMasterImport, setIsMasterImport] = React.useState(false);
    React.useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        if (searchParams.size > 0) {
            const m = searchParams.get('master');
            setIsMasterImport(!!m);
        }
    }, []);

    const [metadata, setMetadata] = React.useState<Metadata | DesignerDetails>({
        name: { en: '' },
        desc: { en: '' },
        reference: '',
        updateHistory: [],
    });
    const [isVisibleOpen, setIsVisibleOpen] = React.useState(false);

    const fetchServerById = async () => {
        if (!rmtToken) return;
        const rep = await fetch(RMT_SERVER + `/designer/public/${city}`, {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtToken}`,
            },
        });
        if (rep.status !== 200) {
            return;
        }
        const p: DesignerDetailsResponse = await rep.json();
        console.log(p);
        setMetadata({
            id: p.id,
            name: JSON.parse(p.name),
            desc: JSON.parse(p.desc),
            userId: p.userId,
            userName: p.userName,
            lastUpdateAt: p.lastUpdateAt,
            type: p.type,
            status: p.status,
            svg: decompressFromBase64(p.svg),
            data: p.data,
        });
        return;
    };

    React.useEffect(() => {
        setIsVisibleOpen(false);
        if (type === 'real_world' || type === 'fantasy') {
            fetch(`resources/metadata/${city}.json`)
                .then(res => res.json())
                .then(data => setMetadata({ ...data, justification: '' }));
        } else {
            fetchServerById();
        }
    }, [city]);

    const handleEditRmp = () => {
        if (type === 'real_world' || type === 'fantasy') {
            const metadataCopy = structuredClone(metadata);
            const metadataDetail = (({ updateHistory, expireOn, ...rest }: Metadata) => ({
                ...rest,
                justification: '',
            }))(metadataCopy as Metadata) as MetadataDetail;
            navigate('/new', { state: { metadata: metadataDetail, type, id: city } });
        } else {
            CHN.postMessage({ event: RMP_GALLERY_CHANNEL_DESIGNER_NEW_EVENT, data: metadata as DesignerDetails });
            if (rmgRuntime.isStandaloneWindow()) {
                window.open('/rmp-designer/#/new', '_blank');
            } else {
                rmgRuntime.openApp({ appId: 'rmp-designer', hash: '/new' });
            }
        }
    };
    const handleOpenTemplate = () => {
        if (type === 'real_world' || type === 'fantasy') {
            CHN.postMessage({ event: RMP_GALLERY_CHANNEL_EVENT, data: city });
            toast({
                title: t(`Template ${city} imported in Rail Map Painter.`),
                status: 'success' as const,
                duration: 9000,
                isClosable: true,
            });
        } else {
            CHN.postMessage({
                event: RMP_GALLERY_CHANNEL_DESIGNER_OPEN_EVENT,
                data: (metadata as DesignerDetails).data,
            });
            toast({
                title: t(`Template ${translateName(metadata.name)} imported in RMP Designer.`),
                status: 'success' as const,
                duration: 9000,
                isClosable: true,
            });
        }
        onClose();
    };

    const handleChangeStatus = async (type: 'public' | 'pending' | 'rejected') => {
        if (!rmtToken) return;
        const rep = await fetch(RMT_SERVER + '/designer/admin', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtToken}`,
            },
            body: JSON.stringify({
                id: Number(city),
                status: type,
            }),
            method: 'PATCH',
        });
        if (rep.status !== 200) {
            toast({
                title: `Failed: ${rep.status} ${rep.statusText}`,
                status: 'error' as const,
                duration: 9000,
                isClosable: true,
            });
            return;
        }
        toast({
            title: `Success!`,
            status: 'success' as const,
            duration: 9000,
            isClosable: true,
        });
        setIsVisibleOpen(false);
        onClose();
    };

    const rmpShareLink = `https://${window.location.hostname}/?app=rmp&searchParams=${city}`;
    const rmpShareLinkClickedToast = {
        title: t('Link copied.'),
        status: 'success' as const,
        duration: 9000,
        isClosable: true,
    };

    const handleMasterImport = () => {
        if (isMasterImport && (metadata as DesignerDetails).data !== undefined) {
            CHN_MASTER.postMessage({
                event: RMP_MASTER_CHANNEL_POST,
                data: (metadata as DesignerDetails).data,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('details.title')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody paddingBottom={10}>
                    <VStack>
                        {type === 'real_world' || type === 'fantasy' ? (
                            <a href={`resources/thumbnails/${city}.png`} target="_blank" rel="noopener noreferrer">
                                <Image src={`resources/thumbnails/${city}.png`} alt={city} borderRadius="lg" />
                            </a>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: (metadata as DesignerMetadata).svg }} />
                        )}
                    </VStack>
                    <Heading as="h5" size="md" mt={3} mb={2}>
                        {translateName(metadata.name)}
                    </Heading>
                    <Text>{translateName(metadata.desc)}</Text>

                    {type === 'real_world' || type === 'fantasy' ? (
                        <>
                            <Heading as="h5" size="sm" mt={3} mb={2}>
                                {t('details.updateHistory')}
                            </Heading>
                            <List>
                                {(type === 'real_world' || type === 'fantasy') &&
                                    (metadata as Metadata).updateHistory &&
                                    (metadata as Metadata).updateHistory.map(entry => (
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
                                                            .then(user =>
                                                                window.open(`https://github.com/${user.login}`)
                                                            )
                                                    }
                                                />
                                                <Link
                                                    mr="auto"
                                                    href={`https://github.com/railmapgen/rmp-gallery/issues/${entry.issueNumber}`}
                                                    isExternal
                                                >
                                                    {entry.reason}
                                                </Link>
                                                <Text>
                                                    {new Date(entry.time).toLocaleDateString(undefined, {
                                                        hour12: false,
                                                    })}
                                                </Text>
                                            </Flex>
                                        </ListItem>
                                    ))}
                            </List>
                        </>
                    ) : (
                        <Flex flexDirection="row" alignItems="center" my={4}>
                            <Avatar />
                            <Text mr="auto" px={2}>
                                {(metadata as DesignerDetails).userName}
                            </Text>
                            <Text>
                                {new Date((metadata as DesignerDetails).lastUpdateAt).toLocaleDateString(undefined, {
                                    hour12: false,
                                })}
                            </Text>
                        </Flex>
                    )}

                    {type === 'fantasy' && (
                        <Text mt={3}>
                            {t('details.expireOn')}
                            {new Date((metadata as Metadata).expireOn ?? 0).toLocaleDateString()}
                        </Text>
                    )}
                </ModalBody>

                {isMasterImport ? (
                    <ModalFooter>
                        <IconButton
                            aria-label="Import"
                            variant="ghost"
                            icon={<BiImport />}
                            onClick={handleMasterImport}
                        />
                    </ModalFooter>
                ) : (
                    <ModalFooter>
                        <IconButton aria-label="Like" variant="ghost" icon={<IoHeartOutline />} isDisabled />
                        <IconButton aria-label="Favorite" variant="ghost" icon={<IoStarOutline />} isDisabled />
                        <Tooltip label={rmpShareLink}>
                            <IconButton
                                aria-label="Share"
                                variant="ghost"
                                icon={<MdShare />}
                                isDisabled={type === 'admin' || type === 'designer' || type === 'user'}
                                onClick={() => {
                                    navigator.clipboard.writeText(rmpShareLink);
                                    toast(rmpShareLinkClickedToast);
                                }}
                            />
                        </Tooltip>
                        <IconButton
                            aria-label="Edit"
                            variant="ghost"
                            isDisabled={
                                (type === 'fantasy' && ((metadata as Metadata).remainingUpdateCount ?? 0) === 0) ||
                                type === 'designer'
                            }
                            icon={<MdEdit />}
                            onClick={handleEditRmp}
                        />
                        <Popover isOpen={isVisibleOpen}>
                            <PopoverTrigger>
                                <IconButton
                                    hidden={userRole !== 'ADMIN'}
                                    aria-label="zoom"
                                    variant="ghost"
                                    icon={<MdVisibility />}
                                    onClick={() => setIsVisibleOpen(!isVisibleOpen)}
                                />
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverBody>
                                    <Flex direction="row">
                                        <Button colorScheme="green" onClick={() => handleChangeStatus('public')}>
                                            PUBLIC
                                        </Button>
                                        <Button colorScheme="yellow" onClick={() => handleChangeStatus('pending')}>
                                            PENDING
                                        </Button>
                                        <Button colorScheme="red" onClick={() => handleChangeStatus('rejected')}>
                                            REJECTED
                                        </Button>
                                    </Flex>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                        {type === 'real_world' || type === 'fantasy' ? (
                            <a href={`resources/${type}/${city}.json`} target="_blank" rel="noopener noreferrer">
                                <IconButton aria-label="Download" variant="ghost" icon={<MdDownload />} />
                            </a>
                        ) : (
                            <IconButton
                                aria-label="Download"
                                variant="ghost"
                                icon={<MdDownload />}
                                onClick={() =>
                                    downloadAs(
                                        `RMP-Designer_Marketplace_${new Date().valueOf()}.json`,
                                        'application/json',
                                        (metadata as DesignerDetails).data
                                    )
                                }
                            />
                        )}
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
                )}
            </ModalContent>
        </Modal>
    );
};

export default DetailsModal;
