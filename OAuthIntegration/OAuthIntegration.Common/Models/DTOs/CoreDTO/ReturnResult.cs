using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OAuthIntegration.Common.Models.DTOs.CoreDTO
{
    public class ReturnResult<T>
    {
        public T Result { get; set; }
        public string Message { get; set; }

    }
    public class ReturnSearchResult<T> : ReturnResult<T>
    {
        public int Total { get; set; }
    }
}
