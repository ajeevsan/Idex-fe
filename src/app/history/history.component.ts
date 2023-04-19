import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { webSocket } from 'rxjs/webSocket'
import { HomeService } from '../home.service';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from "highcharts/highstock";

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  // myFunc(stName: string, plotHours:any,  plotActuals:any, plotPreds:any, plotErrors:any,RTF_VALUES:any)
  // {
  //   console.log("Inside myFunc 1 $$$$$$$$$$$$$$$")
  //   {
  //       this.DDD = this.RTF_VALUES.DDD
  //       this.FF  = this.RTF_VALUES.FF
  //       this.FMFM = this.RTF_VALUES.FMFM
  //       this.DB = this.RTF_VALUES.DB
  //       this.DP = this.RTF_VALUES.DP
  //       this.WB = this.RTF_VALUES.WB
  //       this.RH = this.RTF_VALUES.RH
  //       this.QFE = this.RTF_VALUES.QFE
  //       this.QFF = this.RTF_VALUES.QFF
  //       this.RRR = this.RTF_VALUES.RRR
  //       this.MinTemp = this.RTF_VALUES.MinTemp
  //       this.MaxTemp = this.RTF_VALUES.MaxTemp

  //       this.options1 =  {
  //         chart: {
  //           type: 'line',
  //           scrollablePlotArea: {
  //             minWidth: 200,
  //           },
  //           height: 600,
  //           width: 1000
  //         },
  //         title: {
  //           text: 'Predicted and Actual for ' + this.stname
  //         },
  //         plotOptions: {
  //           series: {
  //               fillOpacity: 0.5
  //           }
  //         },
  //         // tooltip: {
  //         //   formatter: function() {return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', 1) +' y: ' + 100;    }
  //         // },
  //         xAxis: {
  //           // min: 0,
  //           // max: 4,
  //           scrollPositionX:1,
  //           scrollbar: {
  //             enabled: true
  //           },
  //           title: {
  //             text: 'Time'
  //           },
  //           categories: plotHours
  //         },
  //         yAxis: {
  //           max: 10000,
  //           title: {
  //             text: 'Viisbility'
  //           }
  //         },
  //         legend: {
  //           layout: 'vertical',
  //           align: 'right',
  //           verticalAlign: 'top',
  //           x: -100,
  //           y: 100,
  //           floating: true,
  //           borderWidth: 1,
  //           backgroundColor: '#FFFFFF',
  //           shadow: true
  //         },
  //         series: [{
  //           type:'spline',
  //           color:'red',
  //           name:"Predicted",
  //           data : plotPreds },
  //           {
  //           type:'spline',
  //           color:'green',
  //           name:"Actual",
  //           data: plotActuals
  //           }]
  //       };

  //       this.options2 =  {
  //         chart: {
  //           type: 'line',
  //           scrollablePlotArea: {
  //             minWidth: 200
  //           },
  //           height:400
  //         },
  //         title: {
  //           text: 'Error graph for ' + this.stname
  //         },
  //         plotOptions: {
  //           series: {
  //               fillOpacity: 0.1
  //           }
  //         },
  //         // tooltip: {
  //         //   formatter: function() {return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', 1) +' y: ' + 100;    }
  //         // },
  //         xAxis: {
  //           // min:0,
  //           // max:3,
  //           scrollbar: {
  //             enabled: true
  //           },
  //           title: {
  //             text: 'Time'
  //           },
  //           categories: plotHours
  //         },
  //         yAxis: {
  //           max: 5000,
  //           title: {
  //             text: 'Error'
  //           }
  //         },
  //         legend: {
  //           layout: 'vertical',
  //           align: 'right',
  //           verticalAlign: 'top',
  //           x: -100,
  //           y: 100,
  //           floating: true,
  //           borderWidth: 1,
  //           backgroundColor: '#FFFFFF',
  //           shadow: true
  //       },
  //         series: [{
  //           name:"Mean Squared Error",
  //           data:plotErrors
  //       }]
  //       };
        
        
  //       Highcharts.chart('chart1', this.options1);
  //       Highcharts.chart('chart2', this.options2);
  //   }
  // }
}
