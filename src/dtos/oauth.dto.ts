import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class OAuthDto {
  @IsString()
  @IsNotEmpty()
  readonly access_token: string;

  @IsNumber()
  @IsNotEmpty()
  readonly expires_in: number;

  @IsString()
  @IsNotEmpty()
  readonly token_type: string;

  @IsString()
  @IsNotEmpty()
  readonly refresh_token: string;
}
