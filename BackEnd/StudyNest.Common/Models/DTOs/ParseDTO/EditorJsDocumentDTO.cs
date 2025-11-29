using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.ParseDTO
{
    public class EditorJsDocumentDTO
    {
        public long Time { get; set; }
        public List<EditorJsBlockDTO> Blocks { get; set; }
        public string Version { get; set; }
    }

    public class EditorJsBlockDTO
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public JsonElement Data { get; set; }   // dynamic data content
        public JsonElement Tunes { get; set; }
    }
}
