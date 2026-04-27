import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

const ratingValues = ['again', 'hard', 'good', 'easy'] as const;

export class SubmitPracticeAttemptDto {
  @IsString()
  questionId!: string;

  @IsString()
  @IsIn(ratingValues)
  rating!: (typeof ratingValues)[number];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  revealedAnswer?: boolean;
}
