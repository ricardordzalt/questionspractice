import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { ok } from '../common/types/api-response.type';
import { StartPracticeSessionDto } from './dto/start-practice-session.dto';
import { SubmitPracticeAttemptDto } from './dto/submit-practice-attempt.dto';
import { PracticeService } from './practice.service';

@Controller('practice')
@UseGuards(AuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('start')
  async start(
    @CurrentUser() user: AuthUser,
    @Body() body: StartPracticeSessionDto,
  ) {
    const result = await this.practiceService.startSession(user.id, body);
    return ok(result);
  }

  @Post('answer')
  async answer(
    @CurrentUser() user: AuthUser,
    @Body() body: SubmitPracticeAttemptDto,
  ) {
    const result = await this.practiceService.submitAttempt(user.id, body);
    return ok(result);
  }
}
