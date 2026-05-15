import React from 'react';
import ChatPanel from '../components/chat/ChatPanel';
import { mockChatMessagesEmpty, mockChatMessagesMid, mockChatStateStreaming } from './mockData';

const noop = () => {};

const meta = {
    title: 'Chat/ChatPanel',
    component: ChatPanel,
};

export default meta;

const baseChat = {
    send: noop,
    cancel: noop,
    reset: noop,
    errorKind: null,
};

export const Empty = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesEmpty, status: 'idle' },
    },
};

export const MidConversation = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'idle' },
    },
};

export const Streaming = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, ...mockChatStateStreaming },
    },
};

export const RateLimited = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'rateLimited' },
    },
};

export const ErrorState = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'error', errorKind: 'upstream' },
    },
};
