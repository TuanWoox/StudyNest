using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Folder;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System.Globalization;

namespace StudyNest.Business.v1
{
    public class FolderBusiness: IFolderBusiness
    {
        public ApplicationDbContext _dbContext;
        public IRepository<Folder, string> _repository;
        public IUserContext _userContext;
        public INoteBusiness _noteBusiness;
        public FolderBusiness(ApplicationDbContext _dbContext, IRepository<Folder,string> repository, IUserContext userContext, INoteBusiness noteBusiness)
        {
            this._dbContext = _dbContext;
            this._repository = repository;
            this._userContext = userContext;
            this._noteBusiness = noteBusiness;
        }
      
        public async Task<ReturnResult<PagedData<SelectFolderDTO, string>>> GetPaging(Page<string> page)
        {
            ReturnResult<PagedData<SelectFolderDTO, string>> result = new ReturnResult<PagedData<SelectFolderDTO, string>>();
            try
            {
                var query = _dbContext.Folders.Where(x => x.OwnerId == _userContext.UserId)
                                            .Include(x => x.Notes)
                                                .ThenInclude(x => x.NoteTags)
                                                    .ThenInclude(x => x.Tag)
                                             .Include(x => x.Notes)
                                                  .ThenInclude(x => x.NoteVersions)
                                            .AsNoTracking()
                                            .AsQueryable();
                result.Result = await _repository.GetPagingAsync<Page<string>, SelectFolderDTO>(query, page);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return result;
        }
        public async Task<ReturnResult<Folder>> GetOneById(string id)
        {
            ReturnResult<Folder> result = new ReturnResult<Folder>();
            try
            {
                var existing = await _dbContext.Folders.Where(x => x.Id == id && x.OwnerId == _userContext.UserId)
                                                    .Include(x => x.Notes)
                                                        .ThenInclude( x => x.NoteTags)
                                                        .ThenInclude( x => x.Tag)
                                                    .AsNoTracking()
                                                    .FirstOrDefaultAsync();
                if(existing == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folder", id);
                } else result.Result = existing;
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return result;
        }
        public async Task<ReturnResult<Folder>> CreateFolder(CreateFolderDTO newEntity)
        {
            ReturnResult<Folder> result = new ReturnResult<Folder>();
            try
            {
                var formatNewEntity = new CreateFolderDTO
                {
                    FolderName = newEntity.FolderName,
                    OwnerId = _userContext.UserId
                };
                if(string.IsNullOrEmpty(formatNewEntity.OwnerId) || string.IsNullOrEmpty(formatNewEntity.FolderName))
                {
                    result.Message = "Invalid fields data";
                } 
                else
                {
                    var existingFolder = await _dbContext.Folders.Where(x => x.OwnerId == formatNewEntity.OwnerId && x.FolderName.Equals(formatNewEntity.FolderName)).FirstOrDefaultAsync();
                    if(existingFolder != null)
                    {
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST,"Folder name " + formatNewEntity.FolderName);
                    } else result = await _repository.CreateAsync(formatNewEntity);
                }
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return result;
        }
        public async Task<ReturnResult<Folder>> UpdateFolder(UpdateFolderDTO newEntity)
        {
            ReturnResult<Folder> result = new ReturnResult<Folder>();
            try
            {
                var existingFolder = await _dbContext.Folders
                    .Where(x => x.Id == newEntity.Id && x.OwnerId == _userContext.UserId)
                    .FirstOrDefaultAsync();

                if (existingFolder == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folder", newEntity.Id);
                    return result;
                }
                else
                {
                    var duplicateFolder = await _dbContext.Folders
                        .Where(x => x.OwnerId == _userContext.UserId && x.FolderName.Equals(newEntity.FolderName) && x.Id != newEntity.Id)
                        .FirstOrDefaultAsync();

                    if (duplicateFolder != null)
                    {
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST, "Folder name " + newEntity.FolderName);
                        return result;
                    }

                    result = await _repository.UpdateAsync(newEntity);
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }

            return result;
        }
        public async Task<ReturnResult<bool>> DeleteFolder(string id)
        {
            var result = new ReturnResult<bool>();
            try
            {
                var folder = await _dbContext.Folders
                    .FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == _userContext.UserId);

                if (folder == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folder", id);
                    return result;
                }

                // Delete related Notes first
                var notesToDelete = await _dbContext.Notes
                    .Where(x => x.FolderId == id && x.OwnerId == _userContext.UserId)
                    .Select(x => x.Id)
                    .ToListAsync();

                if (notesToDelete.Any())
                {
                    await _noteBusiness.DeleteNotes(notesToDelete);
                }

                // Now delete the Folder
                _dbContext.Folders.Remove(folder);

                if (await _dbContext.SaveChangesAsync() <= 0)
                {
                    result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                }
                else
                {
                    result.Result = true;
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }

            return result;
        }
        public async Task<ReturnResult<int>> DeleteFolders(List<string> ids)
        {
            var result = new ReturnResult<int>();
            try
            {
                if (ids == null || !ids.Any())
                {
                    result.Message = ResponseMessage.MESSAGE_ITEM_NOT_FOUND;
                    return result;
                }

                var foldersToDelete = await _dbContext.Folders
                    .Where(x => ids.Contains(x.Id) && x.OwnerId == _userContext.UserId)
                    .ToListAsync();

                if (!foldersToDelete.Any())
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "folders", string.Join(",", ids));
                    return result;
                }

                // Delete related Notes first
                var notesToDelete = await _dbContext.Notes
                    .Where(x => ids.Contains(x.FolderId) && x.OwnerId == _userContext.UserId)
                    .Select(x => x.Id)
                    .ToListAsync();

                if (notesToDelete.Any())
                {
                    await _noteBusiness.DeleteNotes(notesToDelete);
                }

                // Now delete Folders
                _dbContext.Folders.RemoveRange(foldersToDelete);

                if (await _dbContext.SaveChangesAsync() <= 0)
                {
                    result.Result = 0;
                    result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                }
                else
                {
                    result.Result = foldersToDelete.Count;
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }

            return result;
        }

    }
}
