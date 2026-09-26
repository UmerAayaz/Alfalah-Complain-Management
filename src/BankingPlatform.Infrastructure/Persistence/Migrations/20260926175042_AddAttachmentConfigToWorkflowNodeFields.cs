using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAttachmentConfigToWorkflowNodeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
