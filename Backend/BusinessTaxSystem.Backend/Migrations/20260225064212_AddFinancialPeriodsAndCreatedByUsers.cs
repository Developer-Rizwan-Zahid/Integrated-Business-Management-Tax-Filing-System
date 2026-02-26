using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BusinessTaxSystem.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialPeriodsAndCreatedByUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Incomes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Incomes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Expenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Assets",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Assets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "FinancialPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    ClosedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ClosedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialPeriods", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_CreatedById",
                table: "Incomes",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CreatedById",
                table: "Expenses",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_CreatedById",
                table: "Assets",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Users_CreatedById",
                table: "Assets",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Users_CreatedById",
                table: "Expenses",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_Users_CreatedById",
                table: "Incomes",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Users_CreatedById",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Users_CreatedById",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_Users_CreatedById",
                table: "Incomes");

            migrationBuilder.DropTable(
                name: "FinancialPeriods");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_CreatedById",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_CreatedById",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Assets_CreatedById",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Assets");
        }
    }
}
