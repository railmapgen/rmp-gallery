import classes from './template-card.module.css';
import { useTranslation } from 'react-i18next';
import { Designer, DesignerMetadata, Gallery, TabType } from '../util/constant';
import useTranslatedName from './hooks/use-translated-name';
import { Avatar, Badge, Button, Card, Group, Image, Title } from '@mantine/core';

export const TemplateCard = (props: {
    type: TabType;
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
        <Card className={classes.card} withBorder>
            <Card.Section>
                {/* Using native img due to: https://bugzilla.mozilla.org/show_bug.cgi?id=1647077 */}
                {type === 'real_world' || type === 'fantasy' ? (
                    <Image
                        width="300"
                        height="300"
                        loading="lazy"
                        src={`resources/thumbnails/${id}@300.png`}
                        alt={id}
                    />
                ) : (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: updateSvgViewBox((metadata as DesignerMetadata).svg, '-150 -150 300 300', 300),
                        }}
                    />
                )}
            </Card.Section>
            <Group mt="md" mb="xs">
                <Title order={3} size="h2">
                    {translateName(metadata.name)}
                    {(type === 'admin' || type === 'user') && (metadata as DesignerMetadata).status !== 'public' && (
                        <Badge mx="xs" bg={(metadata as DesignerMetadata).status === 'pending' ? '#faa037' : '#ec0202'}>
                            (metadata as DesignerMetadata).status
                        </Badge>
                    )}
                </Title>
            </Group>
            <Group>
                {type === 'real_world' || type === 'fantasy' ? (
                    <Avatar.Group>
                        {(metadata as Gallery[string]).contributors.map(contributor => (
                            <Avatar
                                key={contributor}
                                src={`https://avatars.githubusercontent.com/u/${contributor}?s=48`}
                                alt={contributor}
                                name={contributor}
                                title={contributor}
                                color="initials"
                            />
                        ))}
                    </Avatar.Group>
                ) : (
                    <Avatar />
                )}
                <Button variant="filled" ml="auto" onClick={() => handleDetails(id)}>
                    {t('details.title')}
                </Button>
            </Group>
        </Card>
    );
};
