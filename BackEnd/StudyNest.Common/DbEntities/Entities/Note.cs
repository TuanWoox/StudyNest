using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Identities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class Note: BaseEntity<string>
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        [Required]
        public string Status { get; set; }
        // Mapping to owner
        public string OwnerId { get; set; }
        [JsonIgnore]
        public ApplicationUser Owner { get; set; }
        //Mapping to Folder
        public string FolderId { get; set; }
        public Folder Folder { get; set; }
        //Mapping to Tags
        public ICollection<NoteTag> NoteTags { get; set; } = new List<NoteTag>();
        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<NoteVersion> NoteVersions { get; set; } = new List<NoteVersion>();
    }
} 
