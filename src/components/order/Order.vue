<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Order Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Order List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="Please enter">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- order list start-->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Order Number" prop="order_number"></el-table-column>
        <el-table-column label="Total Price" prop="order_price"></el-table-column>
        <el-table-column label="Paid" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">Paid</el-tag>
            <el-tag type="danger" v-else>Not Paid</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Shipped" prop="is_send">
          <template slot-scope="scope">
            <template></template>
          </template>
        </el-table-column>
        <el-table-column label="Created Time" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- order list end-->

      <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- edit dialog -->
    <el-dialog
      title="Edit Address"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="State" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="Address" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addressVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

    <!-- show shipping status -->
    <el-dialog title="Shipping Status" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: 'Please select state', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: 'Please select address', trigger: 'blur' }
        ]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to get order list !')
      }

      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // method to show edit dialog
    showBox() {
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to get shipping status !')
      }

      this.progressInfo = res.data

      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>