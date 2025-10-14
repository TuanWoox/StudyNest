using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using System.ComponentModel.DataAnnotations;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Note
{
    [AutoMap(typeof(DbEntities.Entities.Note), ReverseMap = true, PreserveReferences = true)]
    public class SelectNoteDTO : BaseEntity<string>
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        [Required]
        public string Status { get; set; }
        // Mapping to owner
        public string OwnerId { get; set; }
        //Mapping to Folder
        public string FolderId { get; set; }
        public NoteFolderSummaryDTO Folder { get; set; }
        //Mapping to Tags
        public ICollection<NoteTagRelationDTO> NoteTags { get; set; } = new List<NoteTagRelationDTO>();
    }

    // 3 types below support for select NOTE for better performance 
    [AutoMap(typeof(DbEntities.Entities.Folder), ReverseMap = true, PreserveReferences = true)]
    public class NoteFolderSummaryDTO : BaseEntity<string>
    {
        public string FolderName { get; set; }
        public string OwnerId { get; set; }
    }

    [AutoMap(typeof(NoteTag), ReverseMap = true, PreserveReferences = true)]
    public class NoteTagRelationDTO : BaseEntity<string>
    {
        public string TagId { get; set; }
        public TagSummaryDTO Tag { get; set; }
    }

    [AutoMap(typeof(DbEntities.Entities.Tag), ReverseMap = true, PreserveReferences = true)]
    public class TagSummaryDTO : BaseEntity<string>
    {
        [TrimmedRequired]
        public string Name { get; set; }
    }
}