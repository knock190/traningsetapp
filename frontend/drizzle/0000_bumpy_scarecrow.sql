CREATE TABLE "workout_records" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"exercise_name" text NOT NULL,
	"reps" integer NOT NULL,
	"sets" integer NOT NULL,
	"note" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
