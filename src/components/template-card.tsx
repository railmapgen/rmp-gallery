import { Avatar, AvatarGroup, Button, Card, CardBody, CardFooter, CardHeader, Heading } from '@chakra-ui/react';
import { MonoColour } from '@railmapgen/rmg-palette-resources';
import { RmgLineBadge } from '@railmapgen/rmg-components';
import { useTranslation } from 'react-i18next';

import { Designer, DesignerMetadata, Gallery } from '../util/constant';
import useTranslatedName from './hooks/use-translated-name';

export const TemplateCard = (props: {
    type: 'real_world' | 'fantasy' | 'designer' | 'user' | 'admin';
    id: string;
    metadata: Gallery[string] | Designer[string];
    handleDetails: (city: string) => void;
}) => {
    const { type, id, metadata, handleDetails } = props;
    const translateName = useTranslatedName();
    const { t } = useTranslation();

    const updateSvgViewBox = (svgString: string, viewBox: string, widthAndHeight: number): string => {
        const style = `width: ${widthAndHeight}; height: ${widthAndHeight}; user-select: none; touch-action: none; background-color: white;`;
        return svgString
            .replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`)
            .replace(/style="[^"]*"/, `style="${style}"`);
    };

    return (
        <Card key={`${type}+${id}`} variant="elevated" minW="300" maxW="340" m="2">
            <CardBody>
                {/* Using native img due to: https://bugzilla.mozilla.org/show_bug.cgi?id=1647077 */}
                {type === 'real_world' || type === 'fantasy' ? (
                    <img width="300" height="300" loading="lazy" src={`resources/thumbnails/${id}@300.png`} alt={id} />
                ) : (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: updateSvgViewBox((metadata as DesignerMetadata).svg, '-150 -150 300 300', 300),
                        }}
                    />
                )}
            </CardBody>
            <CardHeader>
                <Heading size="lg" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {translateName(metadata.name)}
                    {(type === 'admin' || type === 'user') && (metadata as DesignerMetadata).status !== 'public' && (
                        <RmgLineBadge
                            mx={2}
                            name={(metadata as DesignerMetadata).status}
                            fg={MonoColour.white}
                            bg={(metadata as DesignerMetadata).status === 'pending' ? '#faa037' : '#ec0202'}
                        />
                    )}
                </Heading>
            </CardHeader>
            <CardFooter>
                {type === 'real_world' || type === 'fantasy' ? (
                    <AvatarGroup max={3}>
                        {(metadata as Gallery[string]).contributors.map(contributor => (
                            <Avatar
                                key={contributor}
                                src={`https://avatars.githubusercontent.com/u/${contributor}?s=48`}
                            />
                        ))}
                    </AvatarGroup>
                ) : (
                    <Avatar />
                )}
                <Button variant="solid" colorScheme="blue" ml="auto" onClick={() => handleDetails(id)}>
                    {t('details.title')}
                </Button>
            </CardFooter>
        </Card>
    );
};
