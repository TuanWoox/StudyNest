using Newtonsoft.Json;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Utils;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace StudyNest.Common.Models.Paging
{
    public class Page : Page<string>
    {

    }
    public class Page<Tkey>
    {
        public int Size { get; set; }
        public int PageNumber { get; set; }
        public int TotalElements { get; set; }
        public List<OrderMapping> Orders { get; set; }
        public List<FilterMapping> Filter { get; set; }
        public virtual List<Tkey> Selected { get; set; }

        #region Format Filters
        public void FormatFilter<T>(ref IQueryable<T> query, string mainTBL = "")
        {
            try
            {
                if (query != null && Filter != null && Filter.Count > 0)
                {
                    string filter = string.Empty;
                    foreach (var item in Filter)
                    {
                        //If there is no filter operator, skip this item
                        if (item.FilterOperator == null) continue;

                        Enum.TryParse<StudyNestAllFilterOperator>(item.FilterOperator.ToString(), out StudyNestAllFilterOperator operatorAll);
                        if (operatorAll == StudyNestAllFilterOperator.IsFilter)
                        {
                            switch (item.FilterType)
                            {
                                //This is case when we want to filter based on a text property in database
                                case StudyNestFilterType.Text:
                                    if (string.IsNullOrEmpty(item.DynamicProperty))
                                    {
                                        filter = FilterTextOperator(filter, item);
                                    }
                                    else FilterStringJsonOperator(ref query, item);
                                    break;
                                case StudyNestFilterType.EmailActions:
                                    filter = FilterTextOperator(filter, item);
                                    break;
                                case StudyNestFilterType.DropDown:
                                    if (string.IsNullOrEmpty(item.DynamicProperty))
                                    {
                                        filter = FilterDropDownOperator(filter,item);
                                    }
                                    else FilterDropdownJsonOperator(ref query, item);
                                    break;
                                case StudyNestFilterType.DynamicContent:
                                    filter = FilterDynamicContentOperator(filter, item);
                                    break;
                                case StudyNestFilterType.DateTime:
                                    if (string.IsNullOrEmpty(item.DynamicProperty))
                                    {
                                        filter = FilterDateOperator(filter, item);
                                    } 
                                    else FilterDateTimeJsonOperator(ref query, item);
                                    break;
                                case StudyNestFilterType.Boolean:
                                    filter = FilterBooleanOperator(filter, item);
                                    break;
                                case StudyNestFilterType.Number:
                                    if (string.IsNullOrEmpty(item.DynamicProperty))
                                    {
                                        filter = FilterNumberOperator(filter, item);
                                    }
                                    else FilterNumberJsonOperator(ref query, item);
                                    break;
                                case StudyNestFilterType.Date:

                                    if (string.IsNullOrEmpty(item.DynamicProperty))
                                    {
                                        filter = FilterDateOperator(filter, item);
                                    } 
                                    else FilterDateJsonOperator(ref query, item);
                                    break;                                 
                            }
                        }
                        else
                        {
                            if (!string.IsNullOrEmpty(item.DynamicProperty))
                            {
                                FilterJsonNullOrEmpty(ref query, item);
                            }
                            else
                            {
                                filter = FilterNullOrNotNull(filter, item, operatorAll);
                            }

                        }
                    }
                    //If there is a filter, remove the last "And" and return the filter
                    if (!string.IsNullOrEmpty(filter))
                    {
                        filter = filter.Remove(filter.Length - 4);
                        query = query.Where(filter);
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

        }
        #endregion

        #region Format Orders
        public void FormatOrder<T>(ref IQueryable<T> query, string mainTBL = "")
        {
            try
            {
                if (query != null && Orders != null && Orders.Count > 0)
                {
                    if (!string.IsNullOrEmpty(mainTBL))
                    {
                        mainTBL += ".";
                    }

                    var parameter = Expression.Parameter(typeof(T), "e");

                    for (int i = 0; i < Orders.Count; i++)
                    {
                        var item = Orders[i];

                        if (string.IsNullOrEmpty(item.DynamicProperty))
                        {
                            var sortCondition = $"{mainTBL}{item.Sort.UpperFirstChar()} {item.SortDir}";

                            if (i == 0)
                            {
                                query = query.OrderBy(sortCondition);
                            }
                            else
                            {
                                var orderedQueryable = query as IOrderedQueryable<T>;
                                query = orderedQueryable.ThenBy(sortCondition);
                            }
                        }
                        else
                        {
                            if (i == 0)
                            {
                                query = StudyNestEFFunction.OrderByPropertyOrField<T>(ref query, parameter, item.DynamicProperty, $"\"{item.Sort}\"", item.DataType, item.SortDir);
                            }
                            else
                            {
                                var orderedQueryable = query as IOrderedQueryable<T>;

                                if (item.DataType != "Number")
                                {
                                    var jsonExtract = StudyNestEFFunction.ExtractAndConvertToString(parameter, item.DynamicProperty, $"\"{item.Sort}\"");
                                    var selector = Expression.Lambda<Func<T, string>>(jsonExtract, parameter);

                                    query = item.SortDir == SortOrderType.ASC
                                        ? orderedQueryable.ThenBy(selector)
                                        : orderedQueryable.ThenByDescending(selector);
                                }
                                else
                                {
                                    var jsonExtract = StudyNestEFFunction.ExtractAndConvertToDouble(parameter, item.DynamicProperty, $"\"{item.Sort}\"");
                                    var selector = Expression.Lambda<Func<T, double>>(jsonExtract, parameter);

                                    query = item.SortDir == SortOrderType.ASC
                                        ? orderedQueryable.ThenBy(selector)
                                        : orderedQueryable.ThenByDescending(selector);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }
        #endregion

        #region TEXT FILTERS
        //This is used to filter text properties in the filter mapping
        public string FilterTextOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            try
            {
                var filterOp = item.FilterOperator?.ToString();
                var propName = $"{mainTBL}{item.Prop.UpperFirstChar()}";
                var value = item.Value?.ToString()?.Trim();
                if (filterOp != StudyNestFilterType.EmailActions.ToString() && filterOp != "NoEmailActions")
                {
                    if (Enum.TryParse(filterOp, out StudyNestTextFilterOperator operatorText))
                    {
                        if (!string.IsNullOrEmpty(value))
                        {
                            switch (operatorText)
                            {
                                case StudyNestTextFilterOperator.Contains:
                                    filter += $" {propName}.ToLower().Contains(\"{value.ToLower()}\") And ";
                                    break;
                                case StudyNestTextFilterOperator.DoesNotContains:
                                    filter += $"( !{propName}.ToLower().Contains(\"{value.ToLower()}\") || {propName} == null ) And ";
                                    break;
                                case StudyNestTextFilterOperator.EndsWith:
                                    filter += $" {propName}.ToLower().EndsWith(\"{value.ToLower()}\") And ";
                                    break;
                                case StudyNestTextFilterOperator.IsEqualTo:
                                    filter += $" {propName}.ToLower() == \"{value.ToLower()}\" And ";
                                    break;
                                case StudyNestTextFilterOperator.IsNotEqualTo:
                                    filter += $" {propName}.ToLower() != \"{value.ToLower()}\" And ";
                                    break;
                                case StudyNestTextFilterOperator.StartsWith:
                                    filter += $" {propName}.ToLower().StartsWith(\"{value.ToLower()}\") And ";
                                    break;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return filter;
        }
        //This is used to filter text property on a json stored
        private void FilterStringJsonOperator<T>(ref IQueryable<T> query, FilterMapping item, string type = null)
        {
            try
            {
                if (item.Value != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "o"); //Hard a parameter for expression
                    var extractAndUnquote = StudyNestEFFunction.ExtractAndUnquote(parameter, item.DynamicProperty, $"\"{item.Prop}\""); //Call JSON_EXTRACT on Postgresql and Convert To String [Default]
                    var toLower = typeof(StudyNestEFFunction).GetMethod("ToLower");
                    var extractData = Expression.Call(toLower, extractAndUnquote);
                    var value = Expression.Constant(item.Value?.ToString()?.ToLower(), typeof(string)); //Make sure this data as a dobule

                    if (extractData != null)
                    {
                        var conditionQuery = Expression.Equal(extractData, value);
                        var pattern = item.Value?.ToString()?.ToLower();
                        Enum.TryParse<StudyNestTextFilterOperator>(item.FilterOperator.ToString(), out StudyNestTextFilterOperator operatorNumber);
                        switch (operatorNumber)
                        {
                            case StudyNestTextFilterOperator.Contains:
                                pattern = $"%{item.Value?.ToString()?.ToLower()}%";
                                var callContains = StudyNestEFFunction.ExtractAndContains(parameter, item.DynamicProperty, $"\"{item.Prop}\"", pattern);
                                conditionQuery = Expression.Equal(callContains, Expression.Constant(true, typeof(bool)));
                                break;
                            case StudyNestTextFilterOperator.DoesNotContains:
                                pattern = $"%{item.Value?.ToString()?.ToLower()}%";
                                var callNotContains = StudyNestEFFunction.ExtractAndContains(parameter, item.DynamicProperty, $"\"{item.Prop}\"", pattern);
                                conditionQuery = Expression.Equal(callNotContains, Expression.Constant(false, typeof(bool)));
                                conditionQuery = Expression.OrElse(conditionQuery, Expression.Equal(extractData, Expression.Constant(null)));
                                conditionQuery = Expression.OrElse(conditionQuery, Expression.Equal(extractData, Expression.Constant(string.Empty)));
                                break;

                            case StudyNestTextFilterOperator.IsEqualTo:
                                //this is default case
                                break;
                            case StudyNestTextFilterOperator.IsNotEqualTo:
                                conditionQuery = Expression.NotEqual(extractData, value);
                                break;
                            case StudyNestTextFilterOperator.IsNullOrEmpty:
                                break;
                            case StudyNestTextFilterOperator.IsNotNullOrNotEmpty:
                                conditionQuery = Expression.LessThan(extractData, value);
                                break;
                            case StudyNestTextFilterOperator.EndsWith:
                                pattern = $"%{item.Value?.ToString()?.ToLower()}";
                                var endsWith = StudyNestEFFunction.ExtractAndContains(parameter, item.DynamicProperty, $"\"{item.Prop}\"", pattern);
                                conditionQuery = Expression.Equal(endsWith, Expression.Constant(true, typeof(bool)));
                                break;
                            case StudyNestTextFilterOperator.StartsWith:
                                pattern = $"{item.Value?.ToString()?.ToLower()}%";
                                var startsWith = StudyNestEFFunction.ExtractAndContains(parameter, item.DynamicProperty, $"\"{item.Prop}\"", pattern);
                                conditionQuery = Expression.Equal(startsWith, Expression.Constant(true, typeof(bool)));
                                break;

                        }

                        var lambda = Expression.Lambda<Func<T, bool>>(conditionQuery, parameter);
                        query = query.Where(lambda);
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }

        #endregion

        #region DROP DOWN FILTERS
        public string FilterDropDownOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            try
            {
                var filterOp = item.FilterOperator?.ToString();
                var propName = $"{mainTBL}{item.Prop.UpperFirstChar()}";
                var rawValue = item.Value?.ToString();

                if (string.IsNullOrEmpty(filterOp) || string.IsNullOrEmpty(rawValue))
                    return filter;

                var tempValue = rawValue
                    .Replace("\"[", string.Empty)
                    .Replace("]\"", string.Empty)
                    .Replace("[", string.Empty)
                    .Replace("]", string.Empty)
                    .Replace("\r\n", string.Empty)
                    .Trim();

                if (string.IsNullOrEmpty(tempValue))
                    return filter;


                if (Enum.TryParse(filterOp, out StudyNestDropDownFilterOperator operatorDropDown))
                {
                    switch (operatorDropDown)
                    {
                        case StudyNestDropDownFilterOperator.Contains:
                            filter += $" {propName} in ({tempValue}) And ";
                            break;

                        case StudyNestDropDownFilterOperator.DoesNotContains:
                            filter += $" !({propName} in ({tempValue})) And ";
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

            return filter;
        }


        private void FilterDropdownJsonOperator<T>(ref IQueryable<T> query, FilterMapping item, string mainTBL = "")
        {
            try
            {
                if (item.Value != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "o"); //Hard a parameter for expression
                    var extractAndConvert = StudyNestEFFunction.ExtractAndUnquote(parameter, item.DynamicProperty, $"\"{item.Prop}\""); //Call JSON_EXTRACT on mysql and Convert To String [Default]                

                    if (extractAndConvert != null)
                    {
                        var tempValue = item.Value.ToString()
                                               .Replace("\"[", string.Empty)
                                                                .Replace("]\"", string.Empty)
                                                           .Replace("[", string.Empty)
                                                           .Replace("]", string.Empty)
                                                           .Replace("\r\n", string.Empty)?.Trim()
                                                           ;
                        if (!string.IsNullOrEmpty(tempValue))
                        {
                            var listValue = tempValue.Split(", ").Select(x => x.Replace("\"", string.Empty)).ToList();
                            Expression conditionQuery = null; //Init the first expression

                            Enum.TryParse<StudyNestTextFilterOperator>(item.FilterOperator.ToString(), out StudyNestTextFilterOperator operatorNumber);
                            switch (operatorNumber)
                            {
                                case StudyNestTextFilterOperator.Contains:
                                    foreach (var dropdownValue in listValue)
                                    {
                                        var equal = Expression.Equal(extractAndConvert, Expression.Constant(dropdownValue.Trim()));

                                        if (dropdownValue == "IsNullOrEmpty")
                                        {
                                            equal = Expression.Equal(extractAndConvert, Expression.Constant(null));
                                            equal = Expression.OrElse(equal, Expression.Equal(extractAndConvert, Expression.Constant(string.Empty)));
                                        }

                                        conditionQuery = conditionQuery == null ? equal : Expression.OrElse(conditionQuery, equal);
                                    }
                                    break;
                                case StudyNestTextFilterOperator.DoesNotContains:
                                    foreach (var dropdownValue in listValue)
                                    {
                                        var equal = Expression.NotEqual(extractAndConvert, Expression.Constant(dropdownValue.Trim()));


                                        if (dropdownValue == "IsNullOrEmpty")
                                        {
                                            equal = Expression.NotEqual(extractAndConvert, Expression.Constant(null));
                                            equal = Expression.AndAlso(equal, Expression.NotEqual(extractAndConvert, Expression.Constant(string.Empty)));
                                        }

                                        conditionQuery = conditionQuery == null ? equal : Expression.AndAlso(conditionQuery, equal);
                                    }
                                    break;

                            }

                            var lambda = Expression.Lambda<Func<T, bool>>(conditionQuery, parameter);
                            query = query.Where(lambda);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }
        #endregion

        #region DYNAMIC CONTENT FILTERS

        // This is used to filter dynamic content (like list-based dropdowns or tags) in the filter mapping
        public string FilterDynamicContentOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            try
            {
                var filterOp = item.FilterOperator?.ToString();
                var propName = $"{mainTBL}{item.Prop.UpperFirstChar()}";
                var rawValue = item.Value?.ToString();

                if (!string.IsNullOrEmpty(filterOp) && !string.IsNullOrEmpty(rawValue))
                {
                    var tempValue = rawValue
                        .Replace("\"[", string.Empty)
                        .Replace("]\"", string.Empty)
                        .Replace("[", string.Empty)
                        .Replace("]", string.Empty)
                        .Replace("\r\n", string.Empty)
                        .Trim();

                    if (!string.IsNullOrEmpty(tempValue))
                    {
                        var valueList = tempValue.Split(",", StringSplitOptions.RemoveEmptyEntries)
                                                                     .Select(v => v.Trim())
                                                                     .ToList();

                        if (Enum.TryParse(filterOp, out StudyNestDropDownFilterOperator operatorDropDown) && valueList.Count > 0)
                        {
                            string subFilter = string.Empty;

                            switch (operatorDropDown)
                            {
                                case StudyNestDropDownFilterOperator.Contains:
                                    foreach (var value in valueList)
                                    {
                                        subFilter += $" {propName}.Contains(\"{value}\") Or ";
                                    }

                                    if (!string.IsNullOrEmpty(subFilter))
                                    {
                                        subFilter = subFilter[..^4]; // Remove last ' Or '
                                        filter += $"({subFilter}) And ";
                                    }
                                    break;

                                case StudyNestDropDownFilterOperator.DoesNotContains:
                                    foreach (var value in valueList)
                                    {
                                        subFilter += $" !{propName}.Contains(\"{value}\") And ";
                                    }

                                    if (!string.IsNullOrEmpty(subFilter))
                                    {
                                        subFilter = subFilter[..^5]; // Remove last ' And '
                                        var filterNull = $"string.IsNullOrEmpty({propName})";
                                        filter += $"({filterNull} || ({subFilter})) And ";
                                    }
                                    break;
                            }
                        }
                    } 
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

            return filter;
        }

        #endregion

        #region DATE AND DATETIME FILTERS
        //This is used to filter date properties in the filter mapping
        public string FilterDateOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            try
            {
                Enum.TryParse(item.FilterOperator.ToString(), out StudyNestDateTimeFilterOperator operatorDateTime);

                var filterValue = item.Value?.ToString();

                if (operatorDateTime != StudyNestDateTimeFilterOperator.Between &&
                    operatorDateTime != StudyNestDateTimeFilterOperator.Quarter)
                {
                    if ((filterValue.StartsWith("{") && filterValue.EndsWith("}")) ||
                        (filterValue.StartsWith("[") && filterValue.EndsWith("]")))
                    {
                        item.Value = null;
                    }
                }

                if (operatorDateTime == StudyNestDateTimeFilterOperator.Between &&
                    filterValue.StartsWith("[") && filterValue.EndsWith("]"))
                {
                    item.Value = null;
                }

                if (operatorDateTime == StudyNestDateTimeFilterOperator.Quarter &&
                    filterValue.StartsWith("{") && filterValue.EndsWith("}"))
                {
                    item.Value = null;
                }

                if (!string.IsNullOrEmpty(item.Value?.ToString()))
                {
                    var propName = $"{mainTBL}{item.Prop.UpperFirstChar()}";
                    var dateTime = (DateTime)item.Value;
                    var datetimeFilter = new DateTimeOffset(dateTime, TimeSpan.Zero);

                    if (!string.IsNullOrEmpty(item.FilterOperator?.ToString()))
                    {
                        var startOfDate = datetimeFilter;
                        var lastOfDate = datetimeFilter.AddDays(1).AddTicks(-1);

                        switch (operatorDateTime)
                        {
                            case StudyNestDateTimeFilterOperator.IsEqualTo:
                                filter += $" ({propName} >= \"{startOfDate}\" And {propName} <= \"{lastOfDate}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.IsNotEqualTo:
                                filter += $" ({propName} < \"{startOfDate}\" Or {propName} > \"{lastOfDate.AddSeconds(1)}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.IsAfter:
                                filter += $" ({propName} >= \"{lastOfDate}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.IsAfterOrEqual:
                                filter += $" ({propName} >= \"{startOfDate}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.IsBefore:
                                filter += $" ({propName} < \"{startOfDate}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.IsBeforeOrEqual:
                                filter += $" ({propName} < \"{lastOfDate}\") And ";
                                break;

                            case StudyNestDateTimeFilterOperator.Between:
                                {
                                    var dataValue = item.Value.ToString();
                                    if (dataValue.StartsWith("{") && dataValue.EndsWith("}"))
                                    {
                                        var dateRange = JsonConvert.DeserializeObject<DateRangeFilter>(dataValue);
                                        filter += $" ({propName} >= \"{dateRange.StartDate}\" And {propName} <= \"{dateRange.EndDate}\") And ";
                                    }
                                }
                                break;

                            case StudyNestDateTimeFilterOperator.Quarter:
                                {
                                    var dataValue = item.Value.ToString();
                                    if (dataValue.StartsWith("[") && dataValue.EndsWith("]"))
                                    {
                                        var quarters = JsonConvert.DeserializeObject<List<int>>(dataValue);
                                        foreach (var (value, index) in quarters.Select((v, i) => (v, i)))
                                        {
                                            if (index == 0) filter += "(";
                                            var range = StudyNestExtension.GetDateTimeByQuarter(value);
                                            filter += $" ({propName} >= \"{range.StartDate}\" And {propName} <= \"{range.EndDate}\") Or ";
                                        }

                                        if (!string.IsNullOrEmpty(filter))
                                        {
                                            filter = filter.Remove(filter.Length - 4); // Remove last " Or "
                                            filter += ") And ";
                                        }
                                    }
                                }
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

            return filter;
        }

        //This is used to filter date property on a json stored
        private void FilterDateTimeJsonOperator<T>(ref IQueryable<T> query, FilterMapping item, string mainTBL = "")
        {
            try
            {
                if (item.Value != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "o");
                    var extractAndConvert = StudyNestEFFunction.ExtractAndConvertDateTime(parameter, item.DynamicProperty, $"\"{item.Prop}\"");


                    DateTimeOffset.TryParse(item.Value.ToString(), out DateTimeOffset datetimeFilter);
                    var dateTimeOffset = datetimeFilter.UtcDateTime;
                    var value = Expression.Constant(dateTimeOffset);
                    var startDate = Expression.Constant(dateTimeOffset);
                    var endDate = Expression.Constant(dateTimeOffset);

                    if (extractAndConvert != null)
                    {
                        var conditionQuery = Expression.Equal(extractAndConvert, value);
                        Enum.TryParse<StudyNestDateTimeFilterOperator>(item.FilterOperator.ToString(), out StudyNestDateTimeFilterOperator operatorNumber);

                        switch (operatorNumber)
                        {
                            case StudyNestDateTimeFilterOperator.IsNotEqualTo:
                                {
                                    conditionQuery = Expression.NotEqual(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsAfter:
                                {
                                    conditionQuery = Expression.GreaterThan(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsAfterOrEqual:
                                {
                                    conditionQuery = Expression.GreaterThanOrEqual(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsBefore:
                                {
                                    conditionQuery = Expression.LessThan(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsBeforeOrEqual:
                                {
                                    conditionQuery = Expression.LessThanOrEqual(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.Between:
                                {
                                    var daterangeFilter = JsonConvert.DeserializeObject<DateRangeFilter>(item.Value.ToString());
                                    startDate = Expression.Constant(daterangeFilter.StartDate?.UtcDateTime);
                                    endDate = Expression.Constant(daterangeFilter.EndDate?.UtcDateTime);
                                    conditionQuery = Expression.GreaterThanOrEqual(extractAndConvert, startDate);
                                    conditionQuery = Expression.AndAlso(conditionQuery, Expression.LessThanOrEqual(extractAndConvert, endDate));
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.Quarter:
                                {
                                    int countQuarter = 0;
                                    var daterangeFilter = JsonConvert.DeserializeObject<List<int>>(item.Value.ToString());
                                    foreach (var daterange in daterangeFilter)
                                    {
                                        countQuarter += 1;
                                        var quarterRange = StudyNestExtension.GetDateTimeByQuarter(daterange);
                                        startDate = Expression.Constant(quarterRange.StartDate?.UtcDateTime);
                                        endDate = Expression.Constant(quarterRange.EndDate?.UtcDateTime);
                                        var subConditionQuery = Expression.AndAlso(
                                            Expression.GreaterThanOrEqual(extractAndConvert, startDate),
                                            Expression.LessThanOrEqual(extractAndConvert, endDate));
                                        if (countQuarter == 1) conditionQuery = subConditionQuery;
                                        else conditionQuery = Expression.OrElse(conditionQuery, subConditionQuery);
                                    }
                                    break;
                                }
                        }
                        var lambda = Expression.Lambda<Func<T, bool>>(conditionQuery, parameter);
                        query = query.Where(lambda);
                    }
                }
            }
            catch (Exception ex)
            {
               StudyNestLogger.Instance.Error(ex);
            }
        }

        private void FilterDateJsonOperator<T>(ref IQueryable<T> query, FilterMapping item, string mainTBL = "")
        {
            try
            {
                if (item.Value != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "o");
                    var extractAndConvert = StudyNestEFFunction.ExtractAndConvertDateTime(parameter, item.DynamicProperty, $"\"{item.Prop}\"");


                    DateTimeOffset.TryParse(item.Value.ToString(), out DateTimeOffset datetimeFilter);
                    var dateTimeOffset = datetimeFilter.UtcDateTime;
                    var value = Expression.Constant(dateTimeOffset);
                    var startDate = Expression.Constant(dateTimeOffset);
                    var endDate = Expression.Constant(dateTimeOffset);

                    if (extractAndConvert != null)
                    {
                        var conditionQuery = Expression.Equal(extractAndConvert, value);
                        Enum.TryParse<StudyNestDateTimeFilterOperator>(item.FilterOperator.ToString(), out StudyNestDateTimeFilterOperator operatorNumber);

                        switch (operatorNumber)
                        {
                            case StudyNestDateTimeFilterOperator.IsEqualTo:
                                {
                                    endDate = Expression.Constant(dateTimeOffset.AddDays(1).AddSeconds(-1));
                                    conditionQuery = Expression.AndAlso(
                                        Expression.GreaterThanOrEqual(extractAndConvert, startDate),
                                        Expression.LessThanOrEqual(extractAndConvert, endDate));
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsNotEqualTo:
                                {
                                    startDate = Expression.Constant(dateTimeOffset.AddSeconds(-1));
                                    endDate = Expression.Constant(dateTimeOffset.AddDays(1));
                                    conditionQuery = Expression.OrElse(
                                        Expression.GreaterThanOrEqual(extractAndConvert, endDate),
                                        Expression.LessThanOrEqual(extractAndConvert, startDate));
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsAfter:
                                {
                                    endDate = Expression.Constant(dateTimeOffset.AddDays(1).AddSeconds(-1));
                                    conditionQuery = Expression.GreaterThan(extractAndConvert, endDate);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsAfterOrEqual:
                                {
                                    endDate = Expression.Constant(dateTimeOffset.AddDays(1));
                                    conditionQuery = Expression.GreaterThanOrEqual(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsBefore:
                                {
                                    conditionQuery = Expression.LessThan(extractAndConvert, value);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.IsBeforeOrEqual:
                                {
                                    endDate = Expression.Constant(dateTimeOffset.AddDays(1).AddSeconds(-1));
                                    conditionQuery = Expression.LessThanOrEqual(extractAndConvert, endDate);
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.Between:
                                {
                                    var daterangeFilter = JsonConvert.DeserializeObject<DateRangeFilter>(item.Value.ToString());
                                    startDate = Expression.Constant(daterangeFilter.StartDate?.UtcDateTime);
                                    endDate = Expression.Constant(daterangeFilter.EndDate?.UtcDateTime.AddDays(1).AddSeconds(-1));
                                    conditionQuery = Expression.GreaterThanOrEqual(extractAndConvert, startDate);
                                    conditionQuery = Expression.AndAlso(conditionQuery, Expression.LessThanOrEqual(extractAndConvert, endDate));
                                    break;
                                }
                            case StudyNestDateTimeFilterOperator.Quarter:
                                {
                                    int countQuarter = 0;
                                    var daterangeFilter = JsonConvert.DeserializeObject<List<int>>(item.Value.ToString());
                                    foreach (var daterange in daterangeFilter)
                                    {
                                        countQuarter += 1;
                                        var quarterRange = StudyNestExtension.GetDateTimeByQuarter(daterange);
                                        startDate = Expression.Constant(quarterRange.StartDate?.UtcDateTime);
                                        endDate = Expression.Constant(quarterRange.EndDate?.UtcDateTime);
                                        var subConditionQuery = Expression.AndAlso(
                                            Expression.GreaterThanOrEqual(extractAndConvert, startDate),
                                            Expression.LessThanOrEqual(extractAndConvert, endDate));
                                        if (countQuarter == 1) conditionQuery = subConditionQuery;
                                        else conditionQuery = Expression.OrElse(conditionQuery, subConditionQuery);
                                    }
                                    break;
                                }
                        }
                        var lambda = Expression.Lambda<Func<T, bool>>(conditionQuery, parameter);
                        query = query.Where(lambda);
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }
        #endregion

        #region BOOLEAN FILTERS
        public string FilterBooleanOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            var tempValue = item.Value?.ToString()
                .Replace("[", string.Empty)
                .Replace("]", string.Empty)
                .Replace("\r\n", string.Empty)
                .Trim();

            if (string.IsNullOrEmpty(tempValue) || string.IsNullOrEmpty(item.FilterOperator?.ToString()))
                return filter;

            if (Enum.TryParse<StudyNestBooleanFilterOperator>(item.FilterOperator.ToString(), out var operatorDropDown))
            {
                var column = $"{mainTBL}{item.Prop.UpperFirstChar()}";
                var tempValueLower = tempValue.ToLower();

                switch (operatorDropDown)
                {
                    case StudyNestBooleanFilterOperator.Contains:
                        if (tempValueLower == "false")
                            filter += $" {column} != true And ";
                        else if (tempValueLower == "true")
                            filter += $" {column} = true And ";
                        else
                            filter += $" {column} in ({tempValue},null) And ";
                        break;

                    case StudyNestBooleanFilterOperator.DoesNotContains:
                        if (tempValueLower == "false")
                            filter += $" {column} = true And ";
                        else if (tempValueLower == "true")
                            filter += $" {column} != true And ";
                        else
                            filter += $" !({column} in ({tempValue},null)) And ";
                        break;
                }
            }

            return filter;
        }
        #endregion

        #region NUMBER FILTERS
        public string FilterNumberOperator(string filter, FilterMapping item, string mainTBL = "")
        {
            try
            {
                if (item.Value != null)
                {
                    Double.TryParse(item.Value?.ToString(), out double number);
                    Enum.TryParse<StudyNestNumberFilterOperator>(item.FilterOperator.ToString(), out StudyNestNumberFilterOperator operatorNumber);

                    string prop = string.IsNullOrEmpty(mainTBL)
                        ? item.Prop.UpperFirstChar()
                        : $"{mainTBL}.{item.Prop.UpperFirstChar()}";

                    switch (operatorNumber)
                    {
                        case StudyNestNumberFilterOperator.IsEqualTo:
                            filter += $" {prop} = {number} And ";
                            break;
                        case StudyNestNumberFilterOperator.IsNotEqualTo:
                            filter += $" {prop} != {number} And ";
                            break;
                        case StudyNestNumberFilterOperator.IsGreaterThan:
                            filter += $" {prop} > {number} And ";
                            break;
                        case StudyNestNumberFilterOperator.IsGreaterThanOrEqualTo:
                            filter += $" {prop} >= {number} And ";
                            break;
                        case StudyNestNumberFilterOperator.IsLessThan:
                            filter += $" {prop} < {number} And ";
                            break;
                        case StudyNestNumberFilterOperator.IsLessThanOrEqualTo:
                            filter += $" {prop} <= {number} And ";
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return filter;
        }

        private void FilterNumberJsonOperator<T>(ref IQueryable<T> query, FilterMapping item, string mainTBL = "")
        {
            try
            {
                if (item.Value != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "o"); //Hard a parameter for expression
                    var extractAndConvert = StudyNestEFFunction.ExtractAndConvertToDouble(parameter, item.DynamicProperty, $"\"{item.Prop}\"");

                    Double.TryParse(item.Value?.ToString(), out double number);
                    var value = Expression.Constant(number, typeof(double));

                    if (extractAndConvert != null)
                    {
                        var conditionQuery = Expression.Equal(extractAndConvert, value);  //Initial the default condition "Equals"

                        Enum.TryParse<StudyNestNumberFilterOperator>(item.FilterOperator.ToString(), out StudyNestNumberFilterOperator operatorNumber);
                        switch (operatorNumber)
                        {
                            case StudyNestNumberFilterOperator.IsEqualTo:
                                conditionQuery = Expression.Equal(extractAndConvert, value);
                                break;
                            case StudyNestNumberFilterOperator.IsNotEqualTo:
                                conditionQuery = Expression.NotEqual(extractAndConvert, value);
                                break;
                            case StudyNestNumberFilterOperator.IsGreaterThan:
                                conditionQuery = Expression.GreaterThan(extractAndConvert, value);
                                break;
                            case StudyNestNumberFilterOperator.IsGreaterThanOrEqualTo:
                                conditionQuery = Expression.GreaterThanOrEqual(extractAndConvert, value);
                                break;
                            case StudyNestNumberFilterOperator.IsLessThan:
                                conditionQuery = Expression.LessThan(extractAndConvert, value);
                                break;
                            case StudyNestNumberFilterOperator.IsLessThanOrEqualTo:
                                conditionQuery = Expression.LessThanOrEqual(extractAndConvert, value);
                                break;

                        }
                        var lambda = Expression.Lambda<Func<T, bool>>(conditionQuery, parameter);
                        query = query.Where(lambda);
                    }
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }
        #endregion

        #region NULL AND NOT NULL FILTERS
        public string FilterNullOrNotNull(string filter, FilterMapping item, StudyNestAllFilterOperator operatorAll, string mainTBL = "")
        {
            try
            {
                var propName = $"{mainTBL}{item.Prop.UpperFirstChar()}";

                switch (item.FilterType)
                {
                    case StudyNestFilterType.Text:
                    case StudyNestFilterType.DropDown:
                    case StudyNestFilterType.DynamicContent:
                    case StudyNestFilterType.EmailActions:
                        switch (operatorAll)
                        {
                            case StudyNestAllFilterOperator.IsEmpty:
                                filter += $" string.IsNullOrEmpty({propName}) And ";
                                break;
                            case StudyNestAllFilterOperator.IsNotEmpty:
                                filter += $" !string.IsNullOrEmpty({propName}) And ";
                                break;
                        }
                        break;

                    case StudyNestFilterType.DateTime:
                    case StudyNestFilterType.Date:
                    case StudyNestFilterType.Number:
                        switch (operatorAll)
                        {
                            case StudyNestAllFilterOperator.IsEmpty:
                                filter += $" {propName} = null And ";
                                break;
                            case StudyNestAllFilterOperator.IsNotEmpty:
                                filter += $" {propName} != null And ";
                                break;
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }

            return filter;
        }

        private void FilterJsonNullOrEmpty<T>(ref IQueryable<T> query, FilterMapping item)
        {
            try
            {

                var parameter = Expression.Parameter(typeof(T), "o"); //Hard a parameter for expression
                var extractAndConvert = StudyNestEFFunction.ExtractAndUnquote(parameter, item.DynamicProperty, $"\"{item.Prop}\""); //Call JSON_EXTRACT on mysql and Convert To String [Default]        

                Enum.TryParse<StudyNestAllFilterOperator>(item.FilterOperator.ToString(), out StudyNestAllFilterOperator operatorNumber);


                switch (operatorNumber)
                {

                    case StudyNestAllFilterOperator.IsEmpty:
                        var empty = Expression.Equal(extractAndConvert, Expression.Constant("null"));
                        empty = Expression.OrElse(empty, Expression.Equal(extractAndConvert, Expression.Constant(null)));
                        empty = Expression.OrElse(empty, Expression.Equal(extractAndConvert, Expression.Constant(string.Empty)));
                        var lambda = Expression.Lambda<Func<T, bool>>(empty, parameter);
                        query = query.Where(lambda);
                        break;
                    case StudyNestAllFilterOperator.IsNotEmpty:
                        var notEmpty = Expression.NotEqual(extractAndConvert, Expression.Constant("null"));
                        notEmpty = Expression.AndAlso(notEmpty, Expression.NotEqual(extractAndConvert, Expression.Constant(null)));
                        notEmpty = Expression.AndAlso(notEmpty, Expression.NotEqual(extractAndConvert, Expression.Constant(string.Empty)));
                        var lambdaNotEmpty = Expression.Lambda<Func<T, bool>>(notEmpty, parameter);
                        query = query.Where(lambdaNotEmpty);
                        break;

                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
        }
    }
    #endregion

}

