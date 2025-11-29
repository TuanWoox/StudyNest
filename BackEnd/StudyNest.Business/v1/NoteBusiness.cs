using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Folder;
using StudyNest.Common.Models.DTOs.EntityDTO.Note;
using StudyNest.Common.Models.DTOs.EntityDTO.Tag;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class NoteBusiness: INoteBusiness
    {
        ApplicationDbContext _dbContext;
        IUserContext _userContext;
        INoteTagBusiness _noteTagBusiness;
        IRepository<Note, string> _repository;
        IMapper _mapper;
        public NoteBusiness(ApplicationDbContext dbContext, IUserContext userContext, INoteTagBusiness noteTagBusiness, 
            IRepository<Note,string> repository, IMapper mapper)
        {
            this._dbContext = dbContext;
            this._userContext = userContext;
            this._noteTagBusiness = noteTagBusiness;
            this._repository = repository;
            this._mapper = mapper;
        }
        public async Task<ReturnResult<PagedData<SelectNoteDTO,string>>> GetPaging(Page<string> page, bool isExported = false)
        {
            ReturnResult<PagedData<SelectNoteDTO,string>> result = new ReturnResult<PagedData<SelectNoteDTO,string>>();
            try
            {
                var query = _dbContext.Notes.Where(n => n.OwnerId == _userContext.UserId)
                                            .Include(n => n.Folder)
                                            .Include(n => n.NoteTags)
                                               .ThenInclude(n => n.Tag)
                                            .Include(n => n.NoteVersions)
                                            .AsNoTracking()
                                            .AsQueryable();
                result.Result =  await _repository.GetPagingAsync<Page<string>,SelectNoteDTO>(query,page,isExported);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Note>> GetOneById(string id)
        {
            ReturnResult<Note> result = new ReturnResult<Note>();
            try
            {
                var existingNote = await _dbContext.Notes.Where(x => x.Id == id && x.OwnerId == _userContext.UserId)
                                                        .Include(n => n.Folder)
                                                        .Include(n => n.NoteTags)
                                                            .ThenInclude(n => n.Tag)
                                                        .AsNoTracking()
                                                        .FirstOrDefaultAsync();
                if (existingNote != null)
                {
                    result.Result = existingNote;
                } 
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "note", id);
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Note>> CreateNote(CreateNoteDTO newEntity)
        {
            var result = new ReturnResult<Note>();
            try
            {
                if (!string.IsNullOrEmpty(newEntity.FolderId))
                {
                    var existingFolder = await _dbContext.Folders.Where( x => x.Id == newEntity.FolderId && x.OwnerId == _userContext.UserId).AsNoTracking().FirstOrDefaultAsync();
                    if (existingFolder == null)
                    {
                        result.Message = String.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folder", newEntity.FolderId);
                        return result;
                    }
                }
                var newNote = new Note
                {
                    Title = newEntity.Title,
                    Content = newEntity.Content,
                    Status = newEntity.Status,
                    FolderId = string.IsNullOrEmpty(newEntity.FolderId) ? null : newEntity.FolderId,
                    OwnerId = _userContext.UserId,
                };
                var entry = await _dbContext.Notes.AddAsync(newNote);
                if (await _dbContext.SaveChangesAsync() > 0)
                {
                    if (newEntity.TagsNames != null && newEntity.TagsNames.Any())
                    {
                        var saveTagResult =  await _noteTagBusiness.SaveTagsToNote(entry.Entity.Id, newEntity.TagsNames);
                        var saveNoteTags = await _noteTagBusiness.GetNoteTagsByIdAndListOfTagNames(entry.Entity.Id, newEntity.TagsNames);
                        if (saveNoteTags.Message == null)
                        {
                            entry.Entity.NoteTags = saveNoteTags.Result;
                        }
                    }
                    result.Result = entry.Entity;
                }
                else
                {
                    result.Message = ResponseMessage.MESSAGE_CREATE_ERROR;
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task<ReturnResult<Note>> UpdateNote(UpdateNoteDTO newEntity)
        {
            var result = new ReturnResult<Note>();

            try
            {
                if (!string.IsNullOrEmpty(newEntity.FolderId))
                {
                    var existingFolder = await _dbContext.Folders
                        .Where(x => x.Id == newEntity.FolderId && x.OwnerId == _userContext.UserId)
                        .AsNoTracking()
                        .FirstOrDefaultAsync();

                    if (existingFolder == null)
                    {
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folder", newEntity.FolderId);
                        return result;
                    }
                }

                var existingNote = await _dbContext.Notes
                    .FirstOrDefaultAsync(x => x.Id == newEntity.Id && x.OwnerId == _userContext.UserId);

                if (existingNote == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "note", newEntity.Id);
                    return result;
                }

                //Store previous version if content is changed
                if (EditorJsComparer.BlocksAreDifferent(existingNote.Content, newEntity.Content))
                {
                    var newVersion = new NoteVersion
                    {
                        Id = Guid.NewGuid().ToString(),
                        NoteId = existingNote.Id,
                        Content = existingNote.Content,
                        DateCreated = DateTime.UtcNow
                    };

                    //Delete the oldest 20 versions
                    var versionsToDelete = await _dbContext.NoteVersions.Where(x => x.NoteId == newEntity.Id)
                                                                        .OrderByDescending(x => x.DateCreated)  
                                                                        .Skip(19)                
                                                                        .ToListAsync();

                    if (versionsToDelete.Any())
                    {
                        _dbContext.NoteVersions.RemoveRange(versionsToDelete);
                    }
                    _dbContext.NoteVersions.Add(newVersion);
                }

                _mapper.Map(newEntity, existingNote);

                if (string.IsNullOrEmpty(newEntity.FolderId))
                {
                    existingNote.FolderId = null;
                    existingNote.Folder = null;
                }

                await _dbContext.SaveChangesAsync();

                result.Result = existingNote;

                if (newEntity.TagsNames != null && newEntity.TagsNames.Any())
                {
                    var saveTagResult = await _noteTagBusiness.SaveTagsToNote(existingNote.Id, newEntity.TagsNames);
                    var saveNoteTags = await _noteTagBusiness.GetNoteTagsByIdAndListOfTagNames(existingNote.Id, newEntity.TagsNames);

                    if (saveNoteTags.Message == null)
                    {
                        result.Result.NoteTags = saveNoteTags.Result;
                    }
                } 
                else
                {
                    await _noteTagBusiness.DeleteTagsByNoteId(existingNote.Id);
                    result.Result.NoteTags = new List<NoteTag>();
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return result;
        }
        public async Task<ReturnResult<bool>> DeleteNote(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var existingNote = await _dbContext.Notes.Where(x => x.Id == id && x.OwnerId == _userContext.UserId).FirstOrDefaultAsync();
                if(existingNote == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "note", id);
                } 
                else
                {
                    await _noteTagBusiness.DeleteTagsByNoteId(id);
                    result = await _repository.DeleteByIdAsync(id);
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<int>> DeleteNotes(List<string> ids)
        {
            ReturnResult<int> result = new ReturnResult<int>();
            try
            {
                var existingNotes = await _dbContext.Notes.Where(x => ids.Contains(x.Id) && x.OwnerId == _userContext.UserId).ToListAsync();
                if(!existingNotes.Any())
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "notes", string.Join(", ", ids));
                } 
                else
                {
                    foreach(var note in existingNotes)
                    {
                        await _noteTagBusiness.DeleteTagsByNoteId(note.Id);
                    }
                    result = await _repository.DeleteByIdsAsync(ids);
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
    }
}
