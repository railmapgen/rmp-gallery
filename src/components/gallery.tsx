import classes from './gallery.module.css';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdHeart } from 'react-icons/io';
import { MdAdd, MdOutlineWarning } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { useRootDispatch, useRootSelector } from '../redux';
import { setFantasy, setLogins, setRealWorld } from '../redux/app/app-slice';
import {
    Designer,
    DesignerMetadata,
    DesignerResponse,
    Events,
    Gallery,
    MetadataDetail,
    RMT_SERVER,
    TAB_TYPES,
    TabType,
} from '../util/constant';
import { decompressFromBase64 } from '../util/utils';
import DetailsModal from './details';
import { TemplateCard } from './template-card';
import {
    ActionIcon,
    Affix,
    Group,
    NativeSelect,
    Notification,
    Select,
    SimpleGrid,
    Tabs,
    TextInput,
    Title,
} from '@mantine/core';
import { RMPage, RMSection, RMSectionHeader } from '@railmapgen/mantine-components';

export default function GalleryView() {
    const navigate = useNavigate();
    const dispatch = useRootDispatch();
    const { t } = useTranslation();

    const { realWorld, fantasy, logins, serverUsers, rmtToken } = useRootSelector(state => state.app);
    const [designerPublic, setDesignerPublic] = React.useState<Designer>({});
    const [designerAdmin, setDesignerAdmin] = React.useState<Designer>({});
    const [designerUser, setDesignerUser] = React.useState<Designer>({});
    const [userRole, setUserRole] = React.useState<'USER' | 'ADMIN'>('USER');

    const [isMasterImport, setIsMasterImport] = React.useState(false);
    const [type, setType] = React.useState<TabType>('real_world');
    const [city, setCity] = React.useState('shanghai');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const handleDetails = (city: string) => {
        setIsDetailsModalOpen(true);
        setCity(city);
    };

    const handleNew = () => {
        if (type === 'real_world') {
            rmgRuntime.event(Events.UPLOAD_TEMPLATES, { type });
            navigate('/new', {
                state: {
                    metadata: {
                        name: { en: '' },
                        desc: { en: '' },
                        reference: '',
                        justification: 'New template of ',
                    } as MetadataDetail,
                    type,
                },
            });
        } else if (type === 'fantasy') {
            navigate('/donation');
        } else {
            if (rmgRuntime.isStandaloneWindow()) {
                window.open('/rmp-designer/#/new', '_blank');
            } else {
                rmgRuntime.openApp({ appId: 'rmp-designer', hash: '/new' });
            }
        }
    };

    const designerSetItem = (p: DesignerResponse): DesignerMetadata => {
        return {
            id: p.id,
            name: JSON.parse(p.name),
            desc: JSON.parse(p.desc),
            userId: p.userId,
            lastUpdateAt: p.lastUpdateAt,
            type: p.type,
            status: p.status,
            svg: decompressFromBase64(p.svg),
        };
    };

    const fetchServerPublic = async () => {
        if (!rmtToken) return;
        const rep = await fetch(RMT_SERVER + '/designer/public', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtToken}`,
            },
        });
        if (rep.status !== 200) {
            return;
        }
        const { data: res } = await rep.json();

        const pub: Designer = {};
        res.forEach((p: DesignerResponse) => {
            pub[`${p.id}`] = designerSetItem(p);
        });
        setDesignerPublic(pub);
        // dispatch(
        //     setServerUsers(userList.reduce((s: string, k: { id: number; name: string }) => ({ [k.id]: k.name }), {}))
        // );
        return;
    };

    const fetchServerUser = async () => {
        if (!rmtToken) return;
        const rep = await fetch(RMT_SERVER + '/designer/user', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtToken}`,
            },
        });
        if (rep.status !== 200) {
            return;
        }
        const { userRole, data: res } = await rep.json();

        const user: Designer = {};
        res.forEach((p: DesignerResponse) => {
            user[`${p.id}`] = designerSetItem(p);
        });
        setDesignerUser(user);
        setUserRole(userRole);
        if (userRole === 'ADMIN') {
            await fetchServerAdmin();
        }
        return;
    };

    const fetchServerAdmin = async () => {
        if (!rmtToken) return;
        const rep = await fetch(RMT_SERVER + '/designer/admin', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtToken}`,
            },
        });
        if (rep.status !== 200) {
            return;
        }
        const res = await rep.json();

        const admin: Designer = {};
        res.forEach((p: DesignerResponse) => {
            admin[`${p.id}`] = designerSetItem(p);
        });
        setDesignerAdmin(admin);
        return;
    };

    React.useEffect(() => {
        fetch('resources/real_world.json')
            .then(res => res.json() as Promise<Gallery>)
            .then(data => dispatch(setRealWorld(data)));
        fetch('resources/fantasy.json')
            .then(res => res.json() as Promise<Gallery>)
            .then(data => dispatch(setFantasy(data)));
        fetch('resources/logins.json')
            .then(
                res =>
                    res.json() as Promise<{
                        realWorld: { [id in string]: string };
                        fantasy: { [id in string]: string };
                    }>
            )
            .then(data => dispatch(setLogins(data)));
        fetchServerPublic();
        fetchServerUser();
    }, [type]);

    const [filterName, setFilterName] = React.useState('');
    const [filterID, setFilterID] = React.useState<string | null>(null);
    const [filterIDServer, setFilterIDServer] = React.useState<string | null>(null);
    const [sortBy, setSortBy] = React.useState('alphabetical' as 'alphabetical' | 'update_time');

    const sortByOptions = [
        { value: 'alphabetical', label: t('gallery.sortBy.alphabetical') },
        ...(type !== 'fantasy' ? [{ value: 'update_time', label: t('gallery.sortBy.updateTime') }] : []),
    ];
    const REAL_WORLD_AUTHOR_OPTIONS = Object.entries(logins.realWorld).map(([value, label]) => ({ value, label }));
    const FANTASY_AUTHOR_OPTIONS = Object.entries(logins.fantasy).map(([value, label]) => ({ value, label }));

    React.useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        if (searchParams.size > 0) {
            const id = searchParams.get('tabId');
            if (id && TAB_TYPES.includes(id as TabType)) {
                handleTabChange(id as TabType);
            }

            const master = searchParams.get('master');
            setIsMasterImport(!!master);
        }
    }, []);

    const handleTabChange = (tab: TabType) => {
        setType(tab);
        setSortBy(tab === 'real_world' || tab === 'designer' ? 'alphabetical' : 'update_time');
    };

    const tabs: { value: TabType; label: string; data: Gallery | Designer; disabled?: boolean; hidden?: boolean }[] = [
        { value: 'real_world', label: t('gallery.type.realWorld'), data: realWorld, disabled: isMasterImport },
        { value: 'fantasy', label: t('gallery.type.fantasy'), data: fantasy, disabled: isMasterImport },
        { value: 'designer', label: t('gallery.type.designer'), data: designerPublic },
        { value: 'user', label: t('gallery.type.user'), data: designerUser },
        { value: 'admin', label: t('gallery.type.admin'), data: designerAdmin, hidden: userRole !== 'ADMIN' },
    ];

    return (
        <RMPage>
            <Tabs
                value={type}
                onChange={tab => {
                    if (tab) handleTabChange(tab as TabType);
                }}
                keepMounted={false}
                classNames={{ root: classes.tabs, tab: classes.tab, panel: classes['tab-panel'] }}
            >
                <Tabs.List grow>
                    {tabs
                        .filter(({ hidden }) => !hidden)
                        .map(({ value, label, disabled }) => (
                            <Tabs.Tab key={value} value={value} disabled={disabled}>
                                {label}
                            </Tabs.Tab>
                        ))}
                </Tabs.List>
                {tabs.map(({ value, data }) => (
                    <Tabs.Panel key={value} value={value}>
                        {value === 'real_world' && (
                            <>
                                <Notification
                                    icon={<MdOutlineWarning />}
                                    color="yellow"
                                    title={t('gallery.warning')}
                                    withCloseButton={false}
                                    withBorder
                                    className={classes.notification}
                                >
                                    {t('gallery.noTravelAdvice')}
                                </Notification>
                                <RMSection>
                                    <RMSectionHeader>
                                        <Title order={2} size="h3">
                                            {t('gallery.editorSelected')}
                                        </Title>
                                    </RMSectionHeader>
                                    <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
                                        {['shanghai', 'guangzhou', 'hongkong', 'beijing']
                                            .map(id => ({ id, metadata: data[id] }))
                                            .filter(({ metadata }) => metadata !== undefined)
                                            .map(({ id, metadata }) => (
                                                <TemplateCard
                                                    key={`${type}+${id}`}
                                                    type={type}
                                                    id={id}
                                                    metadata={metadata}
                                                    handleDetails={handleDetails}
                                                />
                                            ))}
                                    </SimpleGrid>
                                </RMSection>
                            </>
                        )}
                        <RMSection>
                            <RMSectionHeader>
                                <Title order={2} size="h3">
                                    {t('gallery.all')}
                                </Title>
                                <Group ml="auto">
                                    <TextInput
                                        label={t('gallery.filterName')}
                                        value={filterName}
                                        onChange={({ currentTarget: { value } }) => setFilterName(value)}
                                    />
                                    {(value === 'real_world' || value === 'fantasy') && (
                                        <Select
                                            label={t('gallery.filterAuthor')}
                                            value={filterID}
                                            onChange={value => setFilterID(value)}
                                            data={
                                                value === 'real_world'
                                                    ? REAL_WORLD_AUTHOR_OPTIONS
                                                    : FANTASY_AUTHOR_OPTIONS
                                            }
                                            clearable
                                            searchable
                                        />
                                    )}
                                    {(value === 'designer' || value === 'admin') && (
                                        <Select
                                            label={t('gallery.filterAuthor')}
                                            value={filterIDServer}
                                            onChange={value => setFilterID(value)}
                                            data={[]}
                                            clearable
                                            searchable
                                        />
                                    )}
                                    {value !== 'fantasy' && (
                                        <NativeSelect
                                            label={t('gallery.sortBy.label')}
                                            value={sortBy}
                                            onChange={({ currentTarget: { value } }) =>
                                                setSortBy(value as 'alphabetical' | 'update_time')
                                            }
                                            data={sortByOptions}
                                        />
                                    )}
                                </Group>
                            </RMSectionHeader>
                            <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
                                {Object.entries(data)
                                    .filter(([_, metadata]) =>
                                        !filterID ||
                                        type === 'designer' ||
                                        type === 'admin' ||
                                        type === 'user' ||
                                        !['real_world', 'fantasy'].includes(value) // designer, user, admin should never filter by contributor
                                            ? true
                                            : metadata.contributors.includes(filterID)
                                    )
                                    .filter(([_, metadata]) =>
                                        filterIDServer === null ||
                                        type === 'real_world' ||
                                        type === 'fantasy' ||
                                        type === 'user' ||
                                        ['real_world', 'fantasy'].includes(value) // real_world, fantasy should never filter by server user
                                            ? true
                                            : (metadata as DesignerMetadata).userId === Number(filterIDServer)
                                    )
                                    .filter(([_, metadata]) =>
                                        filterName === ''
                                            ? true
                                            : Object.values(metadata.name)
                                                  .map(_ => (_ as string).toLowerCase())
                                                  .join()
                                                  .includes(filterName.toLowerCase())
                                    )
                                    .sort((a, b) =>
                                        // https://stackoverflow.com/questions/59773396/why-array-prototype-sort-has-different-behavior-in-chrome
                                        sortBy === 'alphabetical'
                                            ? a[1].name.en.toLowerCase() > b[1].name.en.toLowerCase()
                                                ? 1
                                                : -1
                                            : b[1].lastUpdateOn - a[1].lastUpdateOn
                                    )
                                    .map(([id, metadata]) => (
                                        <TemplateCard
                                            key={`${type}+${id}`}
                                            type={type}
                                            id={id}
                                            metadata={metadata}
                                            handleDetails={handleDetails}
                                        />
                                    ))}
                                <Affix position={{ bottom: 20, right: 20 }} onClick={handleNew} zIndex={3}>
                                    <ActionIcon
                                        aria-label="new"
                                        size="xl"
                                        color={type === 'fantasy' ? 'red' : undefined}
                                        variant="filled"
                                    >
                                        {type === 'fantasy' ? <IoMdHeart /> : <MdAdd />}
                                    </ActionIcon>
                                </Affix>
                            </SimpleGrid>
                        </RMSection>
                    </Tabs.Panel>
                ))}
            </Tabs>
            <DetailsModal
                city={city}
                type={type}
                userRole={userRole}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        </RMPage>
    );
}
