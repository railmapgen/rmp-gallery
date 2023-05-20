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
import { setGallery } from '../redux/app/app-slice';
import { Events, Gallery, MetadataDetail } from '../util/constant';
import DetailsModal from './details';
import useTranslatedName from './hooks/use-translated-name';

export default function GalleryView() {
    const navigate = useNavigate();
    const dispatch = useRootDispatch();
    const translateName = useTranslatedName();
    const { t } = useTranslation();

    const { gallery } = useRootSelector(state => state.app);

    const handleNew = () => {
        navigate('/new', {
            state: {
                metadata: {
                    name: { en: '' },
                    desc: { en: '' },
                    reference: '',
                    justification: '',
                } as MetadataDetail,
            },
        });
        rmgRuntime.event(Events.UPLOAD_TEMPLATES, {});
    };

    const [city, setCity] = React.useState('shanghai');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const handleDetails = (city: string) => {
        setIsDetailsModalOpen(true);
        setCity(city);
    };

    React.useEffect(() => {
        fetch('resources/real_world.json')
            .then(res => res.json() as Promise<Gallery>)
            .then(data => dispatch(setGallery(data)));
    }, []);

    return (
        <Tabs isLazy isFitted>
            <TabList>
                <Tab>{t('gallery.type.realWorld')}</Tab>
                <Tab isDisabled>{t('gallery.type.fantasy')}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Flex flexWrap="wrap">
                        {Object.keys(gallery).map(city => (
                            <Card key={city} variant="elevated" minWidth="300" m="2">
                                <CardBody>
                                    <Image src={`resources/thumbnails/${city}@300.png`} alt={city} borderRadius="lg" />
                                    <Stack mt="6" spacing="3">
                                        <Heading size="lg">{translateName(gallery[city].name)}</Heading>
                                    </Stack>
                                </CardBody>
                                <CardFooter>
                                    <AvatarGroup max={3}>
                                        {gallery[city].contributors.map(contributor => (
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
                                        onClick={() => handleDetails(city)}
                                    >
                                        {t('Details')}
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

                    <DetailsModal
                        city={city}
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
