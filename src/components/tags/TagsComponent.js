import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';
import ReactTags from 'react-tag-autocomplete';
import './tags.css';

const styles = StyleSheet.create({
    reactTagsContainer: {
        ':nth-child(n) > div': {
            border: '1px solid rgb(118, 118, 118)',
            width: 'calc(100% - 4px)'
        }
    }
});

function TagsComponent({
    onAddition,
    onDelete,
    placeholder,
    suggestions,
    tags
}) {
    return (
        <Column flexGrow={1} className={css(styles.reactTagsContainer)}>
            <ReactTags
                tags={tags}
                suggestions={suggestions}
                onDelete={onDelete}
                onAddition={onAddition}
                minQueryLength={0}
                maxSuggestionsLength={10}
                placeholder={placeholder}
            />
        </Column>
    );
}

export default TagsComponent;
