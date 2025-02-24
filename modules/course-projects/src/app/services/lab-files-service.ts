import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class LabFilesService {
  constructor(private http: HttpClient) {}

  public getCourseProjectFilesForUser(
    subjectId: string,
    userId: string
  ): Observable<any> {
    return this.http.post('Services/Courses/CoursesService.svc/GetFiles', {
      isCoursPrj: true,
      subjectId,
      userId,
    })
  }

  public getCourseProjectFiles(params: any): Observable<any> {
    return this.http.get('Services/Courses/CoursesService.svc/GetFilesV2', {
      params: new HttpParams({ fromObject: params }),
    })
  }

  public uploadFile(file: File): Observable<any> {
    const uploadData = new FormData()
    uploadData.append('files[]', file, file.name)
    return this.http.post('api/Upload', uploadData)
  }

  public deleteFile(deleteUrl: string): Observable<any> {
    return this.http.delete(deleteUrl)
  }

  public sendJob(body: any): Observable<any> {
    return this.http.post(
      'Services/UserFiles/UserFilesService.svc/SendFile',
      body
    )
  }

  public deleteJob(id: string): Observable<any> {
    return this.http.post(
      'Services/UserFiles/UserFilesService.svc/DeleteUserFile',
      { id }
    )
  }

  public getAttachment(params: any): Observable<any> {
    return this.http.get('api/Upload', {
      params: new HttpParams({ fromObject: params }),
    })
  }

  public approveJob(userFileId: string): Observable<any> {
    return this.http.post(
      'Services/UserFiles/UserFilesService.svc/ReceivedFile',
      { userFileId }
    )
  }

  public restoreFromArchive(userFileId: string): Observable<any> {
    return this.http.post(
      'Services/UserFiles/UserFilesService.svc/CancelReceivedFile',
      { userFileId }
    )
  }

  public checkPlagiarism(body: {
    subjectId: string
    userFileId: number
  }): Observable<any> {
    return this.http
      .post('Services/UserFiles/UserFilesService.svc/CheckPlagiarism', {
        ...body,
        isCp: true,
      })
      .pipe(map((res) => res['DataD']))
  }

  public checkPlagiarismSubjects(body: {
    subjectId: string
    threshold: string
    type: string
  }): Observable<any> {
    return this.http
      .post('Services/UserFiles/UserFilesService.svc/CheckPlagiarismSubjects', {
        ...body,
        isCp: true,
      })
      .pipe(map((res) => res['DataD']))
  }
}
