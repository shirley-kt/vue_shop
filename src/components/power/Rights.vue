<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Rights Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Rights List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <!-- card start -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Role Name" prop="authName"></el-table-column>
        <el-table-column label="Path" prop="path"></el-table-column>
        <el-table-column label="Role Level" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">Level 1</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">Level 2</el-tag>
            <el-tag type="warning" v-else>Level 3</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- card end -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('Get User List Failed')
      }

      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>