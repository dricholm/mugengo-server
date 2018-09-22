import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

interface EnvConfig {
  [key: string]: any;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  get config(): any {
    return this.envConfig;
  }

  constructor(filePath: string) {
    this.envConfig = this.validateInput(
      dotenv.parse(fs.readFileSync(filePath))
    );

    Object.keys(this.envConfig).forEach((key: string) => {
      process.env[key] = this.envConfig[key];
    });
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
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
