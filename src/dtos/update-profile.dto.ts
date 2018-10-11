import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
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
}
