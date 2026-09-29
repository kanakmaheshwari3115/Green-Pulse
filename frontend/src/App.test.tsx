import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => <div>Route</div>,
  Navigate: () => <div>Navigate</div>,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}), { virtual: true });

jest.mock('./services/api', () => ({
  agriService: {
    getFarms: () => Promise.resolve([]),
    diagnoseCrop: () => Promise.resolve({}),
    getRegenerativeAdvisory: () => Promise.resolve({}),
    getSatelliteAndWeather: () => Promise.resolve({}),
    getStateDPGModels: () => Promise.resolve({}),
    exportDPGSchema: () => Promise.resolve({}),
  },
  parkService: {
    getAllParks: () => Promise.resolve([]),
  },
  sensorService: {},
  analyticsService: {},
}));

jest.mock('./services/websocket', () => ({
  websocketService: {
    connect: () => Promise.resolve(),
    disconnect: () => {},
    subscribeToPark: () => {},
    unsubscribeFromPark: () => {},
    isConnected: () => false,
  },
}));

import App from './App';

test('renders GreenPulse without crashing', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  render(<App />);
});
