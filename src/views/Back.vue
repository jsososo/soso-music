<template>
  <div>
    <div>
      <el-input type="text" v-model="delVersion" style="width: 140px" />
      <el-button @click="del">删除版本</el-button>
    </div>

    <div class="mt_10">
      <el-input placeholder="版本" v-model="version" style="width: 140px" />
      <br />
      <el-input placeholder="版本类型" v-model="versionType" style="width: 140px" />
      <br />
      <el-input placeholder="说明" v-model="explain" style="width: 140px" />
      <br />
      <el-input placeholder="时间" v-model="date" style="width: 140px" />
      <br />
      <el-button @click="add">新增</el-button>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import request from "../utils/request";
  import { mixDomain as domain } from "../utils/store/action";

  export default {
    name: "Back",
    setup() {
      const delVersion = ref('');
      const version = ref('');
      const versionType = ref('');
      const explain = ref('');
      const date = ref('');

      return {
        delVersion,
        versionType,
        version,
        explain,
        date,

        del() {
          if (!delVersion.value) {
            return ElMessage.warning('?');
          }
          request({
            domain,
            api: 'MIX_VERSION_DEL',
            data: { version: delVersion.value }
          }).then(() => {
            ElMessage.success('操作成功');
            delVersion.value = '';
          })
        },

        add() {
          if (!version.value || !explain.value) {
            return ElMessage.warning('?');
          }
          request({
            api: 'MIX_VERSION_ADD',
            domain,
            data: {
              version: version.value,
              versionType: versionType.value,
              explain: explain.value,
              created: date.value,
            }
          }).then(() => {
            ElMessage.success('操作成功');
            version.value = '';
            versionType.value = '';
            explain.value = '';
            date.value = '';
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>