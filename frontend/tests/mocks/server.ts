/**
 * MSW Server Setup
 * 테스트용 MSW 서버 설정
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server instance
export const server = setupServer(...handlers);
