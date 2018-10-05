import {
  IsString,
  IsEmail,
  MinLength,
  ValidateIf,
  IsIn,
} from 'class-validator';

export class TokenDto {
  @ValidateIf((req: TokenDto) => req.grant_type === 'password')
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsIn(['password', 'refresh_token'])
  readonly grant_type: string;

  @ValidateIf((req: TokenDto) => req.grant_type === 'password')
  @IsString()
  @MinLength(6)
  readonly password: string;

  @ValidateIf((req: TokenDto) => req.grant_type === 'refresh_token')
  @IsString()
  readonly refresh_token: string;
}
