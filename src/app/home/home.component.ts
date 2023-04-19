import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { webSocket } from 'rxjs/webSocket';
import { HomeService } from '../home.service';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from 'highcharts/highstock';
import * as XLSX from 'xlsx';
import { CitylistService } from '../citylist.service';
import { ForecasthoursService } from '../forecasthours.service';
import { InitialpredService } from '../initialpred.service';
import { ConnectableObservable, range } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { style } from '@angular/animations';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

require('highcharts/modules/exporting')(Highcharts);

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
  public cityList: any;
  public hourList: any;
  public url: any;
  public reload_page: any;
  public subject: any;
  public subscribing: any;
  public predictions: any;
  public datelist: any;
  public lastPAEValues: any;
  public recentPAEValues: any;
  public selectedPAEValues: any;
  public RTF_VALUES: any;
  public Vis: any[] = [];
  public data: any[] = [];
  public x: any;
  public DS: any;
  public dbV: any;
  public pred: any;
  public catchCall: any;
  public catchCall2: any;
  stname: string = '';
  fchr: string = '';
  public dt: any;

  public hRecent: any;
  public pRecent: any;

  public hLast: any;
  public aLast: any;
  public pLast: any;
  public eLast: any;

  public hSelected: any;
  public hSelectedDate: any[] = [];
  public hSelectedDateCopy: any[] = [];
  public aSelected: any;
  public pSelected: any;
  public eSelected: any;

  public hSelected24: any[] = [];
  public aSelected24: any[] = [];
  public pSelected24: any[] = [];
  public eSelected24: any[] = [];

  public isPast: false;
  public found: any;
  public hours = [
    '00:00',
    '00:30',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
  ];

  public prev: any[] = [];
  public temp: any[] = [];

  public displayHours: any[] = [];
  public displayActuals: any[] = [];
  public displayPreds: any[] = [];
  public displayErrors: any[] = [];

  public hh: any[] = [];
  public aa: any[] = [];
  public pp: any[] = [];
  public ee: any[] = [];

  currentDate: string = '';

  public options1: any;
  public options2: any;

  public flag1: any = false;
  public flag2: any = false;

  public selectedDate: any;
  // input_date:any;
  public input_date = '2022-09-06';

  dateSelected: any;

  public startDate = new Date(2022, 8, 6);
  public td: string = '';
  public td_formatted: any;
  // startDate = new Date();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public service: HomeService,
    public service2: CitylistService,
    public service3: InitialpredService,
    public http: HttpClient,
    public datepipe: DatePipe
  ) {
    console.log('Inside constructor $$$$$$$$$$$$$$$');
    setInterval(() => {
      // console.log("inside setinterval...")
      this.currentDate = new Date().toString();

      // console.log("below greet...")
    }, 1000);

    this.service2.getCityList().subscribe((dropdownOptions) => {
      console.log(dropdownOptions);
      this.cityList = dropdownOptions['city_list'];
      this.hourList = dropdownOptions['hour_list'];
      this.stname = this.cityList[0];
      this.fchr = this.hourList[0];
      this.selectedDate = this.startDate;
      this.dt = this.currentDate;
      // this.dt = this.selectedDate;
      this.isPast = false;
      this.service
        .getBackendData(this.stname, this.selectedDate, this.fchr, this.isPast)
        .subscribe((calledData) => {
          this.catchCall = calledData;
          this.found = 0;
          this.getInitialPredictions();
          this.greet();
        });
      // this.greet();
    });
  }

  ngOnInit(): void {
    console.log('Inside ngOninit $$$$$$$$$$$$$$$');
    // this.service2.getCityList().subscribe(cities =>
    //   {
    //     this.cityList = cities['city_list']
    //   })
    //  this.receiveData()
  }
  dateChanged(event: any) {
    console.log('date selceted newly put', this.dateSelected);
  }
  stationName(event: any) {
    console.log('Inside fun $$$$$$$$$$$$$$$');
    this.stname = event.target.value;
    this.dt = this.currentDate;
    this.flag1 = true;
  }

  sendToBackend(selDate: any) {
    this.service
      .getBackendData(this.stname, selDate, this.fchr, this.isPast)
      .subscribe((calledData) => {
        this.catchCall = calledData;
        this.found = 0;
        this.getInitialPredictions();
      });
  }

  selectdate(event: MatDatepickerInputEvent<Date>) {
    this.selectedDate = event.value;
    console.log(
      'Selected date old^^^^^^^^^^^^^^^^^^',
      this.selectedDate,
      typeof this.selectedDate
    );
    let newDate = new Date(this.selectedDate);
    newDate.setMinutes(newDate.getDate() + 1);
    this.selectedDate = newDate;
    var offsetMs = this.selectedDate.getTimezoneOffset() * 60000;
    this.selectedDate = new Date(this.selectedDate.getTime() - offsetMs);

    console.log('Selected date  new^^^^^^^^^^^^^^^^^^', this.selectedDate);
    this.sendToBackend(this.selectedDate);
  }

  forecastHour(event: any) {
    console.log('Inside forecasthour $$$$$$$$$$$$$$$');
    this.dt = this.currentDate;
    this.fchr = event.target.value;
    this.flag2 = true;
    console.log('fchr-----', this.fchr);
    console.log('dt-----', this.dt);
    console.log('stname-----', this.stname);

    this.sendToBackend(this.selectedDate);
  }

  fileName = 'download.xlsx';

  exportexcel(): void {
    console.log('Inside exportexcel $$$$$$$$$$$$$$$');
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet');

    XLSX.writeFile(wb, 'recentData_'.concat(this.currentDate.toString()));
  }

  greet(): void {
    console.log('Inside greet $$$$$$$$$$$$$$$');
    // this.currentDate = new Date().toString();
    // this.service2.getCityList().subscribe(dropdownOptions =>
    //   {
    //     this.cityList = dropdownOptions['city_list']
    //     this.hourList = dropdownOptions['hour_list']
    //   })
    this.receiveData();
  }
  pastGraphs() {
    console.log('Inside pastgraphs $$$$$$$$$$$$$$$');
    this.router.navigateByUrl('/pastGraphs');
  }

  dbVal: string = '';
  DDD: string = '';
  FF: string = '';
  FMFM: string = '';
  DB: string = '';
  DP: string = '';
  WB: string = '';
  RH: string = '';
  QFE: string = '';
  QFF: string = '';
  RRR: string = '';
  MinTemp: string = '';
  MaxTemp: string = '';
  // selectedDate:any;
  // today = "2016-12-31 06:00:00";
  // let date: Date = new Date();
  // todayDate = new Date(this.today);

  myFunc(
    stName: string,
    plotHours: any,
    plotActuals: any,
    plotPreds: any,
    plotErrors: any,
    RTF_VALUES: any
  ) {
    console.log('Inside myFunc 1 $$$$$$$$$$$$$$$');
    // console.log("INside plot = plothours = ", plotHours)
    // console.log("INside plot = plotactual = ", plotActuals)
    // console.log("INside plot = plotpred = ", plotPreds)
    // console.log("INside plot = ploterror = ", plotErrors)
    // {
    this.DDD = this.RTF_VALUES.DDD;
    this.FF = this.RTF_VALUES.FF;
    this.FMFM = this.RTF_VALUES.FMFM;
    this.DB = this.RTF_VALUES.TT;
    this.DP = this.RTF_VALUES.DP;
    this.WB = this.RTF_VALUES.TWTW;
    this.RH = this.RTF_VALUES.RH;
    this.QFE = this.RTF_VALUES.QFE;
    this.QFF = this.RTF_VALUES.QFF;
    this.RRR = this.RTF_VALUES.RRR;
    this.MinTemp = this.RTF_VALUES.MIN;
    this.MaxTemp = this.RTF_VALUES.MAX;

    // console.log("set1", plotHours.slice( 0,25))
    // console.log("set2", plotHours.slice(25,73))
    // console.log("set3", plotHours.slice(73,))

    let sdate = this.selectedDate;
    const that = this;
    // let sendToBackendChart = this.sendToBackend
    this.options1 = {
      chart: {
        // backgroundColor: 'rgba(0,0,0,0)',
        type: 'line',
        scrollablePlotArea: {
          minWidth: 200,
        },
        //height: 680,
        // width: 1000
      },

      title: {
        text: 'Predicted v/s Actual graph for ' + this.stname,
        style: {
          color: 'black',
          fontWeight: 'bold',
          fontSize: '25px',
          fontFamily: "'Times New Roman', Times, serif",
        },
      },
      subtitle: {
        // text:  this.datepipe.transform(new Date(dateDisplay), 'dd-MM-yyyy'),
        // style:{
        //   color: 'black',
        //   fontWeight: 'bold',
        //   fontSize: '25px',
        //   fontFamily: "'Times New Roman', Times, serif"
        //   // align:'left'
        // }
      },
      plotOptions: {
        series: {
          fillOpacity: 0.5,
        },
      },
      // tooltip: {
      //   formatter: function() {return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', 1) +' y: ' + 100;    }
      // },
      xAxis: {
        min: 0,
        max: 20,
        scrollPositionX: 1,
        scrollbar: {
          enabled: true,
        },
        title: {
          text: 'Time',
          style: {
            fontSize: '15pt',
            fontFamily: "'Times New Roman', Times, serif",
          },
        },

        categories: plotHours,
        style: {
          font: '40pt',
        },
      },
      yAxis: {
        max: 7000,
        min: 0,
        title: {
          text: 'Visibility (in mts)',
          style: {
            fontSize: '15pt',
            fontFamily: "'Times New Roman', Times, serif",
          },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -50,
        y: 30,
        itemStyle: {
          fontSize: '20px',
          font: '20pt',
          color: 'black',
          fontFamily: "'Times New Roman', Times, serif",
        },
        itemHoverStyle: {
          color: 'blue',
        },
        itemHiddenStyle: {
          color: '#444',
        },
        floating: true,
        borderWidth: 1,
        shadow: true,
        // title: {
        //   text: 'Currently showing: <br/><span>'+dateDisplay+'</span>'
        // }
      },
      series: [
        {
          type: 'spline',
          color: 'red',
          name: 'Predicted',
          data: plotPreds,
        },
        {
          type: 'spline',
          color: 'green',
          name: 'Actual',
          data: plotActuals,
        },
      ],
    };

    this.options2 = {
      chart: {
        type: 'line',
        scrollablePlotArea: {
          minWidth: 200,
        },
        //height:415
      },
      title: {
        text: 'Error graph for ' + this.stname,
        style: {
          color: 'black',
          fontWeight: 'bold',
          fontSize: '25px',
          fontFamily: "'Times New Roman', Times, serif",
        },
      },
      subtitle: {
        // text: this.datepipe.transform(new Date(dateDisplay), 'dd-MM-yyyy'),
        // style:{
        //   color: 'black',
        //   fontWeight: 'bold',
        //   fontSize: '25px',
        //   fontFamily: "'Times New Roman', Times, serif"
        // }
      },
      plotOptions: {
        series: {
          fillOpacity: 0.1,
        },
      },
      // tooltip: {
      //   formatter: function() {return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', 1) +' y: ' + 100;    }
      // },
      xAxis: {
        min: 0,
        max: 20,
        scrollbar: {
          enabled: true,
        },
        title: {
          text: 'Time',
          style: {
            fontSize: '15pt',
            fontFamily: "'Times New Roman', Times, serif",
          },
        },
        categories: plotHours,
      },
      yAxis: {
        max: 200,
        min: 0,
        title: {
          text: 'Percentage Error',
          style: {
            fontSize: '15pt',
            fontFamily: "'Times New Roman', Times, serif",
          },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -50,
        y: 50,
        itemStyle: {
          fontSize: '20px',
          font: '20pt',
          color: 'black',
          fontFamily: "'Times New Roman', Times, serif",
        },
        itemHoverStyle: {
          color: 'blue',
        },
        itemHiddenStyle: {
          color: '#444',
        },
        floating: true,
        borderWidth: 1,
        shadow: true,
      },
      series: [
        {
          name: 'Error %',
          data: plotErrors,
        },
      ],
    };

    Highcharts.chart('chart1', this.options1);
    Highcharts.chart('chart2', this.options2);
  }

  logout() {
    console.log('Inside logout $$$$$$$$$$$$$$$');
    this.router.navigateByUrl('/');
  }

  concatenateLists(sourceLists: any, destList: any) {
    console.log('Inside concatenateLists $$$$$$$$$$$$$$$');
    for (let i: any = 0; i < sourceLists.length; i++) {
      for (let j: any = 0; j < sourceLists[i].length; j++) {
        destList.push(sourceLists[i][j]);
      }
    }
    return destList;
  }

  getInitialPredictions() {
    this.service3.getInitialPredictions().subscribe((initialPredictions) => {
      console.log('getting recent & last pae values.............');
      this.lastPAEValues = initialPredictions['lastPAEValues'];
      this.recentPAEValues = initialPredictions['recentPAE'];
      this.RTF_VALUES = initialPredictions['RTF_Values'];
      // this.selectedPAEValues = pdata['selectedPAE']

      this.hLast = this.lastPAEValues['h_all'];
      this.aLast = this.lastPAEValues['a_all'];
      this.pLast = this.lastPAEValues['p_all'];
      this.eLast = this.lastPAEValues['e_all'];

      this.hRecent = this.recentPAEValues['h'];
      this.pRecent = this.recentPAEValues['p'];

      this.hh.push(this.hLast);
      this.hh.push(this.hRecent);
      this.aa.push(this.aLast);
      this.pp.push(this.pLast);
      this.pp.push(this.pRecent);
      this.ee.push(this.eLast);
      this.ee.push([
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
      ]);

      this.displayHours = this.concatenateLists(this.hh, this.displayHours);
      this.displayActuals = this.concatenateLists(this.aa, this.displayActuals);
      this.displayPreds = this.concatenateLists(this.pp, this.displayPreds);
      this.displayErrors = this.concatenateLists(this.ee, this.displayErrors);

      // this.RTF_VALUES= pdata['RTF_Values']
      console.log(
        '------------------------------------------------',
        this.displayHours.length
      );
      this.myFunc(
        this.stname,
        this.displayHours,
        this.displayActuals,
        this.displayPreds,
        this.displayErrors,
        this.RTF_VALUES
      );

      this.displayHours = [];
      this.displayActuals = [];
      this.displayPreds = [];
      this.displayErrors = [];

      this.hh = [];
      this.aa = [];
      this.pp = [];
      this.ee = [];
    });
  }

  receiveData() {
    console.log('Inside receieveData $$$$$$$$$$$$$$$');
    this.url = 'ws://127.0.0.1:5000/visibility_predicted_values';

    this.subject = webSocket(this.url);
    this.subscribing = this.subject.subscribe((pdata: any) => {
      console.log('getting recent & last pae values.............');
      this.lastPAEValues = pdata['lastPAEValues'];
      this.recentPAEValues = pdata['recentPAE'];
      this.RTF_VALUES = pdata['RTF_Values'];
      // this.selectedPAEValues = pdata['selectedPAE']

      this.hLast = this.lastPAEValues['h_all'];
      this.aLast = this.lastPAEValues['a_all'];
      this.pLast = this.lastPAEValues['p_all'];
      this.eLast = this.lastPAEValues['e_all'];

      this.hRecent = this.recentPAEValues['h'];
      this.pRecent = this.recentPAEValues['p'];

      this.hh.push(this.hLast);
      this.hh.push(this.hRecent);
      this.aa.push(this.aLast);
      this.pp.push(this.pLast);
      this.pp.push(this.pRecent);
      this.ee.push(this.eLast);
      this.ee.push([
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
        'None',
      ]);

      this.displayHours = this.concatenateLists(this.hh, this.displayHours);
      this.displayActuals = this.concatenateLists(this.aa, this.displayActuals);
      this.displayPreds = this.concatenateLists(this.pp, this.displayPreds);
      this.displayErrors = this.concatenateLists(this.ee, this.displayErrors);

      // this.RTF_VALUES= pdata['RTF_Values']
      console.log(
        '------------------------------------------------',
        this.displayHours.length
      );
      this.myFunc(
        this.stname,
        this.displayHours,
        this.displayActuals,
        this.displayPreds,
        this.displayErrors,
        this.RTF_VALUES
      );

      this.displayHours = [];
      this.displayActuals = [];
      this.displayPreds = [];
      this.displayErrors = [];

      this.hh = [];
      this.aa = [];
      this.pp = [];
      this.ee = [];
    });
  }
}
