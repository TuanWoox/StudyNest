using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Tag;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class TagBusiness: ITagBusiness
    {
        public ApplicationDbContext _dbContext;
        public IRepository<Tag, string> _repository;
        public IUserContext _userContext;
        public TagBusiness(ApplicationDbContext dbContext, IUserContext userContext, IRepository<Tag, string> repository)
        {
            this._dbContext = dbContext;
            this._userContext = userContext;
            this._repository = repository;
        }
        public async Task<ReturnResult<PagedData<SelectTagDTO, string>>> GetPaging(Page<string> page)
        {
            ReturnResult<PagedData<SelectTagDTO, string>> result = new ReturnResult<PagedData<SelectTagDTO, string>>();
            try
            {
                var query = _dbContext.Tags.AsNoTracking().AsQueryable();
                result.Result = await _repository.GetPagingAsync<Page<string>, SelectTagDTO>(query, page);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<PagedData<SelectTagDTO, string>>> GetOwnPaging(Page<string> page)
        {
            ReturnResult<PagedData<SelectTagDTO, string>> result = new ReturnResult<PagedData<SelectTagDTO, string>>();
            try
            {
                var query = _dbContext.Tags
                                    .Include(t => t.NoteTags.Where(t => t.Note.OwnerId == _userContext.UserId))
                                        .ThenInclude(nt => nt.Note)
                                            .ThenInclude(n => n.Folder)
                                   .Include(t => t.NoteTags.Where(t => t.Note.OwnerId == _userContext.UserId))
                                        .ThenInclude(nt => nt.Note)
                                            .ThenInclude(n => n.NoteTags)
                                                .ThenInclude(nt => nt.Tag)
                                    .Where(t => t.NoteTags.Any(nt => nt.Note.OwnerId == _userContext.UserId))
                                    .AsQueryable();

                result.Result = await _repository.GetPagingAsync<Page<string>, SelectTagDTO>(query, page);

            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Tag>> GetOneById(string id)
        {
            ReturnResult<Tag> result = new ReturnResult<Tag>();
            try
            {
                result = await _repository.GetByIdAsync(id);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Tag>> CreateTag(string Name)
        {
            ReturnResult<Tag> result = new ReturnResult<Tag>();
            try
            {
                var newTag = new Tag()
                {
                    Name = Name.Trim().ToKebabCase()
                };
                var existing = await _dbContext.Tags.Where(x => x.Name == newTag.Name).FirstOrDefaultAsync();
                if(existing != null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST, "tag " + Name);
                } 
                else result = await _repository.CreateAsync(newTag);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Tag>> UpdateTag(UpdateTagDTO newEntity)
        {
            ReturnResult<Tag> result = new ReturnResult<Tag>();
            try
            {
                var existing = await _dbContext.Tags.Where(x => x.Name == newEntity.Name && x.Id != newEntity.Id).FirstOrDefaultAsync();
                if(existing != null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST, "tag " + newEntity.Name);
                } 
                else result = await _repository.UpdateAsync(newEntity);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> DeleteTag(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var tag = await _dbContext.Tags.FirstOrDefaultAsync(x => x.Id == id);
                if (tag == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "tag", id);
                    return result;
                }
                // Delete related NoteTags first ( Because we have foreign key constraint )
                var notesToDelete = await _dbContext.NoteTags.Where(x => x.TagId == id).ToListAsync();
                if (notesToDelete.Any())
                {
                    _dbContext.NoteTags.RemoveRange(notesToDelete);
                }
                // Now delete the Tag
                _dbContext.Tags.Remove(tag);
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
            }
            return result;
        }

        public async Task<ReturnResult<int>> DeleteTags(List<string> ids)
        {
            var result = new ReturnResult<int>();
            try
            {
                if (ids == null || !ids.Any())
                {
                    result.Message = ResponseMessage.MESSAGE_ITEM_NOT_FOUND;
                    return result;
                }
                var tagsToDelete = await _dbContext.Tags.Where(x => ids.Contains(x.Id)).ToListAsync();
                if (!tagsToDelete.Any())
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "tags", string.Join(",", ids));
                    return result;
                }
                // Delete related NoteTags first
                var notesToDelete = await _dbContext.NoteTags.Where(x => ids.Contains(x.TagId)).ToListAsync();
                if (notesToDelete.Any())
                {
                    _dbContext.NoteTags.RemoveRange(notesToDelete);
                }
                // Now delete Tags
                _dbContext.Tags.RemoveRange(tagsToDelete);
                if (await _dbContext.SaveChangesAsync() <= 0)
                {
                    result.Result = 0;
                    result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                }
                else
                {
                    result.Result = tagsToDelete.Count;
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        //Used to find the ID for linking a note with its tag
        public async Task<ReturnResult<List<string>>> GetTagIdsByNames(List<string> names)
        {
            ReturnResult<List<string>> result = new ReturnResult<List<string>>();
            try
            {
                List<string> kebabNames = names.Select(x => x.Trim().ToKebabCase()).ToList();
                var existingTags = await _dbContext.Tags.Where(x => kebabNames.Contains(x.Name)).ToListAsync();    
                foreach(var name in kebabNames)
                {
                    var existingTag = existingTags.FirstOrDefault(x => x.Name == name);
                    if(existingTag == null)
                    {
                        if(string.IsNullOrEmpty(name)) continue;
                        else
                        {
                            var resultCreateTag = await CreateTag(name);
                            if (resultCreateTag.Result != null)
                            {
                                existingTags.Add(resultCreateTag.Result);
                            }
                        }

                    }
                }
                result.Result = existingTags.Select(x => x.Id).ToList();
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<List<string>>> GetTagIdsByListOfName(List<string> tagsName)
        {
            ReturnResult<List<string>> result = new ReturnResult<List<string>>();
            try
            {
                tagsName = tagsName.Select(name => name.ToKebabCase()).ToList();
                var existingTagIds = await _dbContext.Tags.Where(x => tagsName.Contains(x.Name)).ToListAsync();
                var notExistingTagNames = tagsName.Except(existingTagIds.Select(x => x.Name)).ToList();
                foreach (var name in notExistingTagNames)
                {
                    if (string.IsNullOrEmpty(name)) continue;
                    var resultCreateTag = await CreateTag(name);
                    if (resultCreateTag.Result != null)
                    {
                        existingTagIds.Add(resultCreateTag.Result);
                    }
                }
                if(existingTagIds.Any())
                {
                    result.Result = existingTagIds.Select(x => x.Id).ToList();
                }
                else
                {
                    result.Result = new List<string>();
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
