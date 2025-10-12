using AutoMapper;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.EntityDTO.Note;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace StudyNest.Common.Models.DTOs.EntityDTO.NoteTagDTO
{
    [AutoMap(typeof(DbEntities.Entities.NoteTag), ReverseMap = true, PreserveReferences = true)]
    public class SelectNoteTagDTO
    {
        public string NoteId { get; set; }
        public SelectNoteDTO Note { get; set; }
        public DateTimeOffset? DateCreated { get; set; }
        public DateTimeOffset? DateModified { get; set; }
        public bool Deleted { get; set; }
        public DateTimeOffset? DateDeleted { get; set; }
    }
}
