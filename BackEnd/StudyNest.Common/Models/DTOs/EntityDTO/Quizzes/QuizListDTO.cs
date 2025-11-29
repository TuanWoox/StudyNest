using AutoMapper;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Quizzes
{
    public class QuizListDTO : BaseEntity<string>, IMapFrom<Quiz>
    {   
        [Required]
        public string Title { get; set; }
        public int TotalQuestion { get; set; }
        public string Difficulty { get; set; }
        public string? NoteTitle { get; set; }
        public void Mapping(Profile profile)
        {
            var map = profile.CreateMap<Quiz, QuizListDTO>();
            map.ForMember(x => x.TotalQuestion, y => y.MapFrom(dto => dto.Questions.Count));
            map.ForMember(x => x.NoteTitle, y => y.MapFrom(dto => dto.Note.Title));
        }
    }
}
