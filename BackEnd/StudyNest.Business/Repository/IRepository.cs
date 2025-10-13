using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.DbEntities.BaseEntity;

namespace StudyNest.Business.Repository
{
    public interface IRepository<TEntity, TKey> where TEntity : class, IBaseKey<TKey>
    {
        public Task<ReturnResult<TEntity>> GetByIdAsync(TKey id);
        public Task<PagedData<TResponse, TKey>> GetPagingAsync<TPage, TResponse>(IQueryable<TEntity> entities, TPage page, bool isExport = false)
            where TResponse : IBaseKey<TKey>
            where TPage : Page<TKey>;
        public Task<ReturnResult<TEntity>> CreateAsync<TCreateDto>(TCreateDto entity)
        where TCreateDto : class, IBaseKey<TKey>;
        public Task<ReturnResult<TEntity>> UpdateAsync<TUpdateDto>(TUpdateDto entity)
            where TUpdateDto : class, IBaseKey<TKey>;
        public Task<ReturnResult<bool>> DeleteByIdAsync(TKey id);
        public Task<ReturnResult<int>> DeleteByIdsAsync(List<TKey> ids);
    }
}
