<template>
  <div class="input-line">
    <div class="input-label">
      {{ label }}：
    </div>
    <div class="input-content">
      <slot/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SettingLine",
    props: {
      label: String,
    }
  }
</script>

<style scoped lang="scss">
  .input-line {
    display: flex;
    line-height: 28px;
    margin-bottom: 16px;

    .input-label {
      flex: 2;
      text-align: right;
    }

    .input-content {
      flex: 10;
      padding-left: 12px;

      .input-txt-info {
        text-decoration: underline;
        cursor: pointer;
      }

      .explain {
        color: #fff9;
        font-size: 12px;
      }
    }
  }
</style>