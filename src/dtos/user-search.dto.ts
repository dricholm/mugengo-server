import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class UserSearchDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly fromAge: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly toAge: number;

  @IsString()
  @IsOptional()
  readonly country: string;

  @IsArray()
  @IsOptional()
  readonly languages: Array<{ code: string; level: number; relation: number }>;
}
