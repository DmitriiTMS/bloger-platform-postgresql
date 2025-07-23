import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokens extends BaseEntity {

  @Column({ type: 'varchar' })
  refreshToken: string;
  
}
