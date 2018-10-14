import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  readonly country: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly age: number;

  @IsArray()
  readonly languages: Array<{ code: string; level: number }>;
}
