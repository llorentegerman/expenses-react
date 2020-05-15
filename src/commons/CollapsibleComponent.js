import React, { useEffect, useRef } from 'react';
import { arrayOf, bool, element, oneOfType, string } from 'prop-types';

function CollapsibleComponent({
    children,
    expanded,
    style,
    transitionDuration,
    ...others
}) {
    const contentContainerRef = useRef(null);
    const maxHeight = useRef('100vh');

    useEffect(() => {
        let mounted = true;
        if (maxHeight.current !== '100vh' && contentContainerRef.current) {
            setTimeout(
                () => {
                    maxHeight.current =
                        mounted && contentContainerRef.current.scrollHeight;
                },
                0 // because scrollHeight could change after first render
            );
        }
        return () => { mounted = false; }; // prettier-ignore
    }, [children]);

    useEffect(() => {
        if (maxHeight.current === '100vh' && contentContainerRef.current) {
            setTimeout(
                () => {
                    maxHeight.current =
                        contentContainerRef.current.scrollHeight;
                },
                0 // because scrollHeight could change after first render
            );
        }
    }, [expanded]);

    return (
        <div
            style={{
                overflow: 'hidden',
                transitionProperty: 'max-height',
                transitionTimingFunction: 'ease-in-out',
                transitionDuration,
                maxHeight: expanded ? maxHeight.current : 0,
                ...style
            }}
            ref={contentContainerRef}
            {...others}
        >
            {children}
        </div>
    );
}

CollapsibleComponent.propTypes = {
    children: oneOfType([arrayOf(element), element]).isRequired,
    expanded: bool,
    transitionDuration: string
};

CollapsibleComponent.defaultProps = {
    transitionDuration: '.425s'
};

CollapsibleComponent.whyDidYouRender = false;

export default CollapsibleComponent;
