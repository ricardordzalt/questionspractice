import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAnswerDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  type?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
