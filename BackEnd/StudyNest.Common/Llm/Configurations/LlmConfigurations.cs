using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Llm.Configurations
{
    public class LlmConfigurations
    {
        public class ApiKeyConfig
        {
            public string Key { get; set; }
            public bool IsActive { get; set; } = true;
            public int Priority { get; set; }
        }

        public enum LlmProvider
        {
            Gemini,
            OpenAI
        }
    }
}
