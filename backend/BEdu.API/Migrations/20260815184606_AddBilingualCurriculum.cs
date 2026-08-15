using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BEdu.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBilingualCurriculum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Courses_CourseId",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Courses_CourseId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "Lessons");

            migrationBuilder.RenameColumn(
                name: "Text",
                table: "Questions",
                newName: "TextEn");

            migrationBuilder.RenameColumn(
                name: "VideoUrl",
                table: "Lessons",
                newName: "VideoUrlEn");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Lessons",
                newName: "TitleEn");

            migrationBuilder.RenameColumn(
                name: "PdfUrl",
                table: "Lessons",
                newName: "VideoUrlAr");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "Lessons",
                newName: "OrderIndex");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Lessons",
                newName: "ChapterId");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons",
                newName: "IX_Lessons_ChapterId");

            migrationBuilder.RenameColumn(
                name: "Text",
                table: "AnswerOptions",
                newName: "TextEn");

            migrationBuilder.AddColumn<string>(
                name: "TextAr",
                table: "Questions",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Lessons",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PdfUrlAr",
                table: "Lessons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfUrlEn",
                table: "Lessons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleAr",
                table: "Lessons",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TextAr",
                table: "AnswerOptions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Tracks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CourseId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tracks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tracks_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Chapters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    TrackId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chapters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Chapters_Tracks_TrackId",
                        column: x => x.TrackId,
                        principalTable: "Tracks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplementaryResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UrlAr = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UrlEn = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ChapterId = table.Column<int>(type: "int", nullable: true),
                    LessonId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementaryResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplementaryResources_Chapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "Chapters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SupplementaryResources_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_TrackId",
                table: "Chapters",
                column: "TrackId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementaryResources_ChapterId",
                table: "SupplementaryResources",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplementaryResources_LessonId",
                table: "SupplementaryResources",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Tracks_CourseId",
                table: "Tracks",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Courses_CourseId",
                table: "Exams",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Chapters_ChapterId",
                table: "Lessons",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Courses_CourseId",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Chapters_ChapterId",
                table: "Lessons");

            migrationBuilder.DropTable(
                name: "SupplementaryResources");

            migrationBuilder.DropTable(
                name: "Chapters");

            migrationBuilder.DropTable(
                name: "Tracks");

            migrationBuilder.DropColumn(
                name: "TextAr",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "PdfUrlAr",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "PdfUrlEn",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "TitleAr",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "TextAr",
                table: "AnswerOptions");

            migrationBuilder.RenameColumn(
                name: "TextEn",
                table: "Questions",
                newName: "Text");

            migrationBuilder.RenameColumn(
                name: "VideoUrlEn",
                table: "Lessons",
                newName: "VideoUrl");

            migrationBuilder.RenameColumn(
                name: "VideoUrlAr",
                table: "Lessons",
                newName: "PdfUrl");

            migrationBuilder.RenameColumn(
                name: "TitleEn",
                table: "Lessons",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "OrderIndex",
                table: "Lessons",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "ChapterId",
                table: "Lessons",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_ChapterId",
                table: "Lessons",
                newName: "IX_Lessons_CourseId");

            migrationBuilder.RenameColumn(
                name: "TextEn",
                table: "AnswerOptions",
                newName: "Text");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Lessons",
                type: "nvarchar(max)",
                maxLength: 5000,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Courses_CourseId",
                table: "Exams",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Courses_CourseId",
                table: "Lessons",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
