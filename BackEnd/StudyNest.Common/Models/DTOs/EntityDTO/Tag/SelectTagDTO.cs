using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.EntityDTO.NoteTagDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Tag
{
    [AutoMap(typeof(DbEntities.Entities.Tag), ReverseMap = true, PreserveReferences = true)]
    public class SelectTagDTO: BaseEntity<string>
    {
        [TrimmedRequired]
        public string Name { get; set; }
        //Mappping to Notes
        public ICollection<SelectNoteTagDTO> NoteTags { get; set; } = new List<SelectNoteTagDTO>();
    }
}
