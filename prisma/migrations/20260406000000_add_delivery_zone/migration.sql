-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id"            TEXT        NOT NULL,
    "name"          TEXT        NOT NULL,
    "fee"           DECIMAL(10,2) NOT NULL,
    "estimatedDays" INTEGER     NOT NULL,
    "active"        BOOLEAN     NOT NULL DEFAULT true,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- Seed initial zones
INSERT INTO "DeliveryZone" ("id", "name", "fee", "estimatedDays", "active", "updatedAt") VALUES
  ('north',   'North',   75,  1, true, NOW()),
  ('central', 'Central', 50,  1, true, NOW()),
  ('south',   'South',   100, 2, true, NOW()),
  ('tobago',  'Tobago',  200, 3, true, NOW());
