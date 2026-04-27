import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const difficultyValues = ['junior', 'mid', 'senior', 'staff'] as const;

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  prompt?: string;

  @IsOptional()
  @IsString()
  @IsIn(difficultyValues)
  difficulty?: (typeof difficultyValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];
}
