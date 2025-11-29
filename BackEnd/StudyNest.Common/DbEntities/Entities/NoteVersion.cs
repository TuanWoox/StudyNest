using StudyNest.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class NoteVersion : BaseEntity<string>
    {
        [Required]
        [Column(TypeName = "jsonb")]
        public string Content { get; set; }

        [ForeignKey(nameof(Note))]
        public string NoteId { get; set; }

        public Note Note { get; set; }
    }

}
