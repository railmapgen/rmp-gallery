import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_NAMES, LanguageCode } from '@railmapgen/rmg-translate';
import useTranslatedName from './hooks/use-translated-name';
import { ActionIcon, Box, Fieldset, Flex, Group, Select, Textarea, TextInput } from '@mantine/core';

interface MultiLangEntryCardProps {
    label: string;
    inputType: 'input' | 'textarea';
    translations?: any[];
    onUpdate: (lang: LanguageCode, name: string) => void;
    onLangSwitch: (prevLang: LanguageCode, nextLang: LanguageCode) => void;
    onRemove: (lang: LanguageCode) => void;
}

export const MultiLangEntryCardInner = (props: MultiLangEntryCardProps) => {
    const { label, inputType, onUpdate, onLangSwitch, onRemove } = props;
    const entries = props.translations ?? [];

    const { t } = useTranslation();
    const translateName = useTranslatedName();

    const TextBox = inputType === 'textarea' ? Textarea : TextInput;

    const languageOptions = Object.entries(LANGUAGE_NAMES).map(([lang, name]) => ({
        value: lang,
        label: translateName(name),
        disabled: entries.some(entry => entry[0] === lang),
    }));

    const handleAddEntry = () => {
        const nextLang = Object.keys(LANGUAGE_NAMES).filter(
            l => !entries.find(entry => entry[0] === l)
        )[0] as LanguageCode;
        onUpdate(nextLang, '');
    };

    return (
        <Fieldset legend={label}>
            {entries.map(([lang, name], idx, arr) => (
                <Flex key={idx} pt={4} align="center" data-testid={'entry-card-stack-' + lang}>
                    <Group gap="xs" flex={1} grow>
                        <Select
                            size="xs"
                            aria-label={t('multiLangEntry.lang')}
                            value={lang}
                            onChange={value => onLangSwitch(lang, value as LanguageCode)}
                            data={languageOptions}
                            searchable
                        />
                        <TextBox
                            size="xs"
                            aria-label={t('multiLangEntry.name')}
                            placeholder={t('multiLangEntry.name')}
                            value={name}
                            onChange={({ currentTarget: { value } }) => onUpdate(lang, value)}
                        />
                    </Group>
                    <Flex ml={8} wrap="nowrap">
                        {idx === arr.length - 1 ? (
                            <ActionIcon
                                size="sm"
                                variant="filled"
                                aria-label={t('multiLangEntry.add')}
                                title={t('multiLangEntry.add')}
                                onClick={handleAddEntry}
                            >
                                <MdAdd />
                            </ActionIcon>
                        ) : (
                            <Box w={22} />
                        )}

                        {arr.length > 1 && (
                            <ActionIcon
                                size="sm"
                                variant="outline"
                                aria-label={t('multiLangEntry.remove')}
                                title={t('multiLangEntry.remove')}
                                onClick={() => onRemove(lang as LanguageCode)}
                                ml={4}
                            >
                                <MdDeleteOutline />
                            </ActionIcon>
                        )}
                    </Flex>
                </Flex>
            ))}
        </Fieldset>
    );
};

export default function MultiLangEntryCard(props: MultiLangEntryCardProps) {
    return <MultiLangEntryCardInner {...props} />;
}
