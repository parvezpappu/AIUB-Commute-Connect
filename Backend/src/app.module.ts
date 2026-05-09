import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommuteModule } from './commute/commute.module';
import { ParticipationModule } from './participation/participation.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'parvez@627',
      database: 'AIUB_Commute_Connect',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    CommuteModule,
    ParticipationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
