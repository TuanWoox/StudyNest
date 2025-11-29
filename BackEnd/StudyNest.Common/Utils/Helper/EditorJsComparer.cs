using StudyNest.Common.Models.DTOs.ParseDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Common.Utils.Helper
{
    public static class EditorJsComparer
    {
        public static bool BlocksAreDifferent(string json1, string json2)
        {
            if (string.IsNullOrWhiteSpace(json1) && string.IsNullOrWhiteSpace(json2))
                return false;

            if (string.IsNullOrWhiteSpace(json1) || string.IsNullOrWhiteSpace(json2))
                return true;

            var doc1 = JsonSerializer.Deserialize<EditorJsDocumentDTO>(json1, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            var doc2 = JsonSerializer.Deserialize<EditorJsDocumentDTO>(json2, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (doc1?.Blocks == null || doc2?.Blocks == null)
                return true;

            string n1 = NormalizeBlocks(doc1.Blocks);
            string n2 = NormalizeBlocks(doc2.Blocks);

            return n1 != n2;
        }

        private static string NormalizeBlocks(List<EditorJsBlockDTO> blocks)
        {
            var normalized = blocks
                .OrderBy(b => b.Id)
                .Select(b => new {
                    b.Id,
                    b.Type,
                    Data = b.Data.ToString(),
                    Tunes = b.Tunes.ToString()
                });

            return JsonSerializer.Serialize(normalized);
        }
    }

}
