using StudyNest.Common.Models.DTOs.CoreDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IEmailBusiness
    {
        public Task<ReturnResult<bool>> SendAsync(string toEmail, string subject, string htmlBody);
    }
}
