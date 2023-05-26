import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Flex,
    Heading,
    IconButton,
    Image,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from '@chakra-ui/react';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { useRootDispatch, useRootSelector } from '../redux';
import { setRealWorld, setFantasy } from '../redux/app/app-slice';
import { Events, Gallery, MetadataDetail } from '../util/constant';
import DetailsModal from './details';
import useTranslatedName from './hooks/use-translated-name';

export default function GalleryView() {
    const navigate = useNavigate();
    const dispatch = useRootDispatch();
    const translateName = useTranslatedName();
    const { t } = useTranslation();

    const { realWorld, fantasy } = useRootSelector(state => state.app);

    const [type, setType] = React.useState('real_world' as 'real_world' | 'fantasy');
    const [city, setCity] = React.useState('shanghai');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const handleDetails = (city: string) => {
        setIsDetailsModalOpen(true);
        setCity(city);
    };

    const handleNew = () => {
        navigate('/new', {
            state: {
                metadata: {
                    name: { en: '' },
                    desc: { en: '' },
                    reference: '',
                    justification: '',
                } as MetadataDetail,
                type,
            },
        });
        rmgRuntime.event(Events.UPLOAD_TEMPLATES, {});
    };

    React.useEffect(() => {
        fetch('resources/real_world.json')
            .then(res => res.json() as Promise<Gallery>)
            .then(data => dispatch(setRealWorld(data)));
        fetch('resources/fantasy.json')
            .then(res => res.json() as Promise<Gallery>)
            .then(data => dispatch(setFantasy(data)));
    }, []);

    return (
        <>
            <Tabs isLazy isFitted onChange={i => setType(i === 0 ? 'real_world' : 'fantasy')}>
                <TabList>
                    <Tab>{t('gallery.type.realWorld')}</Tab>
                    <Tab>{t('gallery.type.fantasy')}</Tab>
                </TabList>
                <TabPanels>
                    {[realWorld, fantasy].map((g, i) => (
                        <TabPanel key={i}>
                            <Flex flexWrap="wrap">
                                {Object.entries(g).map(([id, metadata]) => (
                                    <Card key={`${type}+${id}`} variant="elevated" minWidth="300" m="2">
                                        <CardBody>
                                            <Image
                                                src={`resources/thumbnails/${id}@300.png`}
                                                alt={id}
                                                borderRadius="lg"
                                            />
                                            <Stack mt="6" spacing="3">
                                                <Heading size="lg">{translateName(metadata.name)}</Heading>
                                            </Stack>
                                        </CardBody>
                                        <CardFooter>
                                            <AvatarGroup max={3}>
                                                {metadata.contributors.map(contributor => (
                                                    <Avatar
                                                        key={contributor}
                                                        src={`https://avatars.githubusercontent.com/u/${contributor}`}
                                                    />
                                                ))}
                                            </AvatarGroup>
                                            <Button
                                                variant="solid"
                                                colorScheme="blue"
                                                ml="auto"
                                                onClick={() => handleDetails(id)}
                                            >
                                                {t('details.title')}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                <Box onClick={handleNew} position="fixed" bottom="20px" right="20px" zIndex={3}>
                                    <IconButton
                                        aria-label="new"
                                        size="lg"
                                        icon={<MdAdd />}
                                        colorScheme="blue"
                                        variant="solid"
                                    />
                                </Box>
                            </Flex>
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
