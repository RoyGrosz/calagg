-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "encryptedRefreshToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarRef" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "googleCalendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ignored',
    "syncToken" TEXT,
    "timeZone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRoute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceCalId" TEXT NOT NULL,
    "targetCalId" TEXT NOT NULL,
    "privacyMode" TEXT NOT NULL DEFAULT 'full',
    "titlePrefix" TEXT NOT NULL DEFAULT '',
    "busyTitle" TEXT NOT NULL DEFAULT 'Busy',
    "colorOverride" TEXT,
    "filters" TEXT NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastSyncStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMap" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "sourceCalendarId" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "targetEventId" TEXT NOT NULL,
    "sourceUpdated" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "routeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAccount_googleSub_key" ON "GoogleAccount"("googleSub");

-- CreateIndex
CREATE INDEX "GoogleAccount_userId_idx" ON "GoogleAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarRef_accountId_googleCalendarId_key" ON "CalendarRef"("accountId", "googleCalendarId");

-- CreateIndex
CREATE INDEX "SyncRoute_userId_idx" ON "SyncRoute"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMap_sourceCalendarId_sourceEventId_key" ON "EventMap"("sourceCalendarId", "sourceEventId");

-- CreateIndex
CREATE INDEX "EventMap_routeId_idx" ON "EventMap"("routeId");

-- CreateIndex
CREATE INDEX "EventMap_targetEventId_idx" ON "EventMap"("targetEventId");

-- CreateIndex
CREATE INDEX "SyncJob_userId_idx" ON "SyncJob"("userId");

-- AddForeignKey
ALTER TABLE "GoogleAccount" ADD CONSTRAINT "GoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarRef" ADD CONSTRAINT "CalendarRef_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GoogleAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRoute" ADD CONSTRAINT "SyncRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRoute" ADD CONSTRAINT "SyncRoute_sourceCalId_fkey" FOREIGN KEY ("sourceCalId") REFERENCES "CalendarRef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRoute" ADD CONSTRAINT "SyncRoute_targetCalId_fkey" FOREIGN KEY ("targetCalId") REFERENCES "CalendarRef"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMap" ADD CONSTRAINT "EventMap_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "SyncRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
