import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { ok } from '../common/types/api-response.type';
import { ListReviewQueryDto } from './dto/list-review-query.dto';
import { ReviewService } from './review.service';

@Controller('review')
@UseGuards(AuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  async due(@CurrentUser() user: AuthUser, @Query() query: ListReviewQueryDto) {
    const data = await this.reviewService.getDue(user.id, query.limit ?? 20);
    return ok(data);
  }

  @Get('weak')
  async weak(
    @CurrentUser() user: AuthUser,
    @Query() query: ListReviewQueryDto,
  ) {
    const data = await this.reviewService.getWeak(user.id, query.limit ?? 20);
    return ok(data);
  }

  @Get('summary')
  async summary(@CurrentUser() user: AuthUser) {
    const data = await this.reviewService.getSummary(user.id);
    return ok(data);
  }
}
