<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row>
          <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form" :rules="formRules">
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
              <Select v-model="searchForm.taxDict" style="width:200px" multiple @on-change="selectOnchange" label-in-value>
                <Option v-for="(item,index) in taxDictList"
                  :value="item.code"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item>
            <Form-item label="税金类型" prop="taxType" >
              <Select v-model="searchForm.taxType" style="width:200px" @on-change="selectTaxTypeOnchange">
                <Option value="ALL">实际缴纳税款</Option>
                <Option value="PAID">实缴税金</Option>
                <Option value="LATEFEE">实缴滞纳金</Option>
              </Select>
            </Form-item>
            <!-- <Form-item label="币种" prop="currency">
              <Select v-model="searchForm.currency" style="width:200px">
                <Option v-for="(item,index) in currencyList"
                  :value="item.code"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item> -->
            <Form-item label="纳税所属期" prop="selectDateTaxPeriod">
              <DatePicker
              type="daterange"
               v-model="selectDateTaxPeriod"
               :disabled="disabledDateTime"
               format="yyyy-MM"
               clearable @on-change="selectDateRangeTaxPeriod" placeholder="选择起始时间" style="width: 200px"></DatePicker>
            </Form-item>
            <!-- <Form-item label="国家" prop="countryCode">
              <Select v-model="searchForm.countryCode" style="width:200px">
                <Option v-for="(item,index) in countryList"
                  :value="item.code"
                  :label="item.name"
                  :key="item.id"
                ></Option>
              </Select>
            </Form-item> -->
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
          :data="data" ref="table" ></Table>
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
      tempColunms:[],
      searchForm:{
        companyName:[],// 公司
        currency:"", // 币种
        taxDict:[], // 税种
        countryCode:"",  // 国家
        taxType:'' , //税金类型
      },
      formRules:{
        companyName:[{required:true,message:"请选择"}],
        taxDict:[{required:true,message:"请选择"}]
      },
      startTaxPeriod:"",  // 所属期间开始日期
      endTaxPeriod:"",  // 所属期间结束日期
      startTime:"",  // 实缴期间开始日期
      endTime:"",  // 实缴期间结束日期
      selectDateTaxPeriod:"", // 所属期间
      selectDateTime:"",  // 实缴时期
      disabledDateTaxPeriod:false,
      disabledDateTime:false,
      constColumns:[
        {
          title:"纳税所属期",
          key:"taxPeriod",
          render:(h,params) => {
            if(params.row.taxPeriod) {
              return h('div', params.row.taxPeriod && params.row.taxPeriod.replace(/-01$/,""))
            }else{
              return h('div', "合计")
            }
          }
        },
        {
          title:"实际缴纳日期",
          key:"paymentTime"
        },
        {
          title:'公司名称',
          key:"companyName"
        },
        {
          title:"国家",
          key:"countryName"
        },
        {
          title:'币种',
          key:"currency"
        },
        // {
        //   title:"实缴税金",
        //   key:"taxPaidALL",
        //   render:this.rendertaxPaidALL
        // },
        // {
        //   title:"实缴滞纳金",
        //   key:"overduePaymentAll",
        //   render:this.renderoverduePaymentAll
        // },
        // {
        //   title:"实缴纳税款",
        //   render:this.renderSJXJ
        // }
      ],
      columns:[
        {
          title:"纳税所属期",
          // width:150,
          key:"taxPeriod",
          render:(h,params) => {
            if(params.row.taxPeriod) {
              return h('div', params.row.taxPeriod && params.row.taxPeriod.replace(/-01$/,""))
            }else{
              return h('div', "合计")
            }
          }
        },
        {
          title:"实际缴纳日期",
          // width:150,
          key:"paymentTime"
        },
        {
          title:'公司名称',
          // width:150,
          key:"companyName"
        },
        {
          title:"国家",
          // width:100,
          key:"countryName"
        },
        {
          title:'币种',
          key:"currency"
        },
        // {
        //   title:"实缴税金",
        //   key:"taxPaidALL",
        //   render:this.rendertaxPaidALL
        // },
        // {
        //   title:"实缴滞纳金",
        //   key:"overduePaymentAll",
        //   render:this.renderoverduePaymentAll
        // },
        // {
        //   title:"实缴纳税款",
        //   render:this.renderSJXJ
        // }
      ],
      taxDictListMap:""
    }
  },
  methods:{
    selectTaxTypeOnchange(val,label){
      this.tempColunms=[]
      let tempTaxList=this.searchForm.taxDict
      console.log(",,,,,,",this.searchForm)
      switch (val) {
        case "PAID":
        this.tempColunms.push({title:"实缴税金",key:"taxPaidALL",render:this.rendertaxPaidALL})
        // this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
          break;
        case "LATEFEE":
        this.tempColunms.push({title:"实缴滞纳金",key:"overduePaymentAll",render:this.renderoverduePaymentAll})
        // this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
          break;
        default:
        // this.tempColunms.push({title:"实缴税金",key:"taxPaidALL",render:this.rendertaxPaidALL})
        // this.tempColunms.push({title:"实缴滞纳金",key:"overduePaymentAll",render:this.renderoverduePaymentAll})
        this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
      }
      for(let i=0;i<tempTaxList.length;i++) {
        this.tempColunms.push({
            title:this.taxDictListMap.get(tempTaxList[i]),
            key:tempTaxList[i]
        })
      }
    },
    selectOnchange(val,label) {
      // console.log("val",val)
      let tempList=[]
      let tempTaxType=this.searchForm.taxType
      this.tempColunms=[]
        switch (tempTaxType) {
          case "PAID":
          this.tempColunms.push({title:"实缴税金",key:"taxPaidALL",render:this.rendertaxPaidALL})
          // this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
            break;
          case "LATEFEE":
          this.tempColunms.push({title:"实缴滞纳金",key:"overduePaymentAll",render:this.renderoverduePaymentAll})
          // this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
            break;
          default:
          // this.tempColunms.push({title:"实缴税金",key:"taxPaidALL",render:this.rendertaxPaidALL})
          // this.tempColunms.push({title:"实缴滞纳金",key:"overduePaymentAll",render:this.renderoverduePaymentAll})
          this.tempColunms.push({title:"实际缴纳税款",render:this.renderSJXJ})
        }
      for(let i=0;i<val.length;i++) {
        this.tempColunms.push({
            title:val[i].label,
            key:val[i].value
        })
      }
      // this.tempColunms=tempList
      // console.log("tempList",this.tempColunms)
    },

    // 渲染实缴税金合计
    rendertaxPaidALL(h, params) {
      debugger;
      if(params.row.taxPaidALL) {
        return h('div', params.row.taxPaidALL)
      }else{
        var tempSubmit=0
        this.data.map((item,index)=>{
          if(item.taxPaidALL) {
            tempSubmit += parseFloat(item.taxPaidALL)
          }
        })
        return h('div', tempSubmit.toFixed(2))
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
            tempSubmit += parseFloat(item.overduePaymentAll)
          }
        })
        return h('div', tempSubmit.toFixed(2))
      }
    },
    // 渲染税金小计合计
    renderSJXJ(h,params) {
      debugger;
      if(params.row.taxPaidALL || params.row.overduePaymentAll) {
        let tempAll = parseFloat(params.row.taxPaidALL==""?0:params.row.taxPaidALL) + parseFloat(params.row.overduePaymentAll==""?0:params.row.overduePaymentAll)
        return h('div', tempAll.toFixed(2))
      }else{
        var tempSubmit=0
        this.data.map((item,index)=>{
          if(item.taxPaidALL || item.overduePaymentAll) {
            tempSubmit += parseFloat(item.taxPaidALL==""?0:item.taxPaidALL) + parseFloat(item.overduePaymentAll==""?0:item.overduePaymentAll)
          }
        })
        return h('div', tempSubmit.toFixed(2))
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
      this.disabledDateTaxPeriod=false
      this.disabledDateTime=false
      // getDetail({}).then((res)=>{
      //   // this.data= res.data
      //   // this.tempColunms=[]
      //   this.data=[]
      // })
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
        let taxDictListMap = new Map()
        res.data.map((item,index)=>{
          taxDictListMap.set(item.code,item.name)
        })
        this.taxDictListMap = taxDictListMap
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
      this.$refs['searchForm'].validate((valid) => {
                   if (valid) {
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
                     if(this.tempColunms.length>=1){
                       this.columns=this.constColumns.concat(this.tempColunms)
                     }
                     getDetail(params).then((res)=>{
                       // this.data= res.data
                       this.tempColunms=[]
                       this.data=this.checkGroupByCompany(res.data)
                     })
                   }
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
            taxPaidALL += parseFloat(items.taxPaid)  //实缴税金的和
          }else if(this.searchForm.taxType=="LATEFEE") {
            overduePaymentAll += parseFloat(items.overduePayment)   // 实缴纳税金的和
          }else{
            taxPaidALL += parseFloat(items.taxPaid),
            overduePaymentAll += parseFloat(items.overduePayment)
          }
        })
        this.taxDictList.map((items,indexs)=>{
          item[items.code]=0
        })
        item.taxPaidALL=parseFloat(taxPaidALL).toFixed(2)
        item.overduePaymentAll=parseFloat(overduePaymentAll).toFixed(2)
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
        var tempValue = 0
        for(let key in item) {
          let tempObj = item['taxDictLists']
          for(let keys in tempObj) {
            if(key==keys) {
              tempObj[keys].map((items,indexs)=>{
                if(this.searchForm.taxType=="PAID") {
                  tempValue += parseFloat(items.taxPaid)
                  item[key] = (tempValue === 0 ? "": tempValue.toFixed(2))
                }else if(this.searchForm.taxType=="LATEFEE") {
                  tempValue += parseFloat(items.overduePayment)
                  item[key] = (tempValue === 0 ? "": tempValue.toFixed(2))
                }else{
                  tempValue += parseFloat(items.taxPaid) + parseFloat(items.overduePayment)
                  item[key] = (tempValue === 0 ? "":tempValue.toFixed(2))
                  console.log("asdasd",item[key])
                }
              })
            }
          }
        }
      })
      submit.push({

      })
      console.log("submit",submit)
      submit.forEach((item,index)=>{
        for(let key in item) {
          if(item[key]==0) {
            item[key]=""
          }
          // console.log("key",key)
        }
      })
       return submit
    }
  },
  mounted() {
    this.getAllCountry()
    this.getAlltaxDict()
    this.getAllCompany()
    // this.getAllCurrency()
    // this.getAllList()
  },
  watch:{
    selectDateTaxPeriod:function(oldV,newValue) {
      if(oldV[0]=="" && oldV[1]=="" || !oldV){
        this.disabledDateTaxPeriod=false
        return
      }else{
        this.disabledDateTaxPeriod=true
        return
      }
    },
    selectDateTime:function(oldVs,newValue){
      if(oldVs[0]=="" && oldVs[1]=="" || !oldVs){
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
