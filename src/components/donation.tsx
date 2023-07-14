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
    Link,
    List,
    ListIcon,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
    UnorderedList,
} from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheckCircle, MdFlagCircle, MdRemoveCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function DonationModal(props: { isOpen: boolean; onClose: () => void }) {
    const { isOpen } = props;
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleBack = () => navigate('/');
    const handleBecomeEarlyBird = (sku: 'A' | 'B') => {
        const param = new URLSearchParams({
            labels: 'donation',
            title: `Donation: Early bird ${sku}`,
        });
        window.open('https://github.com/railmapgen/rmp-gallery/issues/new?' + param.toString(), '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={handleBack} size="2xl">
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
                                            <Tooltip
                                                label={
                                                    <Stack alignItems="center">
                                                        <Text>{t('donation.earlyBirdBonus')}</Text>
                                                        <Text>https://{window.location.hostname}/rmp/s/wenxi</Text>
                                                    </Stack>
                                                }
                                            >
                                                <ListItem>
                                                    <ListIcon as={MdFlagCircle} color="teal.500" />
                                                    {t('donation.personalizedLink')}
                                                </ListItem>
                                            </Tooltip>
                                        </List>
                                    </Stack>
                                </CardBody>
                                <Divider />
                                <CardFooter>
                                    <Button colorScheme="blue" onClick={() => handleBecomeEarlyBird('A')}>
                                        {t('donation.becomeAnEarlyBird')}
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
                                            <Tooltip
                                                label={
                                                    <Stack alignItems="center">
                                                        <Text>{t('donation.earlyBirdBonus')}</Text>
                                                        <Text>https://{window.location.hostname}/rmp/s/wenxi</Text>
                                                    </Stack>
                                                }
                                            >
                                                <ListItem>
                                                    <ListIcon as={MdFlagCircle} color="teal.500" />
                                                    {t('donation.personalizedLink')}
                                                </ListItem>
                                            </Tooltip>
                                        </List>
                                    </Stack>
                                </CardBody>
                                <Divider />
                                <CardFooter>
                                    <Button colorScheme="blue" onClick={() => handleBecomeEarlyBird('B')}>
                                        {t('donation.becomeAnEarlyBird')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </SimpleGrid>
                        <Text>{t('donation.content3')}</Text>
                        <Text>{t('donation.content4')}</Text>
                        <Accordion allowMultiple>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box as="span" flex="1" textAlign="left">
                                        {t('donation.termsAndConditions')}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
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
                                <AccordionPanel>{t('donation.comingSoon')}</AccordionPanel>
                            </AccordionItem>
                            <AccordionItem>
                                <AccordionButton>
                                    <Box as="span" flex="1" textAlign="left">
                                        {t('donation.methodUS')}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>{t('donation.comingSoon')}</AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
