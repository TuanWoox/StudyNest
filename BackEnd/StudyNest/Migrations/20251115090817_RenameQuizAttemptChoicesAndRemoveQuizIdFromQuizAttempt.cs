using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyNest.Migrations
{
    /// <inheritdoc />
    public partial class RenameQuizAttemptChoicesAndRemoveQuizIdFromQuizAttempt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizAttempts_Quizzes_QuizId",
                table: "QuizAttempts");

            //migrationBuilder.DropTable(
            //    name: "QuizAttempAnswerChoices");

            migrationBuilder.DropIndex(
                name: "IX_QuizAttempts_QuizId",
                table: "QuizAttempts");

            migrationBuilder.DropColumn(
                name: "QuizId",
                table: "QuizAttempts");

            //migrationBuilder.CreateTable(
            //    name: "QuizAttemptAnswerChoices",
            //    columns: table => new
            //    {
            //        Id = table.Column<string>(type: "text", nullable: false),
            //        QuizAttemptAnswerId = table.Column<string>(type: "text", nullable: false),
            //        ChoiceId = table.Column<string>(type: "text", nullable: false),
            //        DateCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            //        DateModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            //        Deleted = table.Column<bool>(type: "boolean", nullable: false),
            //        DateDeleted = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_QuizAttemptAnswerChoices", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_QuizAttemptAnswerChoices_QuizAttemptAnswers_QuizAttemptAnsw~",
            //            column: x => x.QuizAttemptAnswerId,
            //            principalTable: "QuizAttemptAnswers",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_QuizAttemptAnswerChoices_Deleted",
            //    table: "QuizAttemptAnswerChoices",
            //    column: "Deleted");

            //migrationBuilder.CreateIndex(
            //    name: "IX_QuizAttemptAnswerChoices_QuizAttemptAnswerId",
            //    table: "QuizAttemptAnswerChoices",
            //    column: "QuizAttemptAnswerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropTable(
            //    name: "QuizAttemptAnswerChoices");

            migrationBuilder.AddColumn<string>(
                name: "QuizId",
                table: "QuizAttempts",
                type: "text",
                nullable: false,
                defaultValue: "");

            //migrationBuilder.CreateTable(
            //    name: "QuizAttempAnswerChoices",
            //    columns: table => new
            //    {
            //        Id = table.Column<string>(type: "text", nullable: false),
            //        QuizAttemptAnswerId = table.Column<string>(type: "text", nullable: true),
            //        ChoiceId = table.Column<string>(type: "text", nullable: false),
            //        DateCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            //        DateDeleted = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            //        DateModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            //        Deleted = table.Column<bool>(type: "boolean", nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_QuizAttempAnswerChoices", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_QuizAttempAnswerChoices_QuizAttemptAnswers_QuizAttemptAnswe~",
            //            column: x => x.QuizAttemptAnswerId,
            //            principalTable: "QuizAttemptAnswers",
            //            principalColumn: "Id");
            //    });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizId",
                table: "QuizAttempts",
                column: "QuizId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_QuizAttempAnswerChoices_Deleted",
            //    table: "QuizAttempAnswerChoices",
            //    column: "Deleted");

            //migrationBuilder.CreateIndex(
            //    name: "IX_QuizAttempAnswerChoices_QuizAttemptAnswerId",
            //    table: "QuizAttempAnswerChoices",
            //    column: "QuizAttemptAnswerId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuizAttempts_Quizzes_QuizId",
                table: "QuizAttempts",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
