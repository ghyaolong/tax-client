<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row>
          <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form">
            <Form-item label="公司名称" prop="companyName">
              <Select v-model="searchForm.companyName" style="width:200px" multiple>
                <Option v-for="(item,index) in conpanyList"
                  :value="item.id"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item>
            <Form-item label="税种" prop="taxDict">
              <Select v-model="searchForm.taxDict" style="width:200px" multiple>
                <Option v-for="(item,index) in taxDictList"
                  :value="item.id"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item>
            <Form-item label="税金类型" prop="taxType">
              <Select v-model="searchForm.taxType" style="width:200px">
                <Option value="ALL">实缴税金/实缴滞纳金</Option>
                <Option value="PAID">实缴税金</Option>
                <Option value="LATEFEE">实缴滞纳金</Option>
              </Select>
            </Form-item>
            <Form-item label="币种" prop="currency">
              <Select v-model="searchForm.currency" style="width:200px">
                <Option v-for="(item,index) in currencyList"
                  :value="item.code"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item>
            <Form-item label="纳税所属期" prop="selectDateTaxPeriod">
              <DatePicker
              type="daterange"
               v-model="selectDateTaxPeriod"
               :disabled="disabledDateTime"
               format="yyyy-MM"
               clearable @on-change="selectDateRangeTaxPeriod" placeholder="选择起始时间" style="width: 200px"></DatePicker>
            </Form-item>
            <Form-item label="国家" prop="countryCode">
              <Select v-model="searchForm.countryCode" style="width:200px">
                <Option v-for="(item,index) in countryList"
                  :value="item.code"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item>
            <Form-item label="实缴期间" prop="selectDateTime">
              <DatePicker type="daterange"
               v-model="selectDateTime"
               format="yyyy-MM"
               clearable
               :disabled="disabledDateTaxPeriod"
               @on-change="selectDateRangeTime"
               placeholder="选择起始时间" style="width: 200px"></DatePicker>
            </Form-item>
            <Form-item style="margin-left:-35px;" class="br">
              <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
          </Form>
        </Row>
        <Row>
          <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data" ref="table" sortable="custom"></Table>
        </Row>
      </Card>
      </Col>
    </Row>
  </div>
</template>


<script>
import { getDetail,getDictListDataByType,getCompanyList } from '@/api/index.js';
import {getStore } from '@/libs/storage';
export default {
  data(){
    return {
      tempArry:[],
      data:[],
      loading:false,
      countryList:[], //国家
      taxDictList:[], // 税种
      conpanyList:[], // 公司
      currencyList:JSON.parse(getStore("currencyList")), // 币种
      userInfo: JSON.parse(getStore("userInfo")),
      searchForm:{
        companyName:[],// 公司
        currency:"", // 币种
        taxDict:[], // 税种
        countryCode:"",  // 国家
        taxType:'' , //税金类型
      },
      startTaxPeriod:"",  // 所属期间开始日期
      endTaxPeriod:"",  // 所属期间结束日期
      startTime:"",  // 实缴期间开始日期
      endTime:"",  // 实缴期间结束日期
      selectDateTaxPeriod:"", // 所属期间
      selectDateTime:"",  // 实缴时期
      disabledDateTaxPeriod:false,
      disabledDateTime:false,
      columns:[
        {
          title:"纳税所属期",
          width:150,
          key:"taxPeriod",
          render:(h,params) => {
            if(params.row.taxPeriod) {
              return h('div', params.row.taxPeriod)
            }else{
              return h('div', "合计")
            }
          }
        },
        {
          title:"实缴时期",
          width:150,
          key:"paymentTime"
        },
        {
          title:'公司名称',
          width:150,
          key:"companyName"
        },
        {
          title:"国家",
          width:100,
          key:"countryName"
        },
        {
          title:'币种',
          width:100,
          key:"currency"
        },
        {
          title:"实缴税金",
          width:150,
          key:"taxPaidALL",
          render:this.rendertaxPaidALL
        },
        {
          title:"实缴滞纳金",
          width:150,
          key:"overduePaymentAll",
          render:this.renderoverduePaymentAll
        },
        {
          title:"实缴纳税款",
          width:150,
          // render:(h,params) => {
          //   return h('div', params.row.taxPaidALL + params.row.overduePaymentAll)
          // }
          render:this.renderSJXJ
        }
      ]
    }
  },
  methods:{
    // 渲染实缴税金合计
    rendertaxPaidALL(h, params) {
      debugger;
      if(params.row.taxPaidALL) {
        return h('div', params.row.taxPaidALL)
      }else{
        var tempSubmit=0
        this.data.map((item,index)=>{
          if(item.taxPaidALL) {
            tempSubmit += item.taxPaidALL
          }
        })
        return h('div', tempSubmit)
      }
    },
    // 渲染实缴纳税金合计
    renderoverduePaymentAll(h, params) {
      if(params.row.overduePaymentAll) {
        return h('div', params.row.overduePaymentAll)
      }else{
        var tempSubmit=0
        this.data.map((item,index)=>{
          if(item.overduePaymentAll) {
            tempSubmit += item.overduePaymentAll
          }
        })
        return h('div', tempSubmit)
      }
    },
    // 渲染税金小计合计
    renderSJXJ(h,params) {
      if(params.row.taxPaidALL || params.row.overduePaymentAll) {
        return h('div', params.row.taxPaidALL + params.row.overduePaymentAll)
      }else{
        var tempSubmit=0
        this.data.map((item,index)=>{
          if(item.taxPaidALL || item.overduePaymentAll) {
            tempSubmit += item.taxPaidALL + item.overduePaymentAll
          }
        })
        return h('div', tempSubmit)
      }
    },
    renderSZHJ(h,params) {
      let tempKey = params.column.key
      if(params.row[tempKey]==0 || params.row[tempKey]>0 && params.row[tempKey]!='') {
        return h('div', params.row[tempKey])
      }else{
        var submitNum=0
        this.data.map((item,index)=>{
          for(let key in item) {
            if(key==tempKey){
              submitNum+=item[key]
            }
          }
        })
         return h('div', submitNum)
      }
    },
    // 查询
    handleSearch(){
      this.getAllList()
    },
    // 重置
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.startTaxPeriod=""  // 所属期间开始日期
      this.endTaxPeriod=""  // 所属期间结束日期
      this.startTime=""  // 实缴期间开始日期
      this.endTime=""  // 实缴期间结束日期
      this.selectDateTaxPeriod="" // 所属期间
      this.selectDateTime=""  // 实缴时期
    },
    // 获取国家
    getAllCountry() {
      getDictListDataByType('0').then((res)=>{
        this.countryList = res.data
      })
    },
    // 获取税种
    getAlltaxDict() {
      getDictListDataByType('2').then((res)=>{
        this.taxDictList = res.data
        res.data.map((item,index)=>{
          this.columns.push({
            title:item.name,
            key:item.code,
            width:150,
            render:this.renderSZHJ
          })
        })
      })
    },
    // // 获取币种
    // getAllCurrency() {
    //   getDictListDataByType('1').then((res)=>{
    //     this.currencyList = res.data
    //   })
    // },
    // 根据币种获取名称
    renderNameByCurrency(code) {
      var submit =""
      this.currencyList.map((item,index)=>{
        if(item.code==code){
          submit = item.name
        }
      })
      return submit
    },
    // 获取公司
    getAllCompany() {
      let userId = this.userInfo.id
      getCompanyList(userId).then((res)=>{
        this.conpanyList=res.data
      })
    },
    selectDateRangeTaxPeriod(val) {
      this.startTaxPeriod = val[0]
      this.endTaxPeriod=val[1]
    },
    selectDateRangeTime(val) {
      this.startTime=val[0]
      this.endTime=val[1]
    },
    // 获取全部
    getAllList(){
      let params ={
        countryCode:this.searchForm.countryCode, // 国家
        companyIds:this.searchForm.companyName && this.searchForm.companyName.join(","),  // 公司名称
        currency:this.searchForm.currency,  // 币种
        taxDicts:this.searchForm.taxDict && this.searchForm.taxDict.join(","),  // 税种
        startTaxPeriod:this.startTaxPeriod, // 纳税所属期
        endTaxPeriod:this.endTaxPeriod,// 纳税所属期
        startTime:this.startTime,// 实缴时期
        endTime:this.endTime,// 实缴时期
        taxType:this.searchForm.taxType//税金类型
      }
      getDetail(params).then((res)=>{
        // this.data= res.data
        this.data=this.checkGroupByCompany(res.data)
      })
    },
    // 处理数据按公司分类
    checkGroupByCompany(dataList){
      var submit =[]
      var map={}
      // 按公司分组
      for(let i=0;i<dataList.length;i++) {
        var ai=dataList[i]
        if(!map[ai.companyId]) {
          submit.push({
            companyId:ai.companyId,
            companyName:ai.companyName,
            taxPeriod:ai.taxPeriod,
            paymentTime:ai.paymentTime && new Date(ai.paymentTime).format(),
            countryName:ai.countryName,
            currency:this.renderNameByCurrency(ai.currency),
            data:[ai]
          })
          map[ai.companyId] = ai.companyId
        }else{
          for(let i =0;i<submit.length;i++) {
            var dj = submit[i]
            if(dj.companyId == ai.companyId) {
              dj.data.push(ai)
              break
            }
          }
        }
      }
      // 按税种分组 初始化税种值 求 实缴税金 和 实缴纳税金和
      submit.map((item,index)=>{
        debugger;
        var taxPaidALL=0;
        var overduePaymentAll=0
        item.data.map((items,indexs)=>{
          // 按实缴税金查询
          if(this.searchForm.taxType=="PAID"){
            taxPaidALL += items.taxPaid  //实缴税金的和
          }else if(this.searchForm.taxType=="LATEFEE") {
            overduePaymentAll += items.overduePayment   // 实缴纳税金的和
          }else{
            taxPaidALL += items.taxPaid,
            overduePaymentAll += items.overduePayment
          }
        })
        this.taxDictList.map((items,indexs)=>{
          item[items.code]=0
        })
        item.taxPaidALL=taxPaidALL
        item.overduePaymentAll=overduePaymentAll
      })

      //
      for(let i=0;i<submit.length;i++) {
        let tempArry =submit[i].data
        let map={}
        for(let j=0;j<tempArry.length;j++) {
          if(!map[tempArry[j].taxDict]) {
            map[tempArry[j].taxDict]=[tempArry[j]]
          }else{
            map[tempArry[j].taxDict].push(tempArry[j])
          }
        }
        submit[i].taxDictLists=map
      }

      submit.map((item,index)=>{
        for(let key in item) {
          let tempObj = item['taxDictLists']
          for(let keys in tempObj) {
            if(key==keys) {
              tempObj[keys].map((items,indexs)=>{
                if(this.searchForm.taxType=="PAID") {
                  item[key] += items.taxPaid
                }else if(this.searchForm.taxType=="LATEFEE") {
                  item[key] +=  items.overduePayment
                }else{
                  item[key] += (items.taxPaid + items.overduePayment)

                }
              })
            }
          }
        }
      })
      submit.push({

      })
      console.log("submit",submit)
       return submit
    }
  },
  mounted() {
    this.getAllCountry()
    this.getAlltaxDict()
    this.getAllCompany()
    // this.getAllCurrency()
    this.getAllList()
  },
  watch:{
    selectDateTaxPeriod:function(oldV,newValue) {
      if(oldV[0]=="" && oldV[1]==""){
        this.disabledDateTaxPeriod=false
        return
      }else{
        this.disabledDateTaxPeriod=true
        return
      }
    },
    selectDateTime:function(oldVs,newValue){
      if(oldVs[0]=="" && oldVs[1]==""){
        this.disabledDateTime=false
        return
      }else{
        this.disabledDateTime=true
        return
      }
    }
  }
}
</script>

<style scoped lang="less">

</style>
