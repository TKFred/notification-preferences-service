import { DataSource } from 'typeorm';
import { Channel, NotificationType } from '../../http/dto/preferences.dto';
import { Region } from '../../http/dto/evaluation.dto';
import { GlobalPolicy } from '../../domain/entities/globalPolicy';
import { GlobalPolicyModel } from '../models/globalPolicyModel';
import { toGlobalPolicyEntity } from '../adapters/globalPolicyModelAdapter';

export class PoliciesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findBlockingPolicy(input: {
    notificationType: NotificationType;
    channel: Channel;
    region: Region;
  }): Promise<GlobalPolicy | null> {
    const policy = await this.dataSource
      .getRepository(GlobalPolicyModel)
      .findOne({
        where: [
          {
            notificationType: input.notificationType,
            channel: input.channel,
            region: input.region,
            enabled: true,
          },
          {
            notificationType: input.notificationType,
            channel: input.channel,
            region: 'GLOBAL',
            enabled: true,
          },
        ],
      });

    return policy ? toGlobalPolicyEntity(policy) : null;
  }
}