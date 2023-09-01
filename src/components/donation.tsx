import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Heading,
    Icon,
    Link,
    List,
    ListIcon,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Stack,
    Text,
    UnorderedList,
} from '@chakra-ui/react';
import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheckCircle, MdOpenInNew, MdRemoveCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Events, MetadataDetail } from '../util/constant';

export default function Donation() {
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();

    const handleBack = () => navigate('/');
    const handleDonate = () => {
        if (i18n.language === 'zh-Hans') {
            window.open('https://afdian.net/a/rail-map-toolkit', '_blank');
        } else {
            window.open('https://opencollective.com/rail-map-toolkit', '_blank');
        }
    };

    const handleNew = () => {
        rmgRuntime.event(Events.UPLOAD_TEMPLATES, { type: 'fantasy' });
        navigate('/new', {
            state: {
                metadata: {
                    name: { en: '' },
                    desc: { en: '' },
                    reference: '',
                    justification: '',
                    remainingUpdateCount: 0,
                } as MetadataDetail,
                type: 'fantasy',
            },
        });
    };

    return (
        <Modal isOpen={true} onClose={handleBack} size="2xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('donation.title')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody paddingBottom={10}>
                    <Stack spacing={3}>
                        <Text>{t('donation.content1')}</Text>
                        <Text>
                            {t('donation.content2')}
                            <Link
                                color="blue.500"
                                href={`https://${window.location.hostname}/rmp/s/mcG7zS`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://{window.location.hostname}/rmp/s/mcG7zS
                            </Link>
                        </Text>
                        <SimpleGrid columns={2} spacing="10">
                            <Card align="center">
                                <CardBody>
                                    <Stack spacing={3} alignItems="center">
                                        <Heading>{t('donation.typeA')}</Heading>
                                        <List>
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} color="blue.500" />
                                                {t('donation.uniqueLink')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} color="blue.500" />
                                                {t('donation.duration')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdRemoveCircle} color="red.500" />
                                                {t('donation.noUpdates')}
                                            </ListItem>
                                        </List>
                                    </Stack>
                                </CardBody>
                                <Divider />
                                <CardFooter>
                                    <Button colorScheme="blue" onClick={() => handleDonate()}>
                                        {t('donation.donate')}
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card align="center">
                                <CardBody>
                                    <Stack spacing={3} alignItems="center">
                                        <Heading>{t('donation.typeB')}</Heading>
                                        <List>
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} color="blue.500" />
                                                {t('donation.uniqueLink')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} color="blue.500" />
                                                {t('donation.duration')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} color="blue.500" />
                                                {t('donation.unlimitedUpdates')}
                                            </ListItem>
                                        </List>
                                    </Stack>
                                </CardBody>
                                <Divider />
                                <CardFooter>
                                    <Button colorScheme="blue" onClick={() => handleDonate()}>
                                        {t('donation.donate')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </SimpleGrid>
                        <Text>{t('donation.content3')}</Text>
                        <Text>{t('donation.content4')}</Text>
                        <Accordion allowMultiple defaultIndex={[i18n.language === 'zh-Hans' ? 1 : 2]}>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box as="span" flex="1" textAlign="left">
                                        {t('donation.termsAndConditions')}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Text>{t('donation.termsLastUpdatedOn')}</Text>
                                    <UnorderedList>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <ListItem key={i}>{t(`donation.terms${i + 1}`)}</ListItem>
                                        ))}
                                    </UnorderedList>
                                </AccordionPanel>
                            </AccordionItem>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box as="span" flex="1" textAlign="left">
                                        {t('donation.methodCN')}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Link
                                        color="blue.500"
                                        href="https://afdian.net/a/rail-map-toolkit"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        https://afdian.net/a/rail-map-toolkit <Icon as={MdOpenInNew} />
                                    </Link>
                                    <UnorderedList>
                                        <ListItem key="1">{t('donation.methodGithubAccount')}</ListItem>
                                        <ListItem key="2">{t('donation.methodAfdianAccount')}</ListItem>
                                        <ListItem key="3">{t('donation.methodCNMethod')}</ListItem>
                                        <ListItem key="4">{t('donation.methodCNLeaveMessage')}</ListItem>
                                        <ListItem key="5">{t('donation.methodMessageContains')}</ListItem>
                                    </UnorderedList>
                                </AccordionPanel>
                            </AccordionItem>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box as="span" flex="1" textAlign="left">
                                        {t('donation.methodUS')}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <Link
                                        color="blue.500"
                                        href="https://opencollective.com/rail-map-toolkit"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        https://opencollective.com/rail-map-toolkit <Icon as={MdOpenInNew} />
                                    </Link>
                                    <UnorderedList>
                                        <ListItem key="1">{t('donation.methodGithubAccount')}</ListItem>
                                        <ListItem key="2">{t('donation.methodOpenCollectiveAccount')}</ListItem>
                                        <ListItem key="3">{t('donation.methodUSMethod')}</ListItem>
                                        <ListItem key="4">{t('donation.methodUSLeaveMessage')}</ListItem>
                                        <ListItem key="5">{t('donation.methodMessageContains')}</ListItem>
                                    </UnorderedList>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="primary" onClick={handleNew}>
                        {t('donation.next')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
