import classes from './details.module.css';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BiImport } from 'react-icons/bi';
import { IoHeartOutline, IoStarOutline } from 'react-icons/io5';
import {
    MdCheck,
    MdOutlineBlock,
    MdOutlineCheckCircleOutline,
    MdOutlineDownload,
    MdOutlineEdit,
    MdOutlinePauseCircleOutline,
    MdOutlineVisibility,
    MdShare,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useRootSelector } from '../redux';
import {
    DesignerDetails,
    DesignerDetailsResponse,
    DesignerMetadata,
    Metadata,
    MetadataDetail,
    RMT_SERVER,
    TabType,
} from '../util/constant';
import { decompressFromBase64, downloadAs } from '../util/utils';
import useTranslatedName from './hooks/use-translated-name';
import { ActionIcon, Anchor, Avatar, Group, Image, List, Menu, Modal, Text, Title, Tooltip } from '@mantine/core';

const RMP_GALLERY_CHANNEL_NAME = 'RMP_GALLERY_CHANNEL';
const RMP_GALLERY_CHANNEL_EVENT = 'OPEN_TEMPLATE';
const RMP_GALLERY_CHANNEL_DESIGNER_OPEN_EVENT = 'OPEN_DESIGNER';
const RMP_GALLERY_CHANNEL_DESIGNER_NEW_EVENT = 'NEW_DESIGNER';
const CHN = new BroadcastChannel(RMP_GALLERY_CHANNEL_NAME);

const RMP_MASTER_CHANNEL_NAME = 'RMP_MASTER_CHANNEL';
const RMP_MASTER_CHANNEL_POST = 'MASTER_POST';
const CHN_MASTER = new BroadcastChannel(RMP_MASTER_CHANNEL_NAME);

type ButtonLoadingState = 'IDLE' | 'LOADING' | 'COMPLETE';

const DetailsModal = (props: {
    city: string;
    type: TabType;
    userRole: 'USER' | 'ADMIN';
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { city, type, userRole, isOpen, onClose } = props;
    const navigate = useNavigate();
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
    const [shareState, setShareState] = React.useState<ButtonLoadingState>('IDLE');

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
            rmgRuntime.sendNotification({
                title: t('Success'),
                message: t(`Template ${city} imported in Rail Map Painter.`),
                type: 'success',
                duration: 9000,
            });
        } else {
            CHN.postMessage({
                event: RMP_GALLERY_CHANNEL_DESIGNER_OPEN_EVENT,
                data: (metadata as DesignerDetails).data,
            });
            rmgRuntime.sendNotification({
                title: t('Success'),
                message: t(`Template ${translateName(metadata.name)} imported in RMP Designer.`),
                type: 'success',
                duration: 9000,
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
            rmgRuntime.sendNotification({
                title: t('Error'),
                message: `Failed: ${rep.status} ${rep.statusText}`,
                type: 'error',
                duration: 9000,
            });
            return;
        }
        rmgRuntime.sendNotification({
            title: t('Success'),
            message: `Success!`,
            type: 'success',
            duration: 9000,
        });
        onClose();
    };

    const rmpShareLink = `https://${window.location.host}/?app=rmp&searchParams=${city}`;

    const handleMasterImport = () => {
        if (isMasterImport && (metadata as DesignerDetails).data !== undefined) {
            CHN_MASTER.postMessage({
                event: RMP_MASTER_CHANNEL_POST,
                data: (metadata as DesignerDetails).data,
            });
        }
    };

    return (
        <Modal opened={isOpen} onClose={onClose} title={t('details.title')} size="100%">
            {type === 'real_world' || type === 'fantasy' ? (
                <a href={`resources/thumbnails/${city}.png`} target="_blank" rel="noopener noreferrer">
                    <Image src={`resources/thumbnails/${city}.png`} alt={city} className={classes.image} />
                </a>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: (metadata as DesignerMetadata).svg }} />
            )}

            <Title order={4} size="h4" my="sm">
                {translateName(metadata.name)}
            </Title>
            <Text>{translateName(metadata.desc)}</Text>

            {type === 'real_world' || type === 'fantasy' ? (
                <>
                    <Title order={5} size="h5" my="sm">
                        {t('details.updateHistory')}
                    </Title>
                    <List
                        classNames={{
                            itemWrapper: classes['list-item'],
                            itemIcon: classes.avatar,
                            itemLabel: classes['list-item-label'],
                        }}
                    >
                        {(type === 'real_world' || type === 'fantasy') &&
                            (metadata as Metadata).updateHistory &&
                            (metadata as Metadata).updateHistory.map(entry => (
                                <List.Item
                                    key={entry.issueNumber}
                                    icon={
                                        <Avatar
                                            size="sm"
                                            src={`https://avatars.githubusercontent.com/u/${entry.id}`}
                                            onClick={() =>
                                                fetch(`https://api.github.com/user/${entry.id}`)
                                                    .then(res => res.json())
                                                    .then(user => window.open(`https://github.com/${user.login}`))
                                            }
                                        />
                                    }
                                >
                                    <Anchor
                                        href={`https://github.com/railmapgen/rmp-gallery/issues/${entry.issueNumber}`}
                                        target="_blank"
                                    >
                                        {entry.reason}
                                    </Anchor>
                                    <Text className={classes.date}>
                                        {new Date(entry.time).toLocaleDateString(undefined, {
                                            hour12: false,
                                        })}
                                    </Text>
                                </List.Item>
                            ))}
                    </List>
                </>
            ) : (
                <List
                    classNames={{
                        itemWrapper: classes['list-item'],
                        itemIcon: classes.avatar,
                        itemLabel: classes['list-item-label'],
                    }}
                >
                    <List.Item icon={<Avatar />}>
                        <Text mr="auto" px={2}>
                            {(metadata as DesignerDetails).userName}
                        </Text>
                        <Text>
                            {new Date((metadata as DesignerDetails).lastUpdateAt).toLocaleDateString(undefined, {
                                hour12: false,
                            })}
                        </Text>
                    </List.Item>
                </List>
            )}

            {type === 'fantasy' && (
                <Text mt={3}>
                    {t('details.expireOn')}
                    {new Date((metadata as Metadata).expireOn ?? 0).toLocaleDateString()}
                </Text>
            )}

            <Group gap="xs" className={classes.footer}>
                {isMasterImport ? (
                    <ActionIcon aria-label="Import" variant="default" onClick={handleMasterImport}>
                        <BiImport />
                    </ActionIcon>
                ) : (
                    <>
                        <ActionIcon aria-label="Like" variant="default" disabled>
                            <IoHeartOutline />
                        </ActionIcon>
                        <ActionIcon aria-label="Favorite" variant="default" disabled>
                            <IoStarOutline />
                        </ActionIcon>
                        <Tooltip label={shareState === 'COMPLETE' ? t('Link copied.') : rmpShareLink}>
                            <ActionIcon
                                aria-label="Share"
                                variant={shareState === 'COMPLETE' ? 'filled' : 'default'}
                                disabled={type === 'admin' || type === 'designer' || type === 'user'}
                                onClick={async () => {
                                    setShareState('LOADING');
                                    await navigator.clipboard.writeText(rmpShareLink);
                                    setShareState('COMPLETE');
                                    setTimeout(() => {
                                        setShareState('IDLE');
                                    }, 2000);
                                }}
                                color={shareState === 'COMPLETE' ? 'green' : undefined}
                                loading={shareState === 'LOADING'}
                            >
                                {shareState === 'COMPLETE' ? <MdCheck /> : <MdShare />}
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('details.edit')}>
                            <ActionIcon
                                aria-label={t('details.edit')}
                                variant="default"
                                disabled={
                                    (type === 'fantasy' && ((metadata as Metadata).remainingUpdateCount ?? 0) === 0) ||
                                    type === 'designer'
                                }
                                onClick={handleEditRmp}
                            >
                                <MdOutlineEdit />
                            </ActionIcon>
                        </Tooltip>
                        {userRole === 'ADMIN' && (
                            <Menu>
                                <Menu.Target>
                                    <ActionIcon aria-label="Change status" variant="default">
                                        <MdOutlineVisibility />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<MdOutlineCheckCircleOutline />}
                                        onClick={() => handleChangeStatus('public')}
                                    >
                                        Public
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<MdOutlinePauseCircleOutline />}
                                        onClick={() => handleChangeStatus('pending')}
                                    >
                                        Pending
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<MdOutlineBlock />}
                                        onClick={() => handleChangeStatus('rejected')}
                                    >
                                        Rejected
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                        <Tooltip label={t('details.download')}>
                            {type === 'real_world' || type === 'fantasy' ? (
                                <ActionIcon
                                    component="a"
                                    variant="default"
                                    aria-label={t('details.download')}
                                    href={`resources/${type}/${city}.json`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MdOutlineDownload />
                                </ActionIcon>
                            ) : (
                                <ActionIcon
                                    aria-label={t('details.download')}
                                    variant="default"
                                    onClick={() =>
                                        downloadAs(
                                            `RMP-Designer_Marketplace_${new Date().valueOf()}.json`,
                                            'application/json',
                                            (metadata as DesignerDetails).data
                                        )
                                    }
                                >
                                    <MdOutlineDownload />
                                </ActionIcon>
                            )}
                        </Tooltip>
                        {rmgRuntime.isStandaloneWindow() ? (
                            <Tooltip label={t('details.import')}>
                                <ActionIcon aria-label="Import" variant="ghost" disabled>
                                    <BiImport />
                                </ActionIcon>
                            </Tooltip>
                        ) : (
                            <Tooltip label="Import">
                                <ActionIcon aria-label="Import" variant="default" onClick={handleOpenTemplate}>
                                    <BiImport />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </>
                )}
            </Group>
        </Modal>
    );
};

export default DetailsModal;
