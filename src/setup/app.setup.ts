import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';


export function appSetup(app: INestApplication) {
  pipesSetup(app);
}