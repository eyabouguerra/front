import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

import { UserService } from 'src/app/services/user.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  alladmins: any[] = [];
  allclients: any[] = [];
  alldispatcheurs: any[] = [];

  adminCount = 0;
  clientCount = 0;
  dispatcheurCount = 0;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 15,
            family: 'Verdana',
            weight: 'bold'
          }
        }
      },
      tooltip: {
        enabled: true
      },
      datalabels: {
        color: 'white',       // ✅ Couleur blanche du texte
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value: number) => value // Affiche les nombres
      }
    }
  };
  
  


  public pieChartType: 'pie' = 'pie';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserCounts();
  }

  loadUserCounts(): void {
    forkJoin({
      admins: this.userService.getUsersByRole('Admin'),
      clients: this.userService.getUsersByRole('User'),
      dispatcheurs: this.userService.getUsersByRole('Dispatcheur'),
    }).subscribe(({ admins, clients, dispatcheurs }) => {
      this.alladmins = admins;
      this.allclients = clients;
      this.alldispatcheurs = dispatcheurs;

      this.adminCount = admins.length;
      this.clientCount = clients.length;
      this.dispatcheurCount = dispatcheurs.length;

      this.updateChartData();
    });
  }
  
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Admins', 'Clients', 'Dispatcheurs'],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // couleurs personnalisées
      hoverOffset: 10
    }]
  };

  updateChartData(): void {
    this.pieChartData = {
      labels: ['Admins', 'Clients', 'Dispatcheurs'],
      datasets: [{
        data: [
          this.adminCount,
          this.clientCount,
          this.dispatcheurCount
        ],
        backgroundColor: ['#CD5C5C', 'rgb(41, 37, 36)', '#FFCE56'],
        hoverOffset: 10
      }]
    };
  }
  
}
