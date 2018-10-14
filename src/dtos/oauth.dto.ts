import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class OAuthDto {
  @IsString()
  @IsNotEmpty()
  readonly access_token: string;

  @IsInt()
  @IsNotEmpty()
  readonly expires_in: number;

  @IsString()
  @IsNotEmpty()
  readonly token_type: string;

  @IsString()
  @IsNotEmpty()
  readonly refresh_token: string;
}
