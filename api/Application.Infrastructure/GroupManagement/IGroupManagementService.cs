﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Core.Data;
using LMPlatform.Models;

namespace Application.Infrastructure.GroupManagement
{
    public interface IGroupManagementService
    {
        Group GetGroup(int groupId);

        List<Group> GetGroups(IQuery<Group> query = null);

        Group GetGroupWithLiteStudents(int groupId);

        IPageableList<Group> GetGroupsPageable(string searchString = null, IPageInfo pageInfo = null, IEnumerable<ISortCriteria> sortCriterias = null);

        Task<IPageableList<Group>> GetGroupsPageableAsync(string searchString = null, IPageInfo pageInfo = null, ISortCriteria sortCriteria = null);

        Group AddGroup(Group group);

        Group UpdateGroup(Group lecturer);

        void DeleteGroup(int id);

        Group GetGroup(IQuery<Group> query = null);

	    List<string> GetLabsScheduleVisitings(int subjectId, int groupId, int subGorupId);

		List<List<string>> GetLabsScheduleMarks(int subjectId, int groupId);

        List<string> GetPracticalsScheduleVisitings(int subjectId, int groupId);

        List<string> GetCpScheduleVisitings(int subjectId, int groupId, int lecturerId);

        List<List<string>> GetCpScheduleMarks(int subjectId, int groupId, int lecturerId);

        List<string> GetCpPercentage(int subjectId, int groupId, int lecturerId);

        List<List<string>> GetCpMarks(int subjectId, int groupId, int lecturerId);

        Group GetGroupByName(string groupName);

        List<string> GetLabsNames(int subjectId, int groupId);
        List<string> GetPracticalsNames(int subjectId, int groupId);


        List<List<string>> GetLabsMarks(int subjectId, int groupId);
        List<List<string>> GetPracticalsMarks(int subjectId, int groupId);

        List<List<string>> GetPracticalsScheduleMarks(int subjectId, int groupId);
        List<Group> GetLecturesGroups(int id, bool activeOnly = false);
    }
}