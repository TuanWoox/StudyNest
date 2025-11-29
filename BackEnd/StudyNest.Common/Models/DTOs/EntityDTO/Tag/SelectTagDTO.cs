using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.EntityDTO.Note;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Tag
{
    [AutoMap(typeof(DbEntities.Entities.Tag), ReverseMap = true, PreserveReferences = true)]
    public class SelectTagDTO : BaseEntity<string>
    {
        [TrimmedRequired]
        public string Name { get; set; }
        //Mapping to Notes
        public ICollection<TagNoteRelationDTO> NoteTags { get; set; } = new List<TagNoteRelationDTO>();
    }
    // 5 types below support for select NOTE for better performance && reading

    [AutoMap(typeof(NoteTag), ReverseMap = true, PreserveReferences = true)]
    public class TagNoteRelationDTO : BaseEntity<string>
    {
        public string NoteId { get; set; }
        public TagNoteSummaryDTO Note { get; set; }
    }

    [AutoMap(typeof(DbEntities.Entities.Note), ReverseMap = true, PreserveReferences = true)]
    public class TagNoteSummaryDTO : BaseEntity<string>
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
        public ICollection<NestedNoteTagRelationDTO> NoteTags { get; set; } = new List<NestedNoteTagRelationDTO>();
        public ICollection<NoteVersionDTO> NoteVersions { get; set; } = new List<NoteVersionDTO>();
    }

    [AutoMap(typeof(NoteTag), ReverseMap = true, PreserveReferences = true)]
    public class NestedNoteTagRelationDTO : BaseEntity<string>
    {
        public string TagId { get; set; }
        public NestedTagSummaryDTO Tag { get; set; }
    }

    [AutoMap(typeof(DbEntities.Entities.Tag), ReverseMap = true, PreserveReferences = true)]
    public class NestedTagSummaryDTO : BaseEntity<string>
    {
        [TrimmedRequired]
        public string Name { get; set; }
    }

    [AutoMap(typeof(DbEntities.Entities.Folder), ReverseMap = true, PreserveReferences = true)]
    public class NoteFolderSummaryDTO : BaseEntity<string>
    {
        public string FolderName { get; set; }
        public string OwnerId { get; set; }
    }
    [AutoMap(typeof(DbEntities.Entities.NoteVersion), ReverseMap = true, PreserveReferences = true)]
    public class NoteVersionDTO : BaseEntity<string>
    {
        public string Content { get; set; }
        public string NoteId { get; set; }
    }
}