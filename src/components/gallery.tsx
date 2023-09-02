import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
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
import { Events, Gallery, MetadataDetail } from '../util/constant';
import DetailsModal from './details';
import { TemplateCard } from './template-card';

export default function GalleryView() {
    const navigate = useNavigate();
    const dispatch = useRootDispatch();
    const { t } = useTranslation();

    const { realWorld, fantasy, logins } = useRootSelector(state => state.app);

    const [type, setType] = React.useState('fantasy' as 'real_world' | 'fantasy');
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
        }
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
    }, []);

    const [filterID, setFilterID] = React.useState('');
    const [sortBy, setSortBy] = React.useState('alphabetical' as 'alphabetical' | 'update_time');
    const fields: RmgFieldsField[] = [
        {
            type: 'select',
            label: t('gallery.filterAuthor'),
            value: filterID,
            options: { '': 'None', ...(type === 'real_world' ? logins.realWorld : logins.fantasy) },
            onChange: val => setFilterID(val.toString()),
            minW: 200,
        },
        {
            type: 'select',
            label: t('gallery.sortBy.label'),
            value: sortBy,
            options: { alphabetical: t('gallery.sortBy.alphabetical'), update_time: t('gallery.sortBy.updateTime') },
            onChange: val => setSortBy(val.toString() as 'alphabetical' | 'update_time'),
            minW: 200,
        },
    ];

    return (
        <>
            <Tabs isLazy isFitted defaultIndex={1} onChange={i => setType(i === 0 ? 'real_world' : 'fantasy')}>
                <TabList>
                    <Tab>{t('gallery.type.realWorld')}</Tab>
                    <Tab>{t('gallery.type.fantasy')}</Tab>
                </TabList>
                <TabPanels>
                    {[realWorld, fantasy].map((g, i) => (
                        <TabPanel key={i}>
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
                                        <CardHeader>
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
                                <CardHeader>
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
                                                filterID === '' ? true : metadata.contributors.includes(filterID)
                                            )
                                            // @ts-expect-error This works well and can't understand the error
                                            .sort((a, b) =>
                                                sortBy === 'alphabetical' ? 0 : a[1].lastUpdateOn < b[1].lastUpdateOn
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
                                                icon={type === 'real_world' ? <MdAdd /> : <IoMdHeart />}
                                                colorScheme={type === 'real_world' ? 'blue' : 'red'}
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
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        </>
    );
}
