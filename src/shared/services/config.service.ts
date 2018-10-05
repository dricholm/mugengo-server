import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;

  JWT_SECRET: string;
  JWT_EXPIRY: number;
  CRYPTO_SECRET: string;

  TYPEORM_CONNECTION: string;
  TYPEORM_HOST: string;
  TYPEORM_USERNAME: string;
  TYPEORM_PASSWORD: string;
  TYPEORM_DATABASE: string;
  TYPEORM_PORT: number;
  TYPEORM_SYNCHRONIZE: boolean;
  TYPEORM_ENTITIES: string;
  TYPEORM_MIGRATIONS: string;
  TYPEORM_LOGGING: boolean;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  get config(): EnvConfig {
    return this.envConfig;
  }

  constructor() {
    let parsedEnv: EnvConfig = dotenv.parse(fs.readFileSync('.env'));

    if (process.env.NODE_ENV === 'test' && fs.existsSync('.env.test')) {
      const testEnv: Partial<EnvConfig> = dotenv.parse(
        fs.readFileSync('.env.test')
      );
      parsedEnv = { ...parsedEnv, ...testEnv };
    }

    const validatedConfig: EnvConfig = this.validateInput(parsedEnv);

    Object.keys(validatedConfig).forEach((key: string) => {
      if (process.env.hasOwnProperty(key)) {
        validatedConfig[key] = process.env[key];
      } else {
        process.env[key] = validatedConfig[key];
      }
    });

    // TODO: Logger: Starting in NODE_ENV environment

    this.envConfig = validatedConfig;
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      CRYPTO_SECRET: Joi.string().length(32),
      JWT_EXPIRY: Joi.number()
        .empty('')
        .default(7200),
      JWT_SECRET: Joi.string(),
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test'])
        .empty('')
        .default('development'),
      PORT: Joi.number()
        .empty('')
        .default(3000),
      TYPEORM_CONNECTION: Joi.string()
        .empty('')
        .valid(['postgres'])
        .default('postgres'),
      TYPEORM_DATABASE: Joi.string()
        .empty('')
        .default('mugengo'),
      TYPEORM_ENTITIES: Joi.string()
        .empty('')
        .default('src/**/**.entity.ts'),
      TYPEORM_HOST: Joi.string()
        .empty('')
        .default('localhost'),
      TYPEORM_LOGGING: Joi.boolean()
        .empty('')
        .default(false),
      TYPEORM_MIGRATIONS: Joi.string()
        .empty('')
        .default('src/**/**.migration.ts'),
      TYPEORM_PASSWORD: Joi.string().allow(''),
      TYPEORM_PORT: Joi.number()
        .integer()
        .empty('')
        .default(5432),
      TYPEORM_SYNCHRONIZE: Joi.boolean()
        .empty('')
        .default(true),
      TYPEORM_USERNAME: Joi.string()
        .empty('')
        .default('root'),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema
    );

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }
}
