/* eslint-disable max-lines */
/* eslint-disable no-console */
import * as dotenv from 'dotenv';

import { validate } from './lib/validate.ts';
import { registrySetup } from './registrySetup.ts';

async function run(): Promise<void> {
  // Load environment variables from .env file locally
  dotenv.config();

  if (!validate()) {
    process.exit(1);
  }

  try {
    registrySetup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void run();
