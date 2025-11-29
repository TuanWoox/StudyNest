using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.User
{
    public class UserChangePassword
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(100,MinimumLength =6)]
        public string NewPassword { get; set; }
    }
}
