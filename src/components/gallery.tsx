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
import { LanguageCode, Translation } from '@railmapgen/rmg-translate';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { Events } from '../util/constant';

export default function Gallery() {
    const {
        t,
        i18n: { language },
    } = useTranslation();
    const navigate = useNavigate();

    const handleNew = () => {
        navigate('/new');
        rmgRuntime.event(Events.UPLOAD_TEMPLATES, {});
    };

    const [realWorld, setRealWorld] = React.useState(
        {} as { [cityName: string]: { contributors: string[]; name: Translation } }
    );

    React.useEffect(() => {
        fetch('resources/real_world.json')
            .then(res => res.json())
            .then(data => setRealWorld(data));
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
                        {Object.keys(realWorld).map(city => (
                            <Card key={city} variant="elevated" minWidth="300" m="2">
                                <CardBody>
                                    <Image src={`resources/thumbnails/${city}@300.png`} alt={city} borderRadius="lg" />
                                    <Stack mt="6" spacing="3">
                                        <Heading size="lg">{realWorld[city].name[language as LanguageCode]}</Heading>
                                    </Stack>
                                </CardBody>
                                <CardFooter>
                                    <AvatarGroup>
                                        {realWorld[city].contributors.map(contributor => (
                                            <Avatar
                                                key={contributor}
                                                src={`https://avatars.githubusercontent.com/u/${contributor}`}
                                            />
                                        ))}
                                    </AvatarGroup>
                                    <Button variant="solid" colorScheme="blue" ml="auto" isDisabled>
                                        Set
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
            </TabPanels>
        </Tabs>
    );
}
