-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserTheme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PREFLIGHT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('BASIQUE', 'CIBLE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('DAY');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InspirationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'VIDEO', 'AUDIO', 'EXERCISE', 'TOOL');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('YOUTUBE', 'VIMEO', 'CLOUDINARY', 'UPLOADTHING', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "VideoAssetStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WebhookSource" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "theme" "UserTheme" NOT NULL DEFAULT 'SYSTEM',
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "maxConcurrentPrograms" INTEGER,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "settings" JSONB,
    "metadata" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverUrl" TEXT,
    "level" "ProgramLevel",
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "estMinutesPerDay" INTEGER NOT NULL DEFAULT 20,
    "unitsCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" TEXT NOT NULL DEFAULT 'fr',
    "hero" JSONB,
    "card" JSONB,
    "meta" JSONB,
    "marketing" JSONB,
    "highlights" JSONB,
    "curriculum" JSONB,
    "faq" JSONB,
    "seo" JSONB,
    "price" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "programSlug" TEXT NOT NULL,
    "unitType" "UnitType" NOT NULL DEFAULT 'DAY',
    "unitIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 20,
    "mantra" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "contentParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB,
    "journalSchema" JSONB,
    "validationSchema" JSONB,
    "status" "UnitStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programSlug" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "introEngaged" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayState" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programSlug" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "answers" JSONB,
    "practiced" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaselineScore" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "j1Energie" INTEGER,
    "j1Focus" INTEGER,
    "j1Paix" INTEGER,
    "j1Estime" INTEGER,
    "j7Energie" INTEGER,
    "j7Focus" INTEGER,
    "j7Paix" INTEGER,
    "j7Estime" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaselineScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT,
    "icon" TEXT,
    "imagePath" TEXT,
    "imageAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "coverPath" TEXT NOT NULL DEFAULT '',
    "coverAlt" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "canonicalUrl" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "readingTimeMin" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "authorEmail" TEXT NOT NULL DEFAULT '',
    "deletedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspiration" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "InspirationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "curatorEmail" TEXT,
    "deletedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confirmToken" TEXT,
    "unsubToken" TEXT,
    "consentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "description" TEXT,
    "minutes" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverUrl" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "programSlug" TEXT,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripePriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "programSlug" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amountCents" INTEGER,
    "currency" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAsset" (
    "id" TEXT NOT NULL,
    "programSlug" TEXT,
    "unitId" TEXT,
    "provider" "VideoProvider" NOT NULL DEFAULT 'EXTERNAL',
    "videoId" TEXT,
    "sourceUrl" TEXT,
    "posterUrl" TEXT,
    "captionsUrl" TEXT,
    "chaptersUrl" TEXT,
    "transcriptUrl" TEXT,
    "status" "VideoAssetStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "choices" JSONB,
    "metadata" JSONB,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" "WebhookSource" NOT NULL DEFAULT 'STRIPE',
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_suspendedAt_idx" ON "User"("suspendedAt");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_status_idx" ON "Program"("status");

-- CreateIndex
CREATE INDEX "Program_deletedAt_idx" ON "Program"("deletedAt");

-- CreateIndex
CREATE INDEX "Program_level_idx" ON "Program"("level");

-- CreateIndex

-- CreateIndex
CREATE INDEX "Unit_programSlug_idx" ON "Unit"("programSlug");

-- CreateIndex
CREATE INDEX "Unit_status_idx" ON "Unit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_programSlug_unitType_unitIndex_key" ON "Unit"("programSlug", "unitType", "unitIndex");

-- CreateIndex

-- CreateIndex
CREATE INDEX "Enrollment_programSlug_idx" ON "Enrollment"("programSlug");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_programSlug_key" ON "Enrollment"("userId", "programSlug");

-- CreateIndex

-- CreateIndex
CREATE INDEX "DayState_userId_programSlug_dayIndex_idx" ON "DayState"("userId", "programSlug", "dayIndex");

-- CreateIndex
CREATE INDEX "DayState_programSlug_idx" ON "DayState"("programSlug");

-- CreateIndex
CREATE INDEX "DayState_completed_idx" ON "DayState"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "DayState_enrollmentId_dayIndex_key" ON "DayState"("enrollmentId", "dayIndex");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "BaselineScore_enrollmentId_key" ON "BaselineScore"("enrollmentId");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_deletedAt_idx" ON "BlogPost"("deletedAt");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "Inspiration_slug_key" ON "Inspiration"("slug");

-- CreateIndex
CREATE INDEX "Inspiration_status_idx" ON "Inspiration"("status");

-- CreateIndex
CREATE INDEX "Inspiration_publishedAt_idx" ON "Inspiration"("publishedAt");

-- CreateIndex
CREATE INDEX "Inspiration_deletedAt_idx" ON "Inspiration"("deletedAt");

-- CreateIndex
CREATE INDEX "Inspiration_curatorEmail_idx" ON "Inspiration"("curatorEmail");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_confirmToken_key" ON "NewsletterSubscriber"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubToken_key" ON "NewsletterSubscriber"("unsubToken");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_stripePriceId_key" ON "Product"("stripePriceId");

-- CreateIndex
CREATE INDEX "Product_programSlug_idx" ON "Product"("programSlug");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripePaymentIntentId_key" ON "Purchase"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE INDEX "Purchase_productId_idx" ON "Purchase"("productId");

-- CreateIndex
CREATE INDEX "Purchase_programSlug_idx" ON "Purchase"("programSlug");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VideoAsset_unitId_key" ON "VideoAsset"("unitId");

-- CreateIndex
CREATE INDEX "VideoAsset_programSlug_idx" ON "VideoAsset"("programSlug");

-- CreateIndex
CREATE INDEX "VideoAsset_provider_idx" ON "VideoAsset"("provider");

-- CreateIndex
CREATE INDEX "VideoAsset_status_idx" ON "VideoAsset"("status");

-- CreateIndex
CREATE INDEX "ConsentLog_userId_idx" ON "ConsentLog"("userId");

-- CreateIndex
CREATE INDEX "ConsentLog_type_idx" ON "ConsentLog"("type");

-- CreateIndex
CREATE INDEX "ConsentLog_acceptedAt_idx" ON "ConsentLog"("acceptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_idx" ON "WebhookEvent"("source");

-- CreateIndex
CREATE INDEX "WebhookEvent_type_idx" ON "WebhookEvent"("type");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayState" ADD CONSTRAINT "DayState_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayState" ADD CONSTRAINT "DayState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayState" ADD CONSTRAINT "DayState_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaselineScore" ADD CONSTRAINT "BaselineScore_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAsset" ADD CONSTRAINT "VideoAsset_programSlug_fkey" FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAsset" ADD CONSTRAINT "VideoAsset_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
