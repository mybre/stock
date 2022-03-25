<template>
  <div>
    <el-select
      style="margin-left: 10vw;width: 300px"
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
        :key="item.code"
        :label="item.shortName"
        :value="item.code">
        <span style="float: left">{{ item.shortName }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
      </el-option>
    </el-select>
    <div style="margin-left: 10vw;margin-top: 2vh">{{`${curItem.shortName} ${curItem.code} 业绩表现`}}</div>
    <div style="width: 100vw;height: 80vh;display: flex;justify-content: center;align-items: center;">
      <div id="main" style="width: 1400px; height: 600px;"></div>
    </div>
  </div>
</template>

<script>
import { performance } from '@/dict'
import { get } from '@/api/list'
import { convertUint } from '@/utils'
// import qs from 'qs'
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
      loading: false,
      curItem: {
        code: 600519,
        shortName: '贵州茅台'
      }
    }
  },
  created () {
    this.performance = performance
    this.getData(this.curItem)
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
        grid: {
          containLabel: true
          // right: '30%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          textStyle: {
            width: '300'
          },
          formatter: (params) => {
            const title = `<div>${params[0].name}</div>`
            let line = ''
            for (const item of params) {
              // eslint-disable-next-line no-unused-expressions
              line += `<div style="display:flex;justify-content: space-between;align-items: center;width: 200px">
                <div>
                  <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color}"></span>
                  <span>${item.seriesName}<span>
                </div>
                <div>${convertUint(item.value)} 元</div>
              </div>
              `
            }
            return title + line
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
          x: 'center',
          y: 'bottom',
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
        const str = encodeURIComponent(JSON.stringify({
          uid: '',
          keyword: query,
          type: [
            'codetableLabel'
          ],
          client: 'wap',
          clientVersion: 'curr',
          clientType: 'wap',
          param: {
            codetableLabel: {
              pageIndex: 1,
              pageSize: 10,
              label: 'HSJ'
            }
          }
        }))
        // console.log(str, 'str')
        jsonp(`https://search-api-web.eastmoney.com/search/jsonp?param=${str}`, {
          jsonpCallback: 'cb'
        }).then(response => response.json())
          .then(data => {
            this.loading = false
            this.codeOptions = data?.result?.codetableLabel?.quoteList.map(v => {
              return {
                ...v,
                code: v.code.replace('<em>', '').replace('</em>', '')
              }
            })
          })
      } else {
        this.options = []
      }
    }, 500),
    getData (data) {
      get({
        sortColumns: 'REPORTDATE',
        sortTypes: -1,
        pageSize: 20,
        pageNumber: 1,
        columns: this.columns.toString(),
        filter: `(SECURITY_CODE="${data.code}")`,
        reportName: 'RPT_LICO_FN_CPD_BB'
      }).then(res => {
        console.log(res, 'res')
        if (res.code === 200 || res.code === 0) {
          res.result.data.reverse()
          this.formatData(res)
          this.curItem = data
        } else {
          this.$message.error(res.message)
        }
      })
    },
    formatData (res) {
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
        xAxis: {
          data: res.result.data.map(v => v.REPORTDATEWZ)
        },
        series: series,
        legend: {
          data: legend
        }
      })
    },
    change (code) {
      if (code) {
        const data = this.codeOptions.find(v => v.code === code)
        this.getData(data)
      }
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
