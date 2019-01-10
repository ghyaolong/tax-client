<template>
  <div>
    12121212
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  methods:{
    inintPage() {
      let type = this.$route.params.type;
      console.log("0000",this.$route.params.params)
    },
    init() {
      this.inintPage()
    }
  },
  mounted(){
    this.init()
  }
}
</script>

<style scoped lang="less">


</style>
