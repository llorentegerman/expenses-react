import { useState, useEffect } from 'react';
import useReactRouter from 'use-react-router';

function useSidebar({ defaultPath = '' } = {}) {
    const { history, location } = useReactRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState({
        path: defaultPath || location.pathname,
        expanded: true
    });

    useEffect(() => {
        if (location.pathname !== selectedItem.path) {
            onMenuItemClicked(location.pathname, {
                expanded: true
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const isActive = (path, exact) =>
        selectedItem.path === path ||
        (!exact && selectedItem.path.indexOf(`${path}/`) === 0);

    const onMenuItemClicked = (path, { expanded, isCollapsible } = {}) => {
        const newItem = {
            path,
            expanded: expanded !== undefined ? expanded : true
        };
        if (!isCollapsible) {
            setIsOpen(false);
            setSelectedItem(newItem);
            return history.push(path);
        }

        if (isActive(path)) {
            newItem.path = selectedItem.path;
            newItem.expanded = !selectedItem.expanded;
            return setSelectedItem(prevValue => ({
                ...prevValue,
                expanded: !prevValue.expanded
            }));
        }

        setSelectedItem(newItem);
        return history.push(path);
    };

    const isExpanded = path => isActive(path) && selectedItem.expanded;

    return {
        isOpen,
        isExpanded,
        isActive,
        onMenuItemClicked,
        setIsOpen
    };
}

export default useSidebar;
