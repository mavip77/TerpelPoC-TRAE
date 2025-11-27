import React from 'react';
import {render, screen, waitFor} from '@testing-library/react-native';
import InboxScreen from '../src/screens/InboxScreen';

jest.mock('../src/services/inbox', () => {
  const items = Array.from({length: 3}).map((_, i) => ({
    id: `id-${i + 1}`,
    title: `Mensaje ${i + 1}`,
    body: `Contenido del mensaje ${i + 1}`,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    read: i % 2 === 0,
    deeplink: `terpel://promo/${i + 1}`,
  }));
  return {
    fetchInbox: jest.fn(async () => ({items, nextCursor: null})),
    syncAndPersistInbox: jest.fn(async () => items),
    markAsRead: jest.fn(async () => true),
    markLocalRead: jest.fn(async () => {}),
    openSecureDeeplink: jest.fn(async () => true),
  };
});

describe('InboxScreen', () => {
  it('carga y renderiza la lista con indicadores de no leído', async () => {
    render(<InboxScreen />);
    await waitFor(() => {
      const list = screen.getByTestId('inbox-list');
      expect(list).toBeTruthy();
      expect(screen.getByText('Mensaje 1')).toBeTruthy();
      expect(screen.getByText('Mensaje 2')).toBeTruthy();
    });
  });
});

