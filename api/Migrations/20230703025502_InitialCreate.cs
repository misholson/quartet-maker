using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Arrangers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arrangers", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Songs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Composer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lyricist = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublishYear = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Songs", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredPart = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Arrangement",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BHSCatalogID = table.Column<int>(type: "int", nullable: false),
                    SongID = table.Column<int>(type: "int", nullable: true),
                    ArrangerID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arrangement", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Arrangement_Arrangers_ArrangerID",
                        column: x => x.ArrangerID,
                        principalTable: "Arrangers",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Arrangement_Songs_SongID",
                        column: x => x.SongID,
                        principalTable: "Songs",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "KnownArrangement",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    ArrangementID = table.Column<int>(type: "int", nullable: true),
                    Part = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnownArrangement", x => x.ID);
                    table.ForeignKey(
                        name: "FK_KnownArrangement_Arrangement_ArrangementID",
                        column: x => x.ArrangementID,
                        principalTable: "Arrangement",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_KnownArrangement_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Arrangement_ArrangerID",
                table: "Arrangement",
                column: "ArrangerID");

            migrationBuilder.CreateIndex(
                name: "IX_Arrangement_SongID",
                table: "Arrangement",
                column: "SongID");

            migrationBuilder.CreateIndex(
                name: "IX_KnownArrangement_ArrangementID",
                table: "KnownArrangement",
                column: "ArrangementID");

            migrationBuilder.CreateIndex(
                name: "IX_KnownArrangement_UserID",
                table: "KnownArrangement",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KnownArrangement");

            migrationBuilder.DropTable(
                name: "Arrangement");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Arrangers");

            migrationBuilder.DropTable(
                name: "Songs");
        }
    }
}
