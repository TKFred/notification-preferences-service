import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm";

export class CreateNotificationPreferencesTables1781202969763 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.createTable(
      new Table({
        name: "user_preferences",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "user_id",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "notification_type",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "channel",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "enabled",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraint(
      "user_preferences",
      new TableUnique({
        name: "uq_user_preferences_user_type_channel",
        columnNames: ["user_id", "notification_type", "channel"],
      }),
    );

    await queryRunner.createIndex(
      "user_preferences",
      new TableIndex({
        name: "idx_user_preferences_user_id",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "user_quiet_hours",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "user_id",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "enabled",
            type: "boolean",
            default: true,
          },
          {
            name: "start_time",
            type: "time",
            isNullable: false,
          },
          {
            name: "end_time",
            type: "time",
            isNullable: false,
          },
          {
            name: "timezone",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraint(
      "user_quiet_hours",
      new TableUnique({
        name: "uq_user_quiet_hours_user_id",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "global_policies",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "notification_type",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "channel",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "region",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "enabled",
            type: "boolean",
            default: true,
          },
          {
            name: "reason",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraint(
      "global_policies",
      new TableUnique({
        name: "uq_global_policies_type_channel_region",
        columnNames: ["notification_type", "channel", "region"],
      }),
    );

    await queryRunner.createIndex(
      "global_policies",
      new TableIndex({
        name: "idx_global_policies_lookup",
        columnNames: ["notification_type", "channel", "region"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "global_policies",
      "idx_global_policies_lookup",
    );
    await queryRunner.dropUniqueConstraint(
      "global_policies",
      "uq_global_policies_type_channel_region",
    );
    await queryRunner.dropTable("global_policies");

    await queryRunner.dropUniqueConstraint(
      "user_quiet_hours",
      "uq_user_quiet_hours_user_id",
    );
    await queryRunner.dropTable("user_quiet_hours");

    await queryRunner.dropIndex(
      "user_preferences",
      "idx_user_preferences_user_id",
    );
    await queryRunner.dropUniqueConstraint(
      "user_preferences",
      "uq_user_preferences_user_type_channel",
    );
    await queryRunner.dropTable("user_preferences");
  }
}
