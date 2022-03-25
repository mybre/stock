<template>
  <div>
    <el-select
      style="margin-left: 20vw;width: 300px"
      v-model="code"
      filterable
      remote
      clearable
      reserve-keyword
      placeholder="输入股票代码、名称、简拼或关键词"
      :remote-method="remoteMethod"
      @change="change"
      :loading="loading">
      <el-option
        v-for="item in codeOptions"
        :key="item.Code"
        :label="item.Name"
        :value="item.Code">
        <span style="float: left">{{ item.Name }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.Code }}</span>
      </el-option>
    </el-select>
    <div style="width: 100vw;height: 90vh;display: flex;justify-content: center;align-items: center;">
      <div id="main" style="width: 1200px; height: 600px;"></div>
      <div>1</div>
    </div>
  </div>
</template>

<script>
import { performance } from '@/dict'
import { get } from '@/api/list'
import { convertUint } from '@/utils'
import qs from 'qs'
import jsonp from 'fetch-jsonp'
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      // columns: ['REPORTDATEWZ', 'BASIC_EPS', 'TOTAL_OPERATE_INCOME'],
      columns: 'ALL',
      performance: [],
      echartDom: null,
      code: '',
      codeOptions: [],
      loading: false
    }
  },
  created () {
    this.performance = performance
    this.getData()
  },
  mounted () {
    this.myEcharts()
  },
  methods: {
    myEcharts () {
      // 基于准备好的dom，初始化echarts实例
      const myChart = this.$echarts.init(document.getElementById('main'))
      const colors = ['#5470C6', '#91CC75', '#EE6666']
      const option = {
        color: colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            let str = params[0].name + '<br/>'
            for (const item of params) {
              str = `${str}<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color}"></span>${item.seriesName}:${convertUint(item.value)}<br/>`
            }
            return str
          }
        },

        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: []
        },
        xAxis: {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          // prettier-ignore
          data: [],
          axisLabel: {
            show: true,
            interval: 0,
            rotate: 40,
            textStyle: {
              color: '#333'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '每股收益',
            position: 'left',
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[0]
              }
            },
            axisLabel: {
              formatter: '{value} 元'
            }
          },
          {
            type: 'value',
            name: '营业收入',
            position: 'right',
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[1]
              }
            },
            axisLabel: {
              formatter: (value) => {
                return convertUint(value)
              }
            }
          },
          {
            type: 'value',
            name: '归属净利润',
            position: 'right',
            alignTicks: true,
            offset: 80,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[2]
              }
            },
            axisLabel: {
              formatter: (value) => {
                return convertUint(value)
              }
            }
          }
        ],
        series: []
      }

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
      this.echartDom = myChart
    },
    numberFormat (value) {
      const param = {}
      const k = 1000
      const sizes = ['千', '万', '亿', '万亿']
      let i
      if (value < k) {
        param.value = value
        param.unit = ''
      } else {
        i = Math.floor(Math.log(value) / Math.log(k))

        param.value = ((value / Math.pow(k, i))).toFixed(2)
        param.unit = sizes[i]
      }
      return param
    },
    remoteMethod: debounce(function (query) {
      if (query !== '') {
        this.loading = true
        const str = qs.stringify({
          input: query,
          type: 14,
          token: 'D43BF722C8E33BDC906FB84D85E326E8',
          // markettype: '',
          // mktnum: '',
          // jys: '',
          // classify: '',
          securitytype: '1,2',
          // status: '',
          count: 4
        })
        jsonp(`http://searchapi.eastmoney.com/api/suggest/get?${str}`, {
          jsonpCallback: 'cb'
        }).then(response => response.json())
          .then(result => {
            this.loading = false
            this.codeOptions = result?.QuotationCodeTable?.Data
          })
      } else {
        this.options = []
      }
    }, 500),
    getData (code = '600519', title = '贵州茅台') {
      get({
        sortColumns: 'REPORTDATE',
        sortTypes: -1,
        pageSize: 20,
        pageNumber: 1,
        columns: this.columns.toString(),
        filter: `(SECURITY_CODE="${code}")`,
        reportName: 'RPT_LICO_FN_CPD_BB'
      }).then(res => {
        console.log(res, 'res')
        if (res.code === 200 || res.code === 0) {
          res.result.data.reverse()
          this.formatData(res, code, title)
        } else {
          this.$message.error(res.message)
        }
      })
    },
    formatData (res, code, title) {
      const BASIC_EPS = {
        name: '每股收益',
        type: 'line',
        yAxisIndex: '0',
        // stack: 'Total',
        data: res.result.data.map(v => v.BASIC_EPS)
      }
      const TOTAL_OPERATE_INCOME = {
        name: '营业收入',
        type: 'line',
        yAxisIndex: '1',
        // stack: 'Total',
        data: res.result.data.map(v => v.TOTAL_OPERATE_INCOME)
      }
      const PARENT_NETPROFIT = {
        name: '归属净利润',
        type: 'line',
        yAxisIndex: '2',
        // stack: 'Total',
        data: res.result.data.map(v => v.PARENT_NETPROFIT)
      }
      const series = [BASIC_EPS, TOTAL_OPERATE_INCOME, PARENT_NETPROFIT]
      const legend = series.map(v => v.name)
      this.echartDom.setOption({
        title: { text: `${code}-${title} 业绩表现`, left: '5%' },
        xAxis: {
          data: res.result.data.map(v => v.REPORTDATEWZ)
        },
        grid: {
          // top: '20%',
          // left: '50%'
        },
        series: series,
        legend: {
          data: legend
        }
      })
    },
    change (Code) {
      if (Code) {
        const data = this.codeOptions.find(v => v.Code === Code)
        this.getData(data.Code, data.Name)
      }
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
