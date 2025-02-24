﻿using Application.Core.Data;
using LMPlatform.Models;
using System.Collections.Generic;

namespace Application.Infrastructure.PracticalManagement
{
    public interface IPracticalManagementService
    {
        void DeletePracticals(int id);

        List<Practical> GetPracticals(Query<Practical> query);

        List<ScheduleProtectionPractical> GetScheduleProtectionPractical(int subjectId, int groupId);

        void SaveStudentPracticalMark(StudentPracticalMark studentPracticalMark);

        List<ScheduleProtectionPractical> GetScheduleProtectionPractical(Query<ScheduleProtectionPractical> query);
        List<string> GetPracticalsAttachments(int subjectId);
        void SavePracticalVisitingData(List<ScheduleProtectionPracticalMark> protectionPracticalMarks);

        void DeletePracticalScheduleDate(int id);

        void SaveScheduleProtectionPracticalDate(ScheduleProtectionPractical scheduleProtectionPractical);
        Practical GetPractical(int id);
        void UpdatePracticalsOrder(int subjectId, int prevIndex, int currentIndex);
        IList<Practical> GetSubjectPracticals(int subjectId);
        Practical SavePractical(Practical practical, IList<Attachment> attachments, int userId);

        void SavePracticalMarks(List<StudentPracticalMark> studentPracticalMarks);

        IEnumerable<UserLabFiles> GetUserPracticalFiles(int userId, int subjectId);

        bool HasSubjectProtection(int groupId, int subjectId);
        List<UserLabFiles> GetGroupPracticalFiles(int subjectId, int groupId);
        List<UserLabFiles> GetStudentLabFiles(int subjectId, int studentId);
    }
}
