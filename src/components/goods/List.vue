<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Product Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Product List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="Please enter content"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button class="add-producy-button" @click="goAddpage">Add Product</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodslist" border stripe empty-text="No Data">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Name" prop="goods_name"></el-table-column>
        <el-table-column label="Price" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="Weight" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="Adding Time" prop="add_time" width="160px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="Action" width="130px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- pagination start-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
      <!-- pagination end-->
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // query object
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // product list
      goodslist: [],
      // total
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('Error in get product list !')
      }

      this.$message.success('Success !')
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // remove product
    async removeById(id) {
      const confirmResult = await this.$confirm(
        'Confirm to delete?',
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('Confirm Deletion !')
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to delete !')
      }

      this.$message.success('Deletion succeed !')
      this.getGoodsList()
    },
    // add goods
    goAddpage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.add-producy-button {
  background-color: #fb5020;
  border-color: #fb5020;
}
</style>