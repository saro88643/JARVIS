import dotenv from 'dotenv';
import path from 'node:path';
import { SecurityManager } from '@jarvis/security';
import { createServer } from './server.js';
import { logger } from './logger.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const port = Number(process.env.PORT) || 3001;
const workspace = process.env.APPROVED_WORKSPACE || 'C:\\JARVIS';

const securityManager = new SecurityManager(workspace);
const app = createServer(securityManager);

const server = app.listen(port, () => {
  logger.info(`JARVIS Backend Server running at http://localhost:${port}`);
  logger.info(`Approved Workspace: ${workspace}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.warn(`JARVIS Backend Server is already active on port ${port}. Continuing...`);
  } else {
    logger.error('Backend server error:', err);
    process.exit(1);
  }
});
