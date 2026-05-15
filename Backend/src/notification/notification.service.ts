import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commute } from '../commute/entities/commute.entity';
import { User } from '../user/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createRequestDecisionNotification(
    user: User,
    commute: Commute,
    type: NotificationType,
  ) {
    const isAccepted = type === NotificationType.REQUEST_ACCEPTED;
    const message = isAccepted
      ? `Your request to join ${commute.fromLocation} to ${commute.toLocation} was accepted.`
      : `Your request to join ${commute.fromLocation} to ${commute.toLocation} was rejected.`;

    const notification = this.notificationRepository.create({
      user,
      commute,
      type,
      message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async createJoinRequestNotification(requester: User, commute: Commute) {
    const notification = this.notificationRepository.create({
      user: commute.creator,
      commute,
      type: NotificationType.JOIN_REQUEST,
      message: `${requester.fullName} requested to join ${commute.fromLocation} to ${commute.toLocation}.`,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async createCommuteCompletedNotification(user: User, commute: Commute) {
    const notification = this.notificationRepository.create({
      user,
      commute,
      type: NotificationType.COMMUTE_COMPLETED,
      message: `${commute.fromLocation} to ${commute.toLocation} is complete. Please rate your group.`,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  findMyNotifications(userId: number) {
    return this.notificationRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}
