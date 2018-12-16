<!--  -->
<template>
  <div>
       <Card>
        <p slot="title">报税申请流程</p>
        <div class="centent">
            <img :src="srcImage" width="500px" height="700px" alt="报税申请流程图"/>  
        </div>
      </Card>
  </div>
</template>

<script type='text/ecmascript-6'>
export default {
  data () {
    return {
      srcImage:require('@/assets/flowImage.png')
    };
  },

  components: {},

  computed: {},

  mounted() {},

  methods: {}
}

</script>
<style lang='less' rel='stylesheet/less'>
.centent {
  text-align: center;
}
</style>