<template>
  <div class="box">
    <div class="box-padding">
      <Table :columns="columns1" :data="data1"></Table>



      <Modal
       v-model="modal1"
       title="详情"
       @on-ok="ok"
       @on-cancel="cancel">
       <Form :model="formItem" :label-width="100">
         <FormItem label="参数">
             <Input  v-model="formItem.property" disabled  style="width:200px" onReady></Input >
         </FormItem>
         <FormItem label="参数名称">
             <Input  v-model="formItem.propertyName"  style="width:200px"></Input >
         </FormItem>
         <FormItem label="参数大小">
             <Input  v-model="formItem.propertyValue" placeholder="请输入" style="width:200px"></Input >
         </FormItem>
         <FormItem label="参数单位">
             <Input  v-model="formItem.unit" disabled  style="width:200px"></Input >
         </FormItem>
       </Form>

     </Modal>
    </div>
  </div>
</template>

<script>
import {getAllSysConfig,editSysConfig} from '@/api/index'
export default{
  data(){
    return {
      formItem:{
        property:"",
        propertyName:"",
        propertyValue:"",
        unit:""
      },
      data1:[],
      modal1:false,
      columns1:[
        {
          type: 'index',
          width: 60,
          align: 'center'
        },{
          title:"参数",
          align: 'center',
          key:"property"
        },{
          title:"参数名称",
          align: 'center',
          key:"propertyName"
        },{
          title:"参数大小",
          align: 'center',
          key:"propertyValue"
        },{
          title:"参数单位",
          align: 'center',
          key:"unit"
        },{
          title:"操作",
          render:(h,params)=>{
            return (
              h('div',[
                h('Button',{
                  props: {
                      type: 'primary',
                      size: 'small'
                  },
                  style: {
                      marginRight: '5px'
                  },
                  on: {
                      click: () => {
                          this.show(params.row)
                      }
                  }
                },"编辑")
              ])
            )
          }
        }
      ]
    }
  },
  methods:{
    ok() {
      editSysConfig(this.formItem).then((res)=>{
        if(res.status==0){
          this.$Message.success("修改成功")
          this.inint()
        }else{
          this.$Message.error(res.errMsg)
        }
      })
    },
    cancel() {
      this.model1=false
    },
    show(item) {
      this.formItem=JSON.parse(JSON.stringify(item))
      this.modal1=true
    },
    inint() {
      // 获取参数列表
      getAllSysConfig().then((res)=>{
        this.data1=res.data
      })
    }
  },
  created(){
    this.inint()
  }
}
</script>

<style lang="less" scoped>
.box {
  background: #fff;
  .box-padding {
    padding: 10px;
  }
}
</style>
