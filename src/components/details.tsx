import {
    Avatar,
    AvatarGroup,
    Heading,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IoHeartOutline, IoStarOutline } from 'react-icons/io5';
import { MdDownload, MdEdit, MdInsertDriveFile, MdShare } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { useRootSelector } from '../redux';
import { Metadata } from '../util/constant';
import useTranslatedName from './hooks/use-translated-name';

const DetailsModal = (props: { city: string; isOpen: boolean; onClose: () => void }) => {
    const { city, isOpen, onClose } = props;
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const translateName = useTranslatedName();

    const gallery = useRootSelector(state => state.app.gallery);

    const [metadata, setMetadata] = React.useState<Metadata>({
        name: { en: '' },
        desc: { en: '' },
        reference: '',
        justification: '',
    });
    React.useEffect(() => {
        fetch(`resources/metadata/${city}.json`)
            .then(res => res.json())
            .then(data => setMetadata({ ...data, justification: '' }));
    }, [city]);

    const handleEdit = () => navigate('/new', { state: { metadata } });

    const rmpShareLink = `https://${window.location.hostname}/rmp/s/${city}`;
    const rmpShareLinkClickedToast = {
        title: t('Link copied.'),
        status: 'success' as const,
        duration: 9000,
        isClosable: true,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('Details')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody paddingBottom={10}>
                    <VStack>
                        <a href={`resources/thumbnails/${city}.png`} target="_blank" rel="noopener noreferrer">
                            <Image src={`resources/thumbnails/${city}.png`} alt={city} borderRadius="lg" />
                        </a>
                    </VStack>
                    <Heading as="h5" size="sm" mt={3} mb={2}>
                        {translateName(metadata.name)}
                    </Heading>
                    <Text>{translateName(metadata.desc)}</Text>
                </ModalBody>

                <ModalFooter>
                    <AvatarGroup max={8} mr="auto">
                        {gallery[city].contributors.map(contributor => (
                            <Avatar key={contributor} src={`https://avatars.githubusercontent.com/u/${contributor}`} />
                        ))}
                    </AvatarGroup>
                    <IconButton aria-label="Like" variant="ghost" icon={<IoHeartOutline />} isDisabled />
                    <IconButton aria-label="Favorite" variant="ghost" icon={<IoStarOutline />} isDisabled />
                    <Tooltip label={rmpShareLink}>
                        <IconButton
                            aria-label="Share"
                            variant="ghost"
                            icon={<MdShare />}
                            onClick={() => {
                                navigator.clipboard.writeText(rmpShareLink);
                                toast(rmpShareLinkClickedToast);
                            }}
                        />
                    </Tooltip>
                    <IconButton aria-label="Edit" variant="ghost" icon={<MdEdit />} onClick={handleEdit} />
                    <a href={`resources/real_world/${city}.json`} target="_blank" rel="noopener noreferrer">
                        <IconButton aria-label="Download" variant="ghost" icon={<MdDownload />} />
                    </a>
                    <IconButton aria-label="Import" variant="ghost" icon={<MdInsertDriveFile />} isDisabled />
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DetailsModal;
