using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MoveAttachmentConfigToSeparateTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowMultiple",
                table: "WorkflowNodeFields");

            migrationBuilder.DropColumn(
                name: "AllowedFileTypesJson",
                table: "WorkflowNodeFields");

            migrationBuilder.DropColumn(
                name: "MaxFileSizeMb",
                table: "WorkflowNodeFields");

            migrationBuilder.CreateTable(
                name: "WorkflowNodeFieldAttachmentConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowNodeFieldId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowedFileTypesJson = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaxFileSizeMb = table.Column<int>(type: "int", nullable: true),
                    AllowMultiple = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowNodeFieldAttachmentConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowNodeFieldAttachmentConfigs_WorkflowNodeFields_WorkflowNodeFieldId",
                        column: x => x.WorkflowNodeFieldId,
                        principalTable: "WorkflowNodeFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowNodeFieldAttachmentConfigs_WorkflowNodeFieldId",
                table: "WorkflowNodeFieldAttachmentConfigs",
                column: "WorkflowNodeFieldId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkflowNodeFieldAttachmentConfigs");

            migrationBuilder.AddColumn<bool>(
                name: "AllowMultiple",
                table: "WorkflowNodeFields",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AllowedFileTypesJson",
                table: "WorkflowNodeFields",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxFileSizeMb",
                table: "WorkflowNodeFields",
                type: "int",
                nullable: true);
        }
    }
}
