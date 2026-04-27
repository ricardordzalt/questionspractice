import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const difficultyValues = ['junior', 'mid', 'senior', 'staff'] as const;

export class ListQuestionsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsOptional()
  @IsString()
  tagId?: string;

  @IsOptional()
  @IsString()
  @IsIn(difficultyValues)
  difficulty?: (typeof difficultyValues)[number];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  dueForReview?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  weakOnly?: boolean;
}
