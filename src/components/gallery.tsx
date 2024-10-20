import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    SystemStyleObject,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from '@chakra-ui/react';
import { RmgFields, RmgFieldsField } from '@railmapgen/rmg-components';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdHeart } from 'react-icons/io';
import { MdAdd } from 'react-icons/md';
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
} from '../util/constant';
import DetailsModal from './details';
import { TemplateCard } from './template-card';
import { decompressFromBase64 } from '../util/utils';

const stickyHeaderStyles: SystemStyleObject = {
    position: 'sticky',
    top: -4,
    zIndex: 1,
    background: 'inherit',
};

export default function GalleryView() {
    const navigate = useNavigate();
    const dispatch = useRootDispatch();
    const { t } = useTranslation();

    const { realWorld, fantasy, logins, serverUsers, rmtLogin } = useRootSelector(state => state.app);
    const [designerPublic, setDesignerPublic] = React.useState<Designer>({});
    const [designerAdmin, setDesignerAdmin] = React.useState<Designer>({});
    const [designerUser, setDesignerUser] = React.useState<Designer>({});
    const [userRole, setUserRole] = React.useState<'USER' | 'ADMIN'>('USER');

    const [tabIndex, setTabIndex] = React.useState(0);
    const [isMasterImport, setIsMasterImport] = React.useState(false);
    const [type, setType] = React.useState('real_world' as 'real_world' | 'fantasy' | 'designer' | 'user' | 'admin');
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
        if (!rmtLogin) return;
        const rep = await fetch(RMT_SERVER + '/designer/public', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtLogin!.token}`,
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
        if (!rmtLogin) return;
        const rep = await fetch(RMT_SERVER + '/designer/user', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtLogin!.token}`,
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
        if (!rmtLogin) return;
        const rep = await fetch(RMT_SERVER + '/designer/admin', {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rmtLogin!.token}`,
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
    const [filterID, setFilterID] = React.useState('');
    const [filterIDServer, setFilterIDServer] = React.useState(-1);
    const [sortBy, setSortBy] = React.useState('alphabetical' as 'alphabetical' | 'update_time');
    const sortByOptions = {
        alphabetical: t('gallery.sortBy.alphabetical'),
        ...(type !== 'fantasy' ? { update_time: t('gallery.sortBy.updateTime') } : {}),
    };
    const fields: RmgFieldsField[] = [
        {
            type: 'input',
            label: t('gallery.filterName'),
            value: filterName,
            onChange: val => setFilterName(val),
            debouncedDelay: 500,
            minW: 200,
        },
        {
            type: 'select',
            label: t('gallery.filterAuthor'),
            value: filterID,
            options: { '': 'None', ...(type === 'real_world' ? logins.realWorld : logins.fantasy) },
            onChange: val => setFilterID(val.toString()),
            hidden: type === 'user' || type === 'admin' || type === 'designer',
            minW: 200,
        },
        {
            type: 'select',
            label: t('gallery.filterAuthor'),
            value: filterIDServer,
            options: { [-1]: 'None', ...serverUsers },
            onChange: val => setFilterIDServer(Number(val)),
            hidden: type === 'real_world' || type === 'fantasy' || type === 'user',
            minW: 200,
        },
        {
            type: 'select',
            label: t('gallery.sortBy.label'),
            value: sortBy,
            options: sortByOptions,
            onChange: val => setSortBy(val.toString() as 'alphabetical' | 'update_time'),
            hidden: type === 'fantasy',
            minW: 200,
        },
    ];

    React.useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        if (searchParams.size > 0) {
            const id = searchParams.get('tabId');
            if (id && Number.isInteger(Number(id))) {
                handleTabChange(Number(id));
            }

            const master = searchParams.get('master');
            setIsMasterImport(!!master);
        }
    }, []);

    const handleTabChange = (i: number) => {
        setTabIndex(i);
        // set some default values for different types
        switch (i) {
            case 0:
                setType('real_world');
                break;
            case 1:
                setType('fantasy');
                break;
            case 2:
                setType('designer');
                break;
            case 3:
                setType('user');
                break;
            case 4:
                setType('admin');
                break;
        }
        setSortBy(i === 0 || i === 2 ? 'alphabetical' : 'update_time');
    };

    const tabs =
        userRole === 'ADMIN'
            ? [realWorld, fantasy, designerPublic, designerUser, designerAdmin]
            : [realWorld, fantasy, designerPublic, designerUser];

    return (
        <>
            <Tabs isLazy isFitted index={tabIndex} onChange={i => handleTabChange(i)} overflow="hidden">
                <TabList>
                    <Tab isDisabled={isMasterImport}>{t('gallery.type.realWorld')}</Tab>
                    <Tab isDisabled={isMasterImport}>{t('gallery.type.fantasy')}</Tab>
                    <Tab>{t('gallery.type.designer')}</Tab>
                    <Tab>{t('gallery.type.user')}</Tab>
                    {userRole === 'ADMIN' && <Tab>{t('gallery.type.admin')}</Tab>}
                </TabList>
                <TabPanels overflow="hidden" h="100%">
                    {tabs.map((g, i) => (
                        <TabPanel key={i} overflowY="auto" h="calc(100% - 2rem - 8px)">
                            {type === 'real_world' && (
                                <>
                                    <Card variant="filled">
                                        <CardHeader>
                                            <Heading size="lg">{t('gallery.warning')}</Heading>
                                        </CardHeader>
                                        <CardBody paddingTop="0">
                                            <Text size="xl">{t('gallery.noTravelAdvice')}</Text>
                                        </CardBody>
                                    </Card>
                                    <Card mt="2">
                                        <CardHeader sx={stickyHeaderStyles}>
                                            <Heading size="lg">{t('gallery.editorSelected')}</Heading>
                                        </CardHeader>
                                        <CardBody paddingTop="0">
                                            <Flex flexWrap="wrap">
                                                {['shanghai', 'guangzhou', 'hongkong', 'beijing']
                                                    .map(id => ({ id, metadata: g[id] }))
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
                                            </Flex>
                                        </CardBody>
                                    </Card>
                                </>
                            )}
                            <Card mt="2">
                                <CardHeader sx={stickyHeaderStyles}>
                                    <Flex direction="row">
                                        <Heading size="lg" mr="auto">
                                            {t('gallery.all')}
                                        </Heading>
                                        <RmgFields fields={fields} />
                                    </Flex>
                                </CardHeader>
                                <CardBody paddingTop="0">
                                    <Flex flexWrap="wrap">
                                        {Object.entries(g)
                                            .filter(([_, metadata]) =>
                                                filterID === '' ||
                                                type === 'designer' ||
                                                type === 'admin' ||
                                                type === 'user'
                                                    ? true
                                                    : metadata.contributors.includes(filterID)
                                            )
                                            .filter(([_, metadata]) =>
                                                filterIDServer === -1 ||
                                                type === 'real_world' ||
                                                type === 'fantasy' ||
                                                type === 'user'
                                                    ? true
                                                    : (metadata as DesignerMetadata).userId === filterIDServer
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
                                                sortBy === 'alphabetical' ? 0 : b[1].lastUpdateOn - a[1].lastUpdateOn
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
                                        <Box onClick={handleNew} position="fixed" bottom="20px" right="20px" zIndex={3}>
                                            <IconButton
                                                aria-label="new"
                                                size="lg"
                                                icon={type === 'fantasy' ? <IoMdHeart /> : <MdAdd />}
                                                colorScheme={type === 'fantasy' ? 'red' : 'blue'}
                                                variant="solid"
                                            />
                                        </Box>
                                    </Flex>
                                </CardBody>
                            </Card>
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
            <DetailsModal
                city={city}
                type={type}
                userRole={userRole}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        </>
    );
}
