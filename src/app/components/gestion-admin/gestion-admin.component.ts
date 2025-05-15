import { Component , OnInit  } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-gestion-admin',
  templateUrl: './gestion-admin.component.html',
  styleUrls: ['./gestion-admin.component.css']
})
export class GestionAdminComponent implements OnInit{


  alladmins : any = [];
  
  constructor(
    /*private uService :UserService,*/
    private router:Router
  ) {}

  ngOnInit() {
   /* this.getUser();*/
   
  }
/*  deleteUser(id :number ){
    this.uService.deleteUser(id).subscribe(
      ()=>{
        this.uService.getAllUsers().subscribe(
          (response)=> {
            this.alladmins = response;
          }
        )
      }
    )  

  }
  getUser(){
    this.uService.getAllUsers().subscribe((data)=>{
      console.log('Here response from BE' , data);
      this.alladmins = data.filter((user: any) => user.roles.some((r: any) => r.name === 'ROLE_ADMIN'));
    });
  console.log(this.alladmins);
  }*/
}

