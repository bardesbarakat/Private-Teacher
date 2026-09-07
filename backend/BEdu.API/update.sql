BEGIN TRANSACTION;
GO

CREATE TABLE [LessonActivationCodes] (
    [Id] int NOT NULL IDENTITY,
    [Code] nvarchar(20) NOT NULL,
    [LessonId] int NOT NULL,
    [RedeemedByStudentId] int NULL,
    [RedeemedAt] datetime2 NULL,
    [IsUsed] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NULL,
    CONSTRAINT [PK_LessonActivationCodes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LessonActivationCodes_Lessons_LessonId] FOREIGN KEY ([LessonId]) REFERENCES [Lessons] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LessonActivationCodes_Users_RedeemedByStudentId] FOREIGN KEY ([RedeemedByStudentId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
);
GO

CREATE TABLE [StudentLessonAccesses] (
    [Id] int NOT NULL IDENTITY,
    [StudentId] int NOT NULL,
    [LessonId] int NOT NULL,
    [UnlockedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_StudentLessonAccesses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StudentLessonAccesses_Lessons_LessonId] FOREIGN KEY ([LessonId]) REFERENCES [Lessons] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_StudentLessonAccesses_Users_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO

CREATE UNIQUE INDEX [IX_LessonActivationCodes_Code] ON [LessonActivationCodes] ([Code]);
GO

CREATE INDEX [IX_LessonActivationCodes_LessonId] ON [LessonActivationCodes] ([LessonId]);
GO

CREATE INDEX [IX_LessonActivationCodes_RedeemedByStudentId] ON [LessonActivationCodes] ([RedeemedByStudentId]);
GO

CREATE INDEX [IX_StudentLessonAccesses_LessonId] ON [StudentLessonAccesses] ([LessonId]);
GO

CREATE UNIQUE INDEX [IX_StudentLessonAccesses_StudentId_LessonId] ON [StudentLessonAccesses] ([StudentId], [LessonId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907171048_AddLessonAccessCodes', N'8.0.0');
GO

COMMIT;
GO

