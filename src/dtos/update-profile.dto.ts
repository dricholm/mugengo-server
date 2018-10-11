import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  readonly country: string;

  @IsNumber()
  @Min(1)
  @Max(150)
  readonly age: number;
}
