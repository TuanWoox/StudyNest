using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudyNest.Business.Hubs;

namespace StudyNest.Business.Hubs.RealTimeCache
{
    public class PlayerInformation
    {
        public string Name { get; set; }
        public string UserId { get; set; }
        public string ConnectionId { get; set; }
    }
    public static class QuizSessionCache
    {
        // Thread-safe dictionary for concurrent access
        private static readonly Dictionary<string, List<PlayerInformation>> _sessions = new();

        private static readonly object _lock = new();

        public static void AddPlayer(string sessionId, PlayerInformation player)
        {
            lock (_lock)
            {
                if (!_sessions.ContainsKey(sessionId))
                    _sessions[sessionId] = new List<PlayerInformation>();

                _sessions[sessionId].Add(player);
            }
        }

        public static void RemovePlayer(string sessionId, string connectionId)
        {
            lock (_lock)
            {
                if (_sessions.ContainsKey(sessionId))
                {
                    _sessions[sessionId]
                        .RemoveAll(p => p.ConnectionId == connectionId);

                    if (_sessions[sessionId].Count == 0)
                        _sessions.Remove(sessionId);
                }
            }
        }

        public static List<PlayerInformation> GetPlayers(string sessionId)
        {
            lock (_lock)
            {
                if (_sessions.ContainsKey(sessionId))
                    return _sessions[sessionId].ToList();

                return new List<PlayerInformation>();
            }
        }

        public static PlayerInformation? GetPlayerByUserId(string sessionId, string userId)
        {
            lock (_lock)
            {
                if (_sessions.ContainsKey(sessionId))
                {
                    return _sessions[sessionId].FirstOrDefault(p => p.UserId == userId);
                }
                return null;
            }
        }

        public static void UpdatePlayerConnection(string sessionId, string userId, string newConnectionId)
        {
            lock (_lock)
            {
                if (_sessions.ContainsKey(sessionId))
                {
                    var player = _sessions[sessionId].FirstOrDefault(p => p.UserId == userId);
                    if (player != null)
                    {
                        player.ConnectionId = newConnectionId;
                    }
                }
            }
        }

        public static string? FindSessionByUserId(string userId, string excludeSessionId = null)
        {
            lock (_lock)
            {
                foreach (var kvp in _sessions)
                {
                    if (kvp.Key != excludeSessionId && kvp.Value.Any(p => p.UserId == userId))
                    {
                        return kvp.Key;
                    }
                }
                return null;
            }
        }

        public static int GetPlayerCount(string sessionId)
        {
            lock (_lock)
            {
                if (_sessions.ContainsKey(sessionId))
                    return _sessions[sessionId].Count;
                return 0;
            }
        }

        public static void InitializeSession(string sessionId)
        {
            lock (_lock)
            {
                if (!_sessions.ContainsKey(sessionId))
                {
                    _sessions[sessionId] = new List<PlayerInformation>();
                }
            }
        }

        public static bool SessionExists(string sessionId)
        {
            lock (_lock)
            {
                return _sessions.ContainsKey(sessionId);
            }
        }
    }
}
