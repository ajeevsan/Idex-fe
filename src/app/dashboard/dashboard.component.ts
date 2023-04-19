import { Component, OnInit } from '@angular/core';
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
import { FormControl, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as echarts from 'echarts';
import { GetCurrentLocationService } from '../get-current-location.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { GlobalComponent } from '../global-component';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  chart: any;

  //! Global Component
  public ipDtlsReadOut: any = GlobalComponent.appUrl;

  today = new Date()


  //! New Variables entered
  dummyCityList: Array<any> = ['Chandigarh', 'Gorakhpur', 'Hindan', 'Srinagar'];

  dummyActualChartData: Array<any> = [
    980, 950, 931, 864, 781, 764, 785, 795, 840, 895, 940, 934, 900,
  ];
  dummyPredictedChartData: Array<any> = [
    1000, 1000, 1000, 900, 800, 800, 800, 920, 1000, 980, 1000, 1100, 1029,
  ];
  dummyErrorChartData: Array<any> = [
    20, 50, 69, 36, 19, 36, 15, 125, 160, 85, 60, 166, 129,
  ];

  setPlotHours: any;
  setPlotActuals: any;
  setPlotPreds: any;
  setPlotErrors: any;

  date = new FormControl(new Date());

  currentSelectedCity: any;

  ID: any;

  //! Old Local Variables

  private myChart1: any;
  private myChart2: any;
  private myChart3: any;

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
  stname: any = this._location;
  fchr: string = '';
  public dt: any;

  public hRecent: any;
  public pRecent: any;

  public hLast: any;
  public aLast: any;
  public pLast: any;
  public eLast: any;

  public hLastErr: any;
  public aLastErr: any;
  public pLastErr: any;
  public e1LastErr: any;
  public e2LastErr: any;
  public e3LastErr: any;
  public e4LastErr: any;
  public e5LastErr: any;
  public e6LastErr: any;

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
  public displayErrors1: any[] = [];
  public displayErrors2: any[] = [];
  public displayErrors3: any[] = [];
  public displayErrors4: any[] = [];
  public displayErrors5: any[] = [];
  public displayErrors6: any[] = [];

  public hh: any[] = [];
  public aa: any[] = [];
  public pp: any[] = [];

  public ee1: any[] = [];
  public ee2: any[] = [];
  public ee3: any[] = [];
  public ee4: any[] = [];
  public ee5: any[] = [];
  public ee6: any[] = [];

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

  //! Sanjeev Code
  flag_6hr: boolean = false;
  flag_48hr: boolean = true;

  // !...................Echarts ...............
  colors = ['#3399ff', '#2eb85c'];
  title = 'angularCharts';

  selectCity(data: any) {
    // console.log(`data`, data.value);
    this.currentSelectedCity = data.value;
  }

  

  // TODO...........Individual charts..............
  // !...................................Average Error of Each Predection..........................................

  // TODO.........................6hr Average Data.................................

  // !..............Average Error of Each Predection...........
  // !.....................6hr...................
  chandigarh_overall_average_error: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
        min: 0,
        max: 700,
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [250, 232, 264, 200, 160, 101, 70],
      },
    ],
  };
  // ...................gorakhpur....................
  gorakhpur_overall_average_error: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
        min: 0,
        max: 700,
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [350.8, 273.3, 226, 223, 183, 129.1],
      },
    ],
  };
  // .................hindan.......................
  hindan_overall_average_error: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
        min: 0,
        max: 700,
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [140, 232, 101, 264, 90, 340, 250],
      },
    ],
  };
  // .................srinagar...............
  srinagar_overall_average_error: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
        min: 0,
        max: 700,
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [72, 50.6, 47.5, 50, 38, 34],
      },
    ],
  };
  //!....................48hr.......................

  chandigarh_overall_average_error_48hr: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
        min: 0,
        max: 700,
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(0, 221, 255)',
            },
            {
              offset: 1,
              color: 'rgb(77, 119, 255)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [330, 280, 255, 200, 210, 170],
      },
    ],
  };
  // ...................gorakhpur....................
  gorakhpur_overall_average_error_48hr: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [140, 232, 101, 264, 90, 340, 250],
      },
    ],
  };
  // .................hindan.......................
  hindan_overall_average_error_48hr: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [140, 232, 101, 264, 90, 340, 250],
      },
    ],
  };
  // .................srinagar...............
  srinagar_overall_average_error_48hr: echarts.EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [140, 232, 101, 264, 90, 340, 250],
      },
    ],
  };


  // startDate = new Date();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public service: HomeService,
    public service2: CitylistService,
    public service3: InitialpredService,
    public http: HttpClient,
    public datepipe: DatePipe,
    public _location: GetCurrentLocationService
  ) {
    console.log('Inside constructor $$$$$$$$$$$$$$$');
    setInterval(() => {
      // console.log("inside setinterval...")
      this.currentDate = new Date().toString();

      // console.log("below greet...")
    }, 1000);

    this.today.setDate(this.today.getDate());

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

  private InitPipe(): void {}

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
    this.stname = event.target.value;
    console.log('Inside fun $$$$$$$$$$$$$$$', event);
    this.dt = this.currentDate;
    this.flag1 = true;
    this.sendToBackend(this.selectedDate);
  }
  sendToBackend(selDate: any) {
    this.service
      .getBackendData(this.stname, selDate, this.fchr, this.isPast)
      .subscribe((calledData) => {
        this.catchCall = calledData;
        this.found = 0;
        this.getInitialPredictions();
        //this.greet();
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
    // this.service.getBackendData(this.stname, this.selectedDate, this.fchr).subscribe(calledData =>
    //   {
    //     this.catchCall= calledData
    //     this.found = 0
    //     this.getInitialPredicrions();
    //     //this.greet();
    //   })
  }
  // selectdate(event: any)
  // {
  //   this.input_date = event.target.value;
  //   console.log("Selected date old^^^^^^^^^^^^^^^^^^", this.selectedDate, typeof(this.selectedDate))
  //   // let newDate= new Date(this.selectedDate);
  //   // newDate.setMinutes(newDate.getDate() + 1);
  //   // this.selectedDate = newDate
  //   // var offsetMs = this.selectedDate.getTimezoneOffset() * 60000;
  //   // this.selectedDate =  new Date(this.selectedDate.getTime() - offsetMs);

  //   console.log("Selected date  new^^^^^^^^^^^^^^^^^^", this.input_date)

  //   this.service.getBackendData(this.stname, this.input_date, this.fchr).subscribe(calledData =>
  //     {
  //       this.catchCall= calledData
  //       this.found = 0
  //       this.getInitialPredicrions();
  //       //this.greet();
  //     })
  // }
  forecastHour(event: any) {
    console.log('Inside forecasthour $$$$$$$$$$$$$$$');
    if (event == '48hr') {
      this.flag_6hr = true;
      this.flag_48hr = false;
      this.dt = this.currentDate;
      this.fchr = event;
      console.log('fchr-----', this.fchr);
      console.log('dt-----', this.dt);
      console.log('stname-----', this.stname);

      
    } else {
      this.flag_6hr = false;
      this.flag_48hr = true;
      this.dt = this.currentDate;
      this.fchr = event;
      console.log('fchr-----', this.fchr);
      console.log('dt-----', this.dt);
      console.log('stname-----', this.stname);

    }

    this.sendToBackend(this.selectedDate);

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

  // async submit(f:NgForm){

  //   console.log("input_date",this.input_date)

  //   this.service.getBackendData(this.stname, this.input_date, this.fchr).subscribe(calledData =>
  //     {
  //       this.catchCall= calledData
  //       this.found = 0
  //       this.getInitialPredicrions();
  //       //this.greet();
  //     })
  // }

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

  myFunc(stName: string, plotHours: any, plotActuals: any, plotPreds: any,
    plotErrors1: any, plotErrors2: any, plotErrors3: any,
    plotErrors4: any, plotErrors5: any, plotErrors6: any, RTF_VALUES: any)
  {
    console.log("Inside myFunc 1 $$$$$$$$$$$$$$$")
    console.log("INside plot = plothours = ", plotHours)
    console.log("INside plot = plotactual = ", plotActuals)
    console.log("INside plot = plotpred = ", plotPreds)
    console.log("INside plot = ploterror = ", plotErrors1)
    console.log("INside plot = ploterror = ", plotErrors2)
    console.log("INside plot = ploterror = ", plotErrors3)
    console.log("INside plot = ploterror = ", plotErrors4)
    console.log("INside plot = ploterror = ", plotErrors5)
    console.log("INside plot = ploterror = ", plotErrors6)

    //! Filter up the data for Prediction vs Actual
    let plotHoursNew = plotHours.map((data: any) => {
      return data.slice(11, 16);
    });

    //! Average of all the Errors
    let avgArray = [], allArray = [plotErrors1,plotErrors2,plotErrors3,plotErrors4,plotErrors5,plotErrors6], temp = 0;
    for(let i=0;i<6;i++){
      temp = allArray[i].reduce((partialSum: any, a :any) => partialSum +a, 0)
      avgArray[i] = temp.toFixed(3);
    }

    // {
        this.DDD = this.RTF_VALUES.DDD
        this.FF  = this.RTF_VALUES.FF
        this.FMFM = this.RTF_VALUES.FMFM
        this.DB = this.RTF_VALUES.TTT
        this.DP = this.RTF_VALUES.TDTD
        this.WB = this.RTF_VALUES.TWTW
        this.RH = this.RTF_VALUES.RH
        this.QFE = this.RTF_VALUES.QFE
        this.QFF = this.RTF_VALUES.QFF
        this.RRR = this.RTF_VALUES.RRR
        this.MinTemp = this.RTF_VALUES.MIN
        this.MaxTemp = this.RTF_VALUES.MAX

        // console.log("set1", plotHours.slice( 0,25))
        // console.log("set2", plotHours.slice(25,73))
        // console.log("set3", plotHours.slice(73,))
        
        let sdate =this.selectedDate;
        const that = this;

    //! The Prediction vs Actual Graph
    this.myChart1 = echarts.init(document.getElementById('pipe') as any);

    const option1 = {
      // !.....Graph shows...... Max Min - Avg ............
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#ccc',
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ['Actual', 'Prediction'],
      },
      xAxis: [
        {
          type: 'category',
          data: this.flag_6hr? plotHoursNew.slice(0,19):plotHoursNew,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Visibility in mts',
          min: 0,
          axisLabel: {
            formatter: '{value}',
          },
        },
        {
          type: 'value',
          name: 'Prediction in mts',
          min: 0,
          axisLabel: {
            formatter: '{value} ',
          },
        },
      ],
      series: [
        {
          name: 'Actual',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value: any) {
              return value + ' m';
            },
          },
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
          data: plotActuals,
          smooth: true
        },
        {
          name: 'Prediction',
          type: 'line',
          // color:'darkorange',
          tooltip: {
            valueFormatter: function (value: any) {
              return value + ' m';
            },
          },
          data: plotPreds,
        },
      ],
    };

    // ! ..........Error Graph..................!
  this.myChart2 = echarts.init(document.getElementById('errorP') as any)

  const option2 = {
    xAxis: {
      type: 'category',
      data: plotHoursNew.slice(0,7)
    },
     toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['T-1', 'T-2', 'T-3','T-4', 'T-5', 'T-6']
    },
    yAxis: {
      type: 'value'
    },
    
    series: [
      {
        name: 'T-1',
        data: plotErrors1,
        type: 'line',
        smooth: true
      },
      {
        name: 'T-2',
        data: plotErrors2,
        type: 'line',
        smooth: true
      },
      {
        name: 'T-3',
        data: plotErrors3,
        type: 'line',
        smooth: true
      },
      {
        name: 'T-4',
        data: plotErrors4,
        type: 'line',
        smooth: true
      },
      {
        name: 'T-5',
        data: plotErrors5,
        type: 'line',
        smooth: true
      },
      {
        name: 'T-6',
        data: plotErrors6,
        type: 'line',
        smooth: true
      }
    ]
  }

  //! Taking the average of all the data for t-1
  this.myChart3 = echarts.init(document.getElementById('errorA') as any)

  const option3 = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    title: {
      text: 'Average of Each Prediction',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',

        label: {
          backgroundColor: '#6a7985',
        },
      },
    },

    legend: {
      left: 350,
      data: ['Average'],
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'In Meters',
      },
    ],
    series: [
      {
        name: 'Average',
        type: 'line',
        stack: 'Total',
        label: {
          show: true,
          position: 'top'
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)',
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: avgArray.reverse(),
      },
    ],
  };

  // const option2 = {
  //   tooltip: {
  //     trigger: 'axis',
  //     showContent: false,
  //     axisPointer: {
  //       type: 'cross',
  //       crossStyle: {
  //         color: '#999',
  //       },
  //     },
  //   },
  //   legend: {
  //     data: ['T-1', 'T-2', 'T-3', 'T-4', 'T-5','T-6']
  //   },
  //   dataset: {
  //     source: [
  //       plotHoursNew.slice(plotHoursNew.length-7,plotHoursNew.length),
  //       ['T-1',[plotErrors1]],
  //       ['T-2',[plotErrors2]],
  //       ['T-3',[plotErrors3]],
  //       ['T-4',[plotErrors4]],
  //       ['T-5',[plotErrors5]],
  //       ['T-6',[plotErrors6]]
  //     ],
  //   },
  //   xAxis: { type: 'category' },
  //   yAxis: { gridIndex: 0 },
  //   grid: { top: '20%' },
  //   series: [
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //     {
  //       type: 'line',
  //       smooth: true,
  //       seriesLayoutBy: 'row',
  //       emphasis: { focus: 'series' },
  //     },
  //   ],
  // };

    this.myChart1.setOption(option1);
    this.myChart2.setOption(option2);
    this.myChart3.setOption(option3);

    
    // this.options1 = {
    //   chart: {
    //     type: 'line',
    //     scrollablePlotArea: {
    //       minWidth: 200,
    //     },
    //   },

    //   title: {
    //     text: 'Predicted v/s Actual graph for ' + this.stname,
    //     style: {
    //       color: 'black',
    //       fontWeight: 'bold',
    //       fontSize: '25px',
    //       fontFamily: "'Times New Roman', Times, serif",
    //     },
    //   },
    //   subtitle: {
    //   },
    //   plotOptions: {
    //     series: {
    //       fillOpacity: 0.5,
    //     },
    //   },
    //   xAxis: {
    //     min: 0,
    //     max: 20,
    //     scrollPositionX: 1,
    //     scrollbar: {
    //       enabled: true,
    //     },
    //     title: {
    //       text: 'Time',
    //       style: {
    //         fontSize: '15pt',
    //         fontFamily: "'Times New Roman', Times, serif",
    //       },
    //     },

    //     categories: plotHours,
    //     style: {
    //       font: '40pt',
    //     },
    //   },
    //   yAxis: {
    //     max: 7000,
    //     min: 0,
    //     title: {
    //       text: 'Visibility (in mts)',
    //       style: {
    //         fontSize: '15pt',
    //         fontFamily: "'Times New Roman', Times, serif",
    //       },
    //     },
    //   },
    //   legend: {
    //     layout: 'vertical',
    //     align: 'right',
    //     verticalAlign: 'top',
    //     x: -50,
    //     y: 30,
    //     itemStyle: {
    //       fontSize: '20px',
    //       font: '20pt',
    //       color: 'black',
    //       fontFamily: "'Times New Roman', Times, serif",
    //     },
    //     itemHoverStyle: {
    //       color: 'blue',
    //     },
    //     itemHiddenStyle: {
    //       color: '#444',
    //     },
    //     floating: true,
    //     borderWidth: 1,
    //     shadow: true,
    //   },
    //   series: [
    //     {
    //       type: 'spline',
    //       color: 'red',
    //       name: 'Predicted',
    //       data: plotPreds,
    //       smooth: true
    //     },
    //     {
    //       type: 'spline',
    //       color: 'green',
    //       name: 'Actual',
    //       data: plotActuals,
    //       smooth: true
    //     },
    //   ],
    // };

    // TODO..........Actual/predection charts..............
    // console.log(`plotHours***************`, plotHours);

    // this.options2 = {
    //   chart: {
    //     type: 'line',

    //     scrollablePlotArea: {
    //       minWidth: 200,
    //     },
    //   },
    //   title: {
    //     text: 'Error Visualization',
    //     fontWeight: 'bold',
    //   },
    //   subtitle: {
    //     // text: this.datepipe.transform(new Date(dateDisplay), 'dd-MM-yyyy'),
    //     // style:{
    //     //   color: 'black',
    //     //   fontWeight: 'bold',
    //     //   fontSize: '25px',
    //     //   fontFamily: "'Times New Roman', Times, serif"
    //     // }
    //   },
    //   plotOptions: {
    //     series: {
    //       fillOpacity: 0.1,
    //     },
    //   },
    //   // tooltip: {
    //   //   formatter: function() {return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', 1) +' y: ' + 100;    }
    //   // },
    //   xAxis: {
    //     min: 0,
    //     scrollbar: {
    //       enabled: true,
    //     },
    //     title: {
    //       text: 'Time',
    //       style: {
    //         fontSize: '15pt',
    //         fontFamily: "'Times New Roman', Times, serif",
    //       },
    //     },
    //     categories: plotHoursArr,
    //   },
    //   yAxis: {
    //     min: 0,
    //     title: {
    //       text: 'Error in mts',
    //       style: {
    //         fontSize: '15pt',
    //         fontFamily: "'Times New Roman', Times, serif",
    //       },
    //     },
    //   },
    //   legend: {
    //     layout: 'vertical',
    //     align: 'right',
    //     verticalAlign: 'top',
    //     x: -50,
    //     y: 50,
    //     itemStyle: {
    //       fontSize: '20px',
    //       font: '20pt',
    //       color: 'black',
    //       fontFamily: "'Times New Roman', Times, serif",
    //     },
    //     itemHoverStyle: {
    //       color: 'blue',
    //     },
    //     itemHiddenStyle: {
    //       color: '#444',
    //     },
    //     floating: true,
    //     borderWidth: 1,
    //     shadow: true,
    //   },
    //   series: [
    //     {
    //       name: 'Error in metres',
    //       data: plotErrorsArr,
    //       smooth: true
    //     },
    //   ],
    // };

    // Highcharts.chart('chart1', this.options1);
    // Highcharts.chart('chart2', this.options2);
    // }
  }

  logout() {
    console.log('Inside logout $$$$$$$$$$$$$$$');
    this.router.navigateByUrl('/');
  }

  concatenateLists(sourceLists:any,destList:any)
  {
    console.log("Inside concatenateLists $$$$$$$$$$$$$$$")
    for(let i:any = 0; i< sourceLists.length;i++)
    {
      for(let j:any = 0; j < sourceLists[i].length; j++)  
      {
        destList.push(sourceLists[i][j])
      }
    }
    return destList
  }

  getInitialPredictions(){
    this.service3.getInitialPredictions().subscribe(initialPredictions => 
      {
         
        console.log("getting recent & last pae values.............")
        this.lastPAEValues = initialPredictions['lastPAEValues']
        this.hLast = this.lastPAEValues['h_all']
        this.aLast = this.lastPAEValues['a_all']
        this.pLast = this.lastPAEValues['p_all']
        this.eLast = this.lastPAEValues['e_all']

        //return;  
        this.recentPAEValues = initialPredictions['recentPAE']
        this.RTF_VALUES = initialPredictions['RTF_Values']
        // this.selectedPAEValues = pdata['selectedPAE']

        
      
        this.hLastErr = this.recentPAEValues['h_all']
        this.aLastErr = this.recentPAEValues['a_all']
        this.pLastErr = this.recentPAEValues['p_all']
        this.e1LastErr = this.recentPAEValues['e1_all']
        this.e2LastErr = this.recentPAEValues['e2_all']
        this.e3LastErr = this.recentPAEValues['e3_all']
        this.e4LastErr = this.recentPAEValues['e4_all']
        this.e5LastErr = this.recentPAEValues['e5_all']
        this.e6LastErr = this.recentPAEValues['e6_all']
        
        //this.hRecent = this.recentPAEValues['h']
        //this.pRecent = this.recentPAEValues['p']

        this.hh.push(this.hLastErr)
        //this.hh.push(this.hRecent)
        this.aa.push(this.aLastErr)
        this.pp.push(this.pLastErr)
        //this.pp.push(this.pRecent)
        this.ee1.push(this.e1LastErr)
        this.ee2.push(this.e2LastErr)
        this.ee3.push(this.e3LastErr)
        this.ee4.push(this.e4LastErr)
        this.ee5.push(this.e5LastErr)
        this.ee6.push(this.e6LastErr)
        //this.ee.push(['None','None' ,'None' ,'None' ,'None' ,'None', 'None','None' ,'None' ,'None' ,'None' ,'None',])

        this.displayHours = this.concatenateLists(this.hh, this.displayHours)
        this.displayActuals = this.concatenateLists(this.aa,this.displayActuals)
        this.displayPreds = this.concatenateLists(this.pp, this.displayPreds)
        
        this.displayErrors1 = this.concatenateLists(this.ee1, this.displayErrors1)
        this.displayErrors2 = this.concatenateLists(this.ee2, this.displayErrors2)
        this.displayErrors3 = this.concatenateLists(this.ee3, this.displayErrors3)
        this.displayErrors4 = this.concatenateLists(this.ee4, this.displayErrors4)
        this.displayErrors5 = this.concatenateLists(this.ee5, this.displayErrors5)
        this.displayErrors6 = this.concatenateLists(this.ee6, this.displayErrors6)
        
        // this.RTF_VALUES= pdata['RTF_Values']
        console.log("------------------------------------------------",this.displayHours.length)
        this.myFunc(this.stname, this.displayHours, this.displayActuals, this.displayPreds,
          this.displayErrors1, this.displayErrors2, this.displayErrors3, this.displayErrors4,
          this.displayErrors5, this.displayErrors6, this.RTF_VALUES)
        // this.myFunc(this.stname, this.hSelected24, this.aSelected24, this.pSelected24, this.eSelected24, this.RTF_VALUES, this.td)
        // this.myFunc(this.stname, this.hSelectedDate, this.aSelected, this.pSelected, this.eSelected, this.RTF_VALUES, this.td)

        this.displayHours = []              
        this.displayActuals = []
        this.displayPreds = []
        this.displayErrors1 = []
        this.displayErrors2 = []
        this.displayErrors3 = []
        this.displayErrors4 = []
        this.displayErrors5 = []
        this.displayErrors6 = []
          
        this.hh = []
        this.aa = []
        this.pp = []
        this.ee1 = []
        this.ee2 = []
        this.ee3 = []
        this.ee4 = []
        this.ee5 = []
        this.ee6 = []

        }) 
  }

  receiveData() 
  {
    //return;
    console.log("Inside receieveData $$$$$$$$$$$$$$$")
    this.url = 'ws://' + this.ipDtlsReadOut +'visibility_predicted_values'

    this.subject = webSocket(this.url);
    this.subscribing = this.subject.subscribe((pdata:any)=>
    {
        console.log("getting recent & last pae values.............")
        this.lastPAEValues = pdata['lastPAEValues']
        this.hLast = this.lastPAEValues['h_all']
        this.aLast = this.lastPAEValues['a_all']
        this.pLast = this.lastPAEValues['p_all']
        this.eLast = this.lastPAEValues['e_all']

        //return;  
        this.recentPAEValues = pdata['recentPAE']
        this.RTF_VALUES = pdata['RTF_Values']
        // this.selectedPAEValues = pdata['selectedPAE']

        
      
        this.hLastErr = this.recentPAEValues['h_all']
        this.aLastErr = this.recentPAEValues['a_all']
        this.pLastErr = this.recentPAEValues['p_all']
        this.e1LastErr = this.recentPAEValues['e1_all']
        this.e2LastErr = this.recentPAEValues['e2_all']
        this.e3LastErr = this.recentPAEValues['e3_all']
        this.e4LastErr = this.recentPAEValues['e4_all']
        this.e5LastErr = this.recentPAEValues['e5_all']
        this.e6LastErr = this.recentPAEValues['e6_all']
        
        //this.hRecent = this.recentPAEValues['h']
        //this.pRecent = this.recentPAEValues['p']

        this.hh.push(this.hLastErr)
        //this.hh.push(this.hRecent)
        this.aa.push(this.aLastErr)
        this.pp.push(this.pLastErr)
        //this.pp.push(this.pRecent)
        this.ee1.push(this.e1LastErr)
        this.ee2.push(this.e2LastErr)
        this.ee3.push(this.e3LastErr)
        this.ee4.push(this.e4LastErr)
        this.ee5.push(this.e5LastErr)
        this.ee6.push(this.e6LastErr)
        //this.ee.push(['None','None' ,'None' ,'None' ,'None' ,'None', 'None','None' ,'None' ,'None' ,'None' ,'None',])

        this.displayHours = this.concatenateLists(this.hh, this.displayHours)
        this.displayActuals = this.concatenateLists(this.aa,this.displayActuals)
        this.displayPreds = this.concatenateLists(this.pp, this.displayPreds)
        
        this.displayErrors1 = this.concatenateLists(this.ee1, this.displayErrors1)
        this.displayErrors2 = this.concatenateLists(this.ee2, this.displayErrors2)
        this.displayErrors3 = this.concatenateLists(this.ee3, this.displayErrors3)
        this.displayErrors4 = this.concatenateLists(this.ee4, this.displayErrors4)
        this.displayErrors5 = this.concatenateLists(this.ee5, this.displayErrors5)
        this.displayErrors6 = this.concatenateLists(this.ee6, this.displayErrors6)
        
        // this.RTF_VALUES= pdata['RTF_Values']
        console.log("------------------------------------------------",this.displayHours.length)
        this.myFunc(this.stname, this.displayHours, this.displayActuals, this.displayPreds,
          this.displayErrors1, this.displayErrors2, this.displayErrors3, this.displayErrors4,
          this.displayErrors5, this.displayErrors6, this.RTF_VALUES)
        // this.myFunc(this.stname, this.hSelected24, this.aSelected24, this.pSelected24, this.eSelected24, this.RTF_VALUES, this.td)
        // this.myFunc(this.stname, this.hSelectedDate, this.aSelected, this.pSelected, this.eSelected, this.RTF_VALUES, this.td)

        this.displayHours = []              
        this.displayActuals = []
        this.displayPreds = []
        this.displayErrors1 = []
        this.displayErrors2 = []
        this.displayErrors3 = []
        this.displayErrors4 = []
        this.displayErrors5 = []
        this.displayErrors6 = []
          
        this.hh = []
        this.aa = []
        this.pp = []
        this.ee1 = []
        this.ee2 = []
        this.ee3 = []
        this.ee4 = []
        this.ee5 = []
        this.ee6 = []
 
    })
  }
}
