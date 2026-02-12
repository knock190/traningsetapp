ALTER TABLE "workout_records" ADD COLUMN "owner_id" text;
--> statement-breakpoint
UPDATE "workout_records"
SET "owner_id" = COALESCE(
  (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1),
  'legacy'
)
WHERE "owner_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "workout_records" ALTER COLUMN "owner_id" SET NOT NULL;
--> statement-breakpoint
CREATE INDEX "workout_records_owner_id_idx" ON "workout_records" USING btree ("owner_id");
