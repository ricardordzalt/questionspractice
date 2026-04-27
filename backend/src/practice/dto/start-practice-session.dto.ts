import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const difficultyValues = ['junior', 'mid', 'senior', 'staff'] as const;

export class StartPracticeSessionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsString()
  @IsIn(difficultyValues)
  difficulty?: (typeof difficultyValues)[number];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  dueOnly?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  weakOnly?: boolean;
}
