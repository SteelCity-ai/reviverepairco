CREATE TYPE "public"."change_order_status" AS ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."checklist_instance_status" AS ENUM('IN_PROGRESS', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."checklist_item_status" AS ENUM('PENDING', 'PASS', 'FAIL');--> statement-breakpoint
CREATE TYPE "public"."comment_entity_type" AS ENUM('PROJECT', 'WORK_TYPE', 'MAIN_TASK', 'DAILY_TASK');--> statement-breakpoint
CREATE TYPE "public"."daily_task_status" AS ENUM('NOT_STARTED', 'DONE');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('CONTRACT', 'PERMIT', 'RECEIPT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('NOT_INVOICED', 'INVOICED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."main_task_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'PM_REVIEW', 'CLIENT_SIGNOFF', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."photo_pm_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."punch_item_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."selection_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'CREW', 'CLIENT');--> statement-breakpoint
CREATE TYPE "public"."work_type_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"actor_user_id" uuid,
	"verb" varchar(100) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "change_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"reason" text,
	"cost_impact" numeric(12, 2),
	"schedule_impact" jsonb,
	"status" "change_order_status" DEFAULT 'DRAFT' NOT NULL,
	"affected_main_task_ids" uuid[],
	"created_by_user_id" uuid NOT NULL,
	"client_approved_at" timestamp with time zone,
	"client_approved_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"work_type_id" uuid,
	"main_task_id" uuid,
	"status" "checklist_instance_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" uuid NOT NULL,
	"template_item_index" integer NOT NULL,
	"status" "checklist_item_status" DEFAULT 'PENDING' NOT NULL,
	"completed_by_user_id" uuid,
	"completed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "checklist_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"items" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"primary_contact_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"billing_address" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "comment_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completion_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"main_task_id" uuid NOT NULL,
	"compiled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"compiled_by_user_id" uuid,
	"client_view_token" varchar(255) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "completion_document_main_task_id_unique" UNIQUE("main_task_id"),
	CONSTRAINT "completion_document_client_view_token_unique" UNIQUE("client_view_token")
);
--> statement-breakpoint
CREATE TABLE "daily_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"weather" jsonb,
	"crew_notes" text,
	"delays" text,
	"safety_notes" text,
	"photos" jsonb DEFAULT '[]' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"main_task_id" uuid NOT NULL,
	"assigned_to_user_id" uuid,
	"scheduled_date" date,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "daily_task_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by_user_id" uuid,
	"crew_notes" text,
	"hours_logged" numeric(5, 2),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_type_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "main_task_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"pm_reviewed_at" timestamp with time zone,
	"pm_reviewed_by_user_id" uuid,
	"client_signed_at" timestamp with time zone,
	"client_signed_by_user_id" uuid,
	"client_signature_name" varchar(255),
	"completion_document_id" uuid,
	"materials" jsonb DEFAULT '[]' NOT NULL,
	"start_date" date,
	"end_date" date,
	"estimated_duration_days" integer,
	"depends_on" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"site_address" jsonb,
	"status" "project_status" DEFAULT 'PLANNED' NOT NULL,
	"project_manager_user_id" uuid,
	"start_date" date,
	"target_end_date" date,
	"actual_end_date" date,
	"invoice_status" "invoice_status" DEFAULT 'NOT_INVOICED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"object_key" varchar(500) NOT NULL,
	"original_filename" varchar(255),
	"mime_type" varchar(100),
	"size_bytes" integer,
	"uploaded_by_user_id" uuid,
	"category" "document_category" DEFAULT 'OTHER' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "punch_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"work_type_id" uuid,
	"description" text NOT NULL,
	"assignee_id" uuid,
	"photos" jsonb DEFAULT '[]' NOT NULL,
	"deadline" date,
	"status" "punch_item_status" DEFAULT 'OPEN' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"verified_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "selection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"work_type_id" uuid,
	"main_task_id" uuid,
	"name" varchar(255) NOT NULL,
	"options" jsonb DEFAULT '[]' NOT NULL,
	"deadline" date,
	"client_choice" integer,
	"status" "selection_status" DEFAULT 'PENDING' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_task_id" uuid NOT NULL,
	"object_key" varchar(500) NOT NULL,
	"original_filename" varchar(255),
	"mime_type" varchar(100),
	"size_bytes" integer,
	"uploaded_by_user_id" uuid,
	"pm_status" "photo_pm_status" DEFAULT 'PENDING' NOT NULL,
	"pm_reject_reason" text,
	"caption" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"daily_task_id" uuid,
	"clock_in" timestamp with time zone NOT NULL,
	"clock_out" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'CREW' NOT NULL,
	"client_id" uuid,
	"display_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profile_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "work_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "work_type_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_user_id_user_profile_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_created_by_user_id_user_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_order" ADD CONSTRAINT "change_order_client_approved_by_user_id_user_profile_id_fk" FOREIGN KEY ("client_approved_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_instance" ADD CONSTRAINT "checklist_instance_template_id_checklist_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_instance" ADD CONSTRAINT "checklist_instance_work_type_id_work_type_id_fk" FOREIGN KEY ("work_type_id") REFERENCES "public"."work_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_instance" ADD CONSTRAINT "checklist_instance_main_task_id_main_task_id_fk" FOREIGN KEY ("main_task_id") REFERENCES "public"."main_task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item_instance" ADD CONSTRAINT "checklist_item_instance_instance_id_checklist_instance_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."checklist_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item_instance" ADD CONSTRAINT "checklist_item_instance_completed_by_user_id_user_profile_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_user_id_user_profile_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion_document" ADD CONSTRAINT "completion_document_main_task_id_main_task_id_fk" FOREIGN KEY ("main_task_id") REFERENCES "public"."main_task"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion_document" ADD CONSTRAINT "completion_document_compiled_by_user_id_user_profile_id_fk" FOREIGN KEY ("compiled_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_created_by_user_id_user_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_main_task_id_main_task_id_fk" FOREIGN KEY ("main_task_id") REFERENCES "public"."main_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_assigned_to_user_id_user_profile_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_completed_by_user_id_user_profile_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main_task" ADD CONSTRAINT "main_task_work_type_id_work_type_id_fk" FOREIGN KEY ("work_type_id") REFERENCES "public"."work_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main_task" ADD CONSTRAINT "main_task_pm_reviewed_by_user_id_user_profile_id_fk" FOREIGN KEY ("pm_reviewed_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main_task" ADD CONSTRAINT "main_task_client_signed_by_user_id_user_profile_id_fk" FOREIGN KEY ("client_signed_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main_task" ADD CONSTRAINT "main_task_depends_on_main_task_id_fk" FOREIGN KEY ("depends_on") REFERENCES "public"."main_task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_project_manager_user_id_user_profile_id_fk" FOREIGN KEY ("project_manager_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_uploaded_by_user_id_user_profile_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "punch_item" ADD CONSTRAINT "punch_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "punch_item" ADD CONSTRAINT "punch_item_work_type_id_work_type_id_fk" FOREIGN KEY ("work_type_id") REFERENCES "public"."work_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "punch_item" ADD CONSTRAINT "punch_item_assignee_id_user_profile_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "punch_item" ADD CONSTRAINT "punch_item_created_by_user_id_user_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "punch_item" ADD CONSTRAINT "punch_item_verified_by_user_id_user_profile_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection" ADD CONSTRAINT "selection_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection" ADD CONSTRAINT "selection_work_type_id_work_type_id_fk" FOREIGN KEY ("work_type_id") REFERENCES "public"."work_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection" ADD CONSTRAINT "selection_main_task_id_main_task_id_fk" FOREIGN KEY ("main_task_id") REFERENCES "public"."main_task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection" ADD CONSTRAINT "selection_created_by_user_id_user_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_photo" ADD CONSTRAINT "task_photo_daily_task_id_daily_task_id_fk" FOREIGN KEY ("daily_task_id") REFERENCES "public"."daily_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_photo" ADD CONSTRAINT "task_photo_uploaded_by_user_id_user_profile_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_user_id_user_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_daily_task_id_daily_task_id_fk" FOREIGN KEY ("daily_task_id") REFERENCES "public"."daily_task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_type" ADD CONSTRAINT "work_type_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_project" ON "activity_log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_activity_created" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_change_order_project" ON "change_order" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_change_order_status" ON "change_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_checklist_instance_template" ON "checklist_instance" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_instance_work_type" ON "checklist_instance" USING btree ("work_type_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_instance_main_task" ON "checklist_instance" USING btree ("main_task_id");--> statement-breakpoint
CREATE INDEX "idx_checklist_item_instance" ON "checklist_item_instance" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_comment_entity" ON "comment" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_comment_author" ON "comment" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "idx_completion_doc_token" ON "completion_document" USING btree ("client_view_token");--> statement-breakpoint
CREATE INDEX "idx_daily_log_project_date" ON "daily_log" USING btree ("project_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_daily_log_project_date" ON "daily_log" USING btree ("project_id","date");--> statement-breakpoint
CREATE INDEX "idx_daily_task_main" ON "daily_task" USING btree ("main_task_id");--> statement-breakpoint
CREATE INDEX "idx_daily_task_assignee" ON "daily_task" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_task_date" ON "daily_task" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_daily_task_status" ON "daily_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_main_task_work_type" ON "main_task" USING btree ("work_type_id");--> statement-breakpoint
CREATE INDEX "idx_main_task_status" ON "main_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_main_task_depends_on" ON "main_task" USING btree ("depends_on");--> statement-breakpoint
CREATE INDEX "idx_project_client" ON "project" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_project_status" ON "project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_project_pm" ON "project" USING btree ("project_manager_user_id");--> statement-breakpoint
CREATE INDEX "idx_project_doc_project" ON "project_document" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_doc_category" ON "project_document" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_punch_project" ON "punch_item" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_punch_assignee" ON "punch_item" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_punch_status" ON "punch_item" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_selection_project" ON "selection" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_selection_status" ON "selection" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_task_photo_daily" ON "task_photo" USING btree ("daily_task_id");--> statement-breakpoint
CREATE INDEX "idx_task_photo_pm_status" ON "task_photo" USING btree ("pm_status");--> statement-breakpoint
CREATE INDEX "idx_time_entry_user" ON "time_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_time_entry_project" ON "time_entry" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_time_entry_clock_in" ON "time_entry" USING btree ("clock_in");--> statement-breakpoint
CREATE INDEX "idx_user_profile_clerk" ON "user_profile" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profile_client" ON "user_profile" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_user_profile_role" ON "user_profile" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_work_type_project" ON "work_type" USING btree ("project_id");