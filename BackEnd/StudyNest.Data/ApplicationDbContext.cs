using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.DbEntities.Identities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Data
{
    public partial class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string, IdentityUserClaim<string>,
    ApplicationUserRole, IdentityUserLogin<string>, IdentityRoleClaim<string>, IdentityUserToken<string>>
    {
        public DbSet<Note> Notes { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<NoteTag> NoteTags { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Choice> Choices { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<ImageToDelete> ImageToDeletes { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<QuizAttemptSnapshot> QuizAttemptSnapshots { get; set; }
        public DbSet<QuizAttemptAnswer> QuizAttemptAnswers { get; set; }
        public DbSet<QuizAttemptAnswerChoice> QuizAttemptAnswerChoices { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {


        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            //Add Global Query Filters for Soft Delete
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                if (typeof(IDeleted).IsAssignableFrom(entityType.ClrType))
                {
                    entityType.AddSoftDeleteQueryFilter();
                }
            }
            #region Configure ASP.NET Relationships
            // One note can belong to one user, one user can have many notes
            builder.Entity<Note>()
                .HasOne(n => n.Owner)
                .WithMany(u => u.Notes)
                .HasForeignKey(n => n.OwnerId)
                .IsRequired();
            // One note can belong to zero -> one folder, one folder can have 0 -> many notes
            builder.Entity<Note>()
                .HasOne(n => n.Folder)
                .WithMany(f => f.Notes)
                .HasForeignKey(n => n.FolderId)
                .IsRequired(false);
            // Configure the Content property to be stored as JSONB
            builder.Entity<Note>()
                .Property(n => n.Content)
                .HasColumnType("jsonb");
            //One fodcan belong to one user, one user can have many folders
            builder.Entity<Folder>()
                .HasOne(f => f.Owner)
                .WithMany(u => u.Folders)
                .HasForeignKey(f => f.OwnerId)
                .IsRequired();
            //Many-to-Many relationship between Note and Tag via NoteTag
            builder.Entity<NoteTag>(noteTag =>
            {
                noteTag.HasKey(nt => new { nt.NoteId, nt.TagId });
                noteTag.HasOne(nt => nt.Note)
                       .WithMany(n => n.NoteTags)
                       .HasForeignKey(nt => nt.NoteId)
                       .IsRequired();
                noteTag.HasOne(nt => nt.Tag)
                       .WithMany(t => t.NoteTags)
                       .HasForeignKey(nt => nt.TagId)
                       .IsRequired();
            });
            //Many-to-Many relationship between ApplicationUser and ApplicationRole via ApplicationUserRole
            builder.Entity<ApplicationUserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

                userRole.HasOne(ur => ur.User)
                        .WithMany(u => u.UserRoles)
                        .HasForeignKey(ur => ur.UserId)
                        .IsRequired();

                userRole.HasOne(ur => ur.Role)
                        .WithMany(r => r.UserRoles)
                        .HasForeignKey(ur => ur.RoleId)
                        .IsRequired();
            });
            // Cascade delete: deleting a quiz will also delete its questions
            builder.Entity<Question>(e =>
            {
                e.HasIndex(x => x.QuizId);

                e.HasOne(x => x.Quiz)
                 .WithMany(z => z.Questions)
                 .HasForeignKey(x => x.QuizId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<Choice>(e =>
            {
                e.HasIndex(c => c.QuestionId);

                e.HasOne(c => c.Question)
                 .WithMany(q => q.Choices)
                 .HasForeignKey(c => c.QuestionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
            #endregion


        }

        public async Task<int> SaveChangesAsync( bool populatedICreated = true, bool populatedIModified = true,  CancellationToken cancellationToken = default)
        => await SaveChangesInternalAsync(populatedICreated, populatedIModified, cancellationToken);

        private async Task<int> SaveChangesInternalAsync( bool populatedICreated, bool populatedIModified, CancellationToken cancellationToken)
        {
            var now = DateTimeOffset.UtcNow;

            // 1) Ghi nhận các entity sắp bị xóa (TRƯỚC khi đổi state)
            var deletedQuizIds = new List<string>();
            var deletedQuestionIds = new List<string>();

            var tracked = ChangeTracker.Entries().Where(e => e.State != EntityState.Unchanged).ToList();
            foreach (var e in tracked)
            {
                if (e.State == EntityState.Deleted)
                {
                    switch (e.Entity)
                    {
                        case Quiz qz:
                            deletedQuizIds.Add(qz.Id);
                            break;
                        case Question qu:
                            deletedQuestionIds.Add(qu.Id);
                            break;
                    }
                }
            }

            // 2) Áp audit + chuyển Delete => soft-delete
            foreach (var change in tracked)
            {
                switch (change.State)
                {
                    case EntityState.Added:
                        if (change.Entity is ICreated c && populatedICreated)
                        {
                            c.DateCreated = now;
                            c.DateModified = now;
                        }
                        break;

                    case EntityState.Modified:
                        if (change.Entity is IModified m && populatedIModified)
                        {
                            m.DateModified = now;
                        }
                        break;

                    case EntityState.Deleted:
                        if (change.Entity is IDeleted d)
                        {
                            change.State = EntityState.Modified;
                            d.Deleted = true;
                            d.DateDeleted = now;
                        }
                        break;
                }
            }

            // 3) Bao toàn bộ trong execution strategy + transaction
            var strategy = Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await Database.BeginTransactionAsync(cancellationToken);

                // 3a) Bulk UPDATE cascade soft-delete cho các con cháu
                foreach (var quizId in deletedQuizIds)
                {
                    await Database.ExecuteSqlRawAsync(@"
                UPDATE ""Questions""
                SET ""Deleted"" = TRUE, ""DateDeleted"" = {0}
                WHERE ""QuizId"" = {1} AND ""Deleted"" = FALSE;",
                        new object[] { now, quizId }, cancellationToken);

                    await Database.ExecuteSqlRawAsync(@"
                UPDATE ""Choices""
                SET ""Deleted"" = TRUE, ""DateDeleted"" = {0}
                WHERE ""QuestionId"" IN (SELECT ""Id"" FROM ""Questions"" WHERE ""QuizId"" = {1})
                  AND ""Deleted"" = FALSE;",
                        new object[] { now, quizId }, cancellationToken);
                }

                foreach (var questionId in deletedQuestionIds)
                {
                    await Database.ExecuteSqlRawAsync(@"
                UPDATE ""Choices""
                SET ""Deleted"" = TRUE, ""DateDeleted"" = {0}
                WHERE ""QuestionId"" = {1} AND ""Deleted"" = FALSE;",
                        new object[] { now, questionId }, cancellationToken);
                }

                // 3b) Lưu thay đổi của chính entity gốc (đã set Deleted=true)
                var result = await base.SaveChangesAsync(cancellationToken);

                await tx.CommitAsync(cancellationToken);

                // ONLY clear the tracker AFTER the transaction commits
                // This ensures identity values are populated before clearing
                ChangeTracker.Clear();

                return result;
            });
        }

    }
}
