using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BEdu.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonAccessCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LessonActivationCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    RedeemedByStudentId = table.Column<int>(type: "int", nullable: true),
                    RedeemedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonActivationCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonActivationCodes_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonActivationCodes_Users_RedeemedByStudentId",
                        column: x => x.RedeemedByStudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StudentLessonAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentLessonAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentLessonAccesses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentLessonAccesses_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LessonActivationCodes_Code",
                table: "LessonActivationCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LessonActivationCodes_LessonId",
                table: "LessonActivationCodes",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonActivationCodes_RedeemedByStudentId",
                table: "LessonActivationCodes",
                column: "RedeemedByStudentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentLessonAccesses_LessonId",
                table: "StudentLessonAccesses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentLessonAccesses_StudentId_LessonId",
                table: "StudentLessonAccesses",
                columns: new[] { "StudentId", "LessonId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LessonActivationCodes");

            migrationBuilder.DropTable(
                name: "StudentLessonAccesses");
        }
    }
}
