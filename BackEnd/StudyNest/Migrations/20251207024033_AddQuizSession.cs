using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyNest.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuizSessionId",
                table: "QuizAttempts",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "QuizSessions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    GamePin = table.Column<string>(type: "text", nullable: false),
                    CurrentQuestionIndex = table.Column<int>(type: "integer", nullable: false),
                    TimeForEachQuestion = table.Column<int>(type: "integer", nullable: false),
                    DateTimeEnded = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    QuizAttemptSnapshotId = table.Column<string>(type: "text", nullable: false),
                    OwnerId = table.Column<string>(type: "text", nullable: false),
                    DateCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DateModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Deleted = table.Column<bool>(type: "boolean", nullable: false),
                    DateDeleted = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizSessions_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizSessions_QuizAttemptSnapshots_QuizAttemptSnapshotId",
                        column: x => x.QuizAttemptSnapshotId,
                        principalTable: "QuizAttemptSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizSessionId",
                table: "QuizAttempts",
                column: "QuizSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSessions_Deleted",
                table: "QuizSessions",
                column: "Deleted");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSessions_OwnerId",
                table: "QuizSessions",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSessions_QuizAttemptSnapshotId",
                table: "QuizSessions",
                column: "QuizAttemptSnapshotId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuizAttempts_QuizSessions_QuizSessionId",
                table: "QuizAttempts",
                column: "QuizSessionId",
                principalTable: "QuizSessions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizAttempts_QuizSessions_QuizSessionId",
                table: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "QuizSessions");

            migrationBuilder.DropIndex(
                name: "IX_QuizAttempts_QuizSessionId",
                table: "QuizAttempts");

            migrationBuilder.DropColumn(
                name: "QuizSessionId",
                table: "QuizAttempts");
        }
    }
}
