import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  @MaxLength(40)
  type!: string;

  @IsString()
  @MinLength(4)
  content!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
