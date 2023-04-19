import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})

export class DetailsComponent implements OnInit {

  //Daterange
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });


  today  = new Date()

  dummyCityList:  Array<any> = ['Chandigarh', 'Gorakhpur', 'Hindan', 'Srinagar'];

  dummyActualChartData: Array<any> = [980,950,931,864,781,764,785,795,840,895,940,934,900]
  dummyPredictedChartData: Array<any> = [1000,1000,1000,900,800,800,800,920,1000,980,1000,1100,1029]
  dummyErrorChartData: Array<any> = [20,50,69,36,19,36,15,125,160,85,60,166,129]

  currentSelectedCity: any= "Chandigarh";
  
  selectCity(data:any ){
    // console.log(`data`, data.value);
    this.currentSelectedCity  = data.value
  }
  
// !...................Echarts ...............
// TODO...............Average data on graphs...............

average_graph :echarts.EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  toolbox: {
    feature: {
      dataView: { show: true, readOnly: false },
      magicType: { show: true, type: ['line', 'bar'] },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  legend: {
    data: ['Actual average', 'Predicted average', 'Average Error']
  },
  xAxis: [
    {
      type: 'category',
      data: ['Sun'],
      axisLabel: {
        fontWeight:'bold',
      },
      axisPointer: {
        type: 'shadow'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Visibility in meters',
      min: 0,
      max: 1250,
      interval: 250,
      axisLabel: {
        fontWeight:'bold',
        formatter: '{value} m'
      }
    },
  ],
  series: [
    {
      name: 'Actual average',
      type: 'bar',
      color:'#2982cc',
      tooltip: {
        valueFormatter: function (value) {
          return value as number + ' m';
        }
      },
      data: [
       1052.2
      ]
    },
    
    {
      name: 'Predicted average',
      type: 'bar',
      color:'#f6960b',
      tooltip: {
        valueFormatter: function (value) {
          return value as number + ' m';
        }
      },
      data: [
        982
      ]
    },
    {
      name: 'Average Error',
      type: 'bar',
      color:'#d93737',
      tooltip: {
        valueFormatter: function (value) {
          return value as number + ' m';
        }
      },
      data: [
        68
      ]
    }
  ]
  }

// ...........................................
    colors = ['#3399ff', '#2eb85c'];
    title = 'angularCharts'

// TODO..........Actual/predection charts..............
    
    predicted_graph :echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            fontWeight:'bold',
          }
        }
      ],
      yAxis: [
        {
          name: 'Visibility in meters',
          interval:300,
          type: 'value',
          axisLabel: {
            fontWeight:'bold',
            formatter: '{value} m'
          }
        }
      ],
      series: [
        {
          name: 'Actual',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: this.dummyActualChartData
        },
        {
          name: 'Predicted',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          data: this.dummyPredictedChartData
        },
        {
          name: 'Error',
          type: 'bar',
          color:'#d93737',
          data: this.dummyErrorChartData,
          emphasis: {
            focus: 'series'
          },
          markLine: {
            lineStyle: {
              type: 'dashed'
            },
            data: [[{ type: 'min' }, { type: 'max' }]]
          }
        },
      ]
      // color: this.colors,
  
      // tooltip: {
      //   trigger: 'none',
      //   axisPointer: {
      //     type: 'cross'
      //   }
      // },
      // legend: {},
      // grid: {
      //   top: 70,
      //   bottom: 50
      // },
      // xAxis: [
      //   {
      //     type: 'category',
      //     axisTick: {
      //       alignWithLabel: true
      //     },
      //     axisLine: {
      //       onZero: false,
      //       lineStyle: {
      //         color: this.colors[1]
      //       }
      //     },
      //     axisPointer: {
      //       label: {
      //         formatter: function (params: any) {
      //           return (
      //             'Predicted Value ' +
      //             params.value +
      //             (params.seriesData.length ? '：' + params.seriesData[0].data : '')
      //           );
      //         }
      //       }
      //     },
    
      //     // prettier-ignore
      //     data: ['01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','08:00','9:00','10:00','11:00']
      //   },
      //   {
      //     type: 'category',
      //     axisTick: {
      //       alignWithLabel: true
      //     },
      //     axisLine: {
      //       onZero: false,
      //       lineStyle: {
      //         color: this.colors[0]
      //       }
      //     },
      //     axisPointer: {
      //       label: {
      //         formatter: function (params: any) {
      //           return (
      //             'Actual Value  ' +
      //             params.value +
      //             (params.seriesData.length ? '：' + params.seriesData[0].data : '')
      //           );
      //         }
      //       }
      //     },
    
      //     // prettier-ignore
      //     data: ['01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','08:00','9:00','10:00','11:00']
      //   }
      // ],
      // yAxis: [
      //   {
      //     type: 'value'
      //   }
      // ],
      // series: [
      //   {
      //     name: 'Actual Value',
      //     type: 'line',
      //     xAxisIndex: 1,
      //     smooth: true,
      //     emphasis: {
      //       focus: 'series'
      //     },
      //     data: this.dummyActualChartData
      //   },
      //   {
      //     name: 'Predicted Value',
      //     type: 'line',
      //     smooth: true,
      //     emphasis: {
      //       focus: 'series'
      //     },
      //     data: this.dummyPredictedChartData
      //   }
      // ]
      // // !.....Graph shows...... Max Min - Avg ............
      // title: {
      //   text: ' '
      // },
      // tooltip: {
      //   trigger: 'axis'
      // },
      // legend: {},
      // toolbox: {
      //   show: true,
      //   feature: {
      //     dataZoom: {
      //       yAxisIndex: 'none'
      //     },
      //     dataView: { readOnly: false },
      //     magicType: { type: ['line', 'bar'] },
      //     restore: {},
      //     saveAsImage: {}
      //   }
      // },
      // xAxis: {
      //   type: 'category',
      //   boundaryGap: false,
      //   data: ['01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','08:00','9:00','10:00','11:00']
      // },
      // yAxis: {
      //   type: 'value',
      //   min:600,
      //   max:1200,
      //   axisLabel: {
      //     formatter: '{value} m'
      //   }
      // },
      // series: [
      //   {
      //     name: 'Actual',
      //     type: 'line',
      //     data:[1000,1000,1000,900,800,800,800,920,1000,980,1000,1100,1029] ,
      //     markPoint: {
      //       data: [
      //         { type: 'max', name: 'Max' },
      //         { type: 'min', name: 'Min' }
      //       ]
      //     },
      //     markLine: {
      //       data: [{ type: 'average', name: 'Avg' }]
      //     }
      //   },
      //   {
      //     name: 'Predicted',
      //     type: 'line',
      //     data: [980,950,931,864,781,764,785,795,840,895,940,934,900],
      //     markPoint: {
      //       data: [{ name: '', value: -2, xAxis: 1, yAxis: -1.5 }]
      //     },
      //     markLine: {
      //       data: [
      //         { type: 'average', name: 'Avg' },
      //         [
      //           {
      //             symbol: 'none',
      //             x: '90%',
      //             yAxis: 'max'
      //           },
      //           {
      //             symbol: 'circle',
      //             label: {
      //               position: 'start',
      //               formatter: 'Max'
      //             },
      //             type: 'max',
      //             name: ''
      //           }
      //         ]
      //       ]
      //     }
      //   }
      // ]
    };
  
  constructor() {
  
   }

  ngOnInit(): void {
  }


}
