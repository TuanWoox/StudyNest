using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IUserContext
    {
        string UserId { get; }
        bool IsAdmin { get; }
    }
}
