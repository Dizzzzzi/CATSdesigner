import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {VisitStats} from '../../models/visit-stats.model';
import {VisitStatsService} from '../../services/visit-stats.service';
import {Subscription} from 'rxjs';
import {Consultation} from '../../models/consultation.model';
import {ConsultationMark} from '../../models/consultation-mark.model';
import {DiplomUser} from '../../models/diplom-user.model';
import {AddDateDialogComponent} from './add-date-dialog/add-date-dialog.component';
import {MatDialog, MatOptionSelectionChange, MatSnackBar} from '@angular/material';
import {VisitingPopoverComponent} from '../../shared/visiting-popover/visiting-popover.component';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import { CoreGroup } from 'src/app/models/core-group.model';
import { Lecturer } from 'src/app/models/lecturer.model';
// import { Console } from 'console';

@Component({
  selector: 'app-visit-stats',
  templateUrl: './visit-stats.component.html',
  styleUrls: ['./visit-stats.component.less']
})
export class VisitStatsComponent implements OnInit {
  @Input() diplomUser: DiplomUser;

  private COUNT = 1000;
  private PAGE = 1;

  private visitStatsSubscription: Subscription;

  private visitStatsList: VisitStats[];
  private filteredVisitStatsList: VisitStats[];
  private consultations: Consultation[];
  private lecturers: Lecturer[];
  private index = 0;
  private lecturer: Lecturer;
  public isLecturer = false;

  private searchString = '';

  constructor(private visitStatsService: VisitStatsService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.retrieveVisitStats();
  }

  selectedLecturer(event: any) {
    this.index = this.lecturers.map(function(e) { return e.Id; }).indexOf(event.Id);
    this.retrieveVisitStats()
  }

  public getDiplomUser() {
    return this.diplomUser;
  }

  retrieveVisitStats() {
    if (this.diplomUser.IsSecretary) {
      console.log("this.diplomUser.IsSecretary")
      this.visitStatsService.getLecturerDiplomGroups({entity: 'LecturerForSecretary', id: this.diplomUser.UserId})
      .subscribe(res => {
        this.lecturers = res
        this.lecturer = res[this.index]
        this.visitStatsList = null;
    this.visitStatsSubscription = this.visitStatsService.getVisitStats({
      count: this.COUNT, page: this.PAGE,
      filter: '{"isSecretary":"' + !this.isLecturer + '","lecturerId":"' + this.lecturers[this.index].Id + '"}'
    })
      .subscribe(res => {
        console.log("ZXC")
        this.visitStatsList = this.assignResults(res.Students.Items, res.DiplomProjectConsultationDates);
        this.consultations = res.DiplomProjectConsultationDates;
        this.filteredVisitStatsList = this.visitStatsList;
      });
      });
    }
    else {
      this.visitStatsList = null;
    this.visitStatsSubscription = this.visitStatsService.getVisitStats({
      count: this.COUNT, page: this.PAGE,
      filter: '{"isSecretary":"' + !this.isLecturer + '"}'
    })
      .subscribe(res => {
        this.visitStatsList = this.assignResults(res.Students.Items, res.DiplomProjectConsultationDates);
        this.consultations = res.DiplomProjectConsultationDates;
        this.filteredVisitStatsList = this.visitStatsList;
      });
    }
  }

  onSearchChange(searchText: string) {
    this.searchString = searchText;
    this.updateStats();
  }

  lecturerStatusChange(event) {
    this.isLecturer = event.checked;
    console.log("QWQEQWEQWEQWEQQQQQQQQQQQQQQ")
    // this.retrieveVisitStats()
  }

  updateStats() {
    if (this.visitStatsSubscription) {
      this.visitStatsSubscription.unsubscribe();
    }
    console.log("UPDATE_STATS")
    this.retrieveVisitStats();
  }

  assignResults(visitStats: VisitStats[], consultations: Consultation[]): VisitStats[] {
    // this.groups = visitStats.map(a => a.Group).filter((v, i, a) => a.indexOf(v) === i);
    for (const student of visitStats) {
      const results: ConsultationMark[] = [];
      for (const consultation of consultations) {
        const result = student.DiplomProjectConsultationMarks.find(cm => cm.ConsultationDateId === consultation.Id);
        if (result != null) {
          if (result.Mark != null) {
            result.Mark = result.Mark.trim();
          }
          results.push(result);
        } else {
          // @ts-ignore
          const cm: ConsultationMark = {StudentId: student.Id, ConsultationDateId: consultation.Id};
          results.push(cm);
        }
      }
      student.DiplomProjectConsultationMarks = results;
    }
    return visitStats;
  }

  setVisitMarks(consultationDateId: string) {
    const date = new Date(this.consultations.find(consultation => consultation.Id === consultationDateId).Day).toLocaleDateString();
    const visits = {date, students: []};
    this.visitStatsList.forEach(stats => {
      const mark = stats.DiplomProjectConsultationMarks.find(stat => stat.ConsultationDateId === consultationDateId);
      const visit = {
        name: stats.Name,
        mark: mark.Mark,
        comments: mark.Comments,
        id: mark.Id,
        consultationDateId: mark.ConsultationDateId,
        studentId: mark.StudentId
      };
      visits.students.push(visit);
    });

    const dialogRef = this.dialog.open(VisitingPopoverComponent, {
      autoFocus: false,
      width: '700px',
      data: {
        title: 'Посещаемость студентов',
        buttonText: 'Сохранить',
        body: visits
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processDialogResult(result, false);
      }
    });
  }

  processDialogResult(result: any, hasChanges: boolean) {
    const visit = result.students.pop();
    if (visit != null) {
      if (visit.id == null) {
        if (visit.mark || visit.comment || visit.comment !== '') {
          hasChanges = true;
          this.visitStatsService.setMark(visit.studentId, visit.consultationDateId, visit.mark, visit.comment)
            .subscribe(() => this.processDialogResult(result, hasChanges));
        } else {
          this.processDialogResult(result, hasChanges);
        }
      } else {
        const origin = this.visitStatsList.find(stats => stats.Id === visit.studentId).DiplomProjectConsultationMarks
          .find(mark => mark.Id === visit.id);
        if (origin.Mark !== visit.mark || origin.Comments !== visit.comment) {
          hasChanges = true;
          this.visitStatsService.editMark(visit.id, visit.studentId, visit.consultationDateId, visit.mark, visit.comment)
            .subscribe(() => this.processDialogResult(result, hasChanges));
        } else {
          this.processDialogResult(result, hasChanges);
        }
      }
    } else if (hasChanges) {
      this.ngOnInit();
      this.addFlashMessage('Посещаемость успешно обновлена');
    }
  }

  addDate() {
    const dialogRef = this.dialog.open(AddDateDialogComponent, {
      autoFocus: false,
      width: '450px',
      data: {
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        const date = new Date(result.date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        this.visitStatsService.addDate(date.toISOString(), result.start, 
        result.end, result.audience, result.building).subscribe(() => {
          this.ngOnInit();
          this.addFlashMessage('Дата консультации успешно добавлена');
        });
      }
    });
  }

  deleteVisitDate(consultation: Consultation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      width: '400px',
      data: {
        label: 'Удаление даты консультации',
        message: 'Вы действительно хотите удалить дату консультации?',
        actionName: 'Удалить',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result) {
        this.visitStatsService.deleteDate(consultation.Id).subscribe(() => {
          this.ngOnInit();
          this.addFlashMessage('Дата успешно удалена');
        });
      }
    });
  }

  addFlashMessage(msg: string) {
    this.snackBar.open(msg, null, {
      duration: 2000
    });
  }

}
