import React from 'react';
import Notification from 'rc-notification';
import 'rc-notification/assets/index.css';

let notification = null;
Notification.newInstance(
    {
        style: {
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1101
        }
    },
    n => (notification = n)
);

export default {
    show: ({ key, message, style }) =>
        notification.notice({
            content: <span>{message}</span>,
            style: {
                right: 0,
                margin: 0,
                padding: 0,
                width: '100%',
                backgroundColor: 'red',
                color: '#FFFFFF',
                borderRadius: 0,
                textAlign: 'center',
                ...style
            },
            duration: null,
            key
        }),
    hide: key => notification.removeNotice(key)
};
