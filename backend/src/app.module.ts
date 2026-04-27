import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnswersModule } from './answers/answers.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PracticeModule } from './practice/practice.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewModule } from './review/review.module';
import { TagsModule } from './tags/tags.module';
import { TopicsModule } from './topics/topics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TopicsModule,
    TagsModule,
    QuestionsModule,
    AnswersModule,
    PracticeModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
