import { InjectionToken } from '@angular/core';
import { DbConfig } from './db-config.interface';

export const DB_CONFIG = new InjectionToken<DbConfig>('DB_CONFIG');

