SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.BGG_WebPushRecipients', 'U') IS NULL
CREATE TABLE dbo.BGG_WebPushRecipients (
  TKId int NOT NULL PRIMARY KEY
);

IF OBJECT_ID('dbo.BGG_WebPushSubscriptions', 'U') IS NULL
CREATE TABLE dbo.BGG_WebPushSubscriptions (
  EndpointHash varchar(64) NOT NULL PRIMARY KEY,
  TKId int NOT NULL,
  Subscription nvarchar(max) NOT NULL,
  UpdatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  LastTestAt datetime2 NULL
);

IF COL_LENGTH('dbo.BGG_WebPushSubscriptions', 'LastTestAt') IS NULL
ALTER TABLE dbo.BGG_WebPushSubscriptions ADD LastTestAt datetime2 NULL;

IF OBJECT_ID('dbo.BGG_WebPushOutbox', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.BGG_WebPushOutbox (
    Id bigint IDENTITY PRIMARY KEY,
    DonDatHangId int NOT NULL,
    EndpointHash varchar(64) NOT NULL,
    TKId int NOT NULL,
    Payload nvarchar(max) NOT NULL,
    Attempts int NOT NULL DEFAULT 0,
    State varchar(12) NOT NULL DEFAULT 'pending',
    NextAttemptAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LeaseUntil datetime2 NULL,
    CreatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastError nvarchar(300) NULL,
    CONSTRAINT UQ_BGG_WebPushOutbox UNIQUE (DonDatHangId, EndpointHash)
  );
  CREATE INDEX IX_BGG_WebPushOutbox_Pending ON dbo.BGG_WebPushOutbox(State, NextAttemptAt);
END;

COMMIT;
