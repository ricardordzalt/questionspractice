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

export class CreateQuestionDto {
  @IsString()
  @MinLength(4)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(8)
  prompt!: string;

  @IsString()
  @IsIn(difficultyValues)
  difficulty!: (typeof difficultyValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  topicIds!: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];
}
