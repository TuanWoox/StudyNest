using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.User
{
    public class RequestPasswordReset
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
