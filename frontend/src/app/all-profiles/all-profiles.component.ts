import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/user.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-all-profiles',
  templateUrl: './all-profiles.component.html',
  styleUrls: ['./all-profiles.component.css']
})
export class AllProfilesComponent implements OnInit {

  constructor(private httpservice: HttpClient, private router: Router) { }

  Full: any;
  ngOnInit() {
    this.getFullname();
  }

  getFullname() {
    this.httpservice.get('http://localhost:3000/api/allProfile').subscribe(user => {
      this.Full = user;
    })
  }

  delete(policy) {
    const payload = {
      _id: policy._id
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Account detail !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        Swal.fire(
          'Deleted!',
          'Your Account detail has been deleted.',
          'success'
        )
        this.httpservice.post('http://localhost:3000/api/deleteProfile', payload).subscribe(res => {
          console.log(res, 'delete result');
          this.router.navigateByUrl('/login');
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Your Account detail is safe :)',
          'error'
        )
      }
    })
  }

  getMyaccount() {
    this.router.navigate(['/userprofile']);
  }
}
