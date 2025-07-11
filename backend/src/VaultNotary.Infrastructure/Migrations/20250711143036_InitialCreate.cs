using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VaultNotary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    gender = table.Column<int>(type: "integer", nullable: false),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    document_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    passport_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    business_registration_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    business_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    secretary = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    notary_public = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    transaction_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    document_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_documents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_files",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    s3_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    s3_bucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_document_files", x => x.id);
                    table.ForeignKey(
                        name: "fk_document_files_documents_document_id",
                        column: x => x.document_id,
                        principalTable: "documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "party_document_links",
                columns: table => new
                {
                    document_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    customer_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    party_role = table.Column<string>(type: "text", nullable: false),
                    signature_status = table.Column<string>(type: "text", nullable: false),
                    notary_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_party_document_links", x => new { x.document_id, x.customer_id });
                    table.ForeignKey(
                        name: "fk_party_document_links_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_party_document_links_documents_document_id",
                        column: x => x.document_id,
                        principalTable: "documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_customers_document_id",
                table: "customers",
                column: "document_id");

            migrationBuilder.CreateIndex(
                name: "ix_customers_full_name",
                table: "customers",
                column: "full_name");

            migrationBuilder.CreateIndex(
                name: "ix_document_files_document_id",
                table: "document_files",
                column: "document_id");

            migrationBuilder.CreateIndex(
                name: "ix_documents_created_date",
                table: "documents",
                column: "created_date");

            migrationBuilder.CreateIndex(
                name: "ix_documents_document_type",
                table: "documents",
                column: "document_type");

            migrationBuilder.CreateIndex(
                name: "ix_documents_notary_public",
                table: "documents",
                column: "notary_public");

            migrationBuilder.CreateIndex(
                name: "ix_documents_secretary",
                table: "documents",
                column: "secretary");

            migrationBuilder.CreateIndex(
                name: "ix_documents_transaction_code",
                table: "documents",
                column: "transaction_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_party_document_links_customer_id",
                table: "party_document_links",
                column: "customer_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "document_files");

            migrationBuilder.DropTable(
                name: "party_document_links");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "documents");
        }
    }
}
