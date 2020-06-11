<template>
  <el-container class="home-container">
    <!-- header start-->
    <el-header>
      <div>
        <a href @click.prevent="mainPage()">
          <img src="../assets/logo-small.png" alt />
        </a>
        <span>
          <a href @click.prevent="mainPage()">E-Commerce Management System</a>
        </span>
      </div>
      <el-button class="quitButton" type="info" @click="logout">Quit</el-button>
    </el-header>
    <!-- header end-->

    <!-- main area start -->
    <el-container>
      <!-- memu start-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#575757"
          text-color="#fff"
          active-text-color="#FB5020"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- first level menu -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- first level menu model-->
            <template slot="title">
              <!-- icon -->
              <i :class="iconsObj[item.id]"></i>
              <!-- text -->
              <span>{{item.authName}}</span>
            </template>
            <!-- second level menu -->
            <el-menu-item
              :index="'/'+subitem.path"
              :key="subitem.id"
              v-for="subitem in item.children"
              @click="saveNavState('/'+subitem.path)"
            >
              <template slot="title">
                <!-- icon -->
                <i class="el-icon-menu"></i>
                <!-- text -->
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- memu end-->

      <!-- main start-->
      <el-main>
        <!-- router placeholder -->
        <router-view></router-view>
      </el-main>
      <!-- main end-->
    </el-container>
  </el-container>
  <!-- main area end-->
</template>

<script>
export default {
  data() {
    return {
      // menu for left list
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // active path for current selected menu
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    mainPage() {
      this.$forceUpdate()
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
a {
  text-decoration: none;
  font-style: none;
  color: #a86550;
}

.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #212121;
  padding-left: 15px;
  align-items: center;
  color: #a86550;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
  }
  img {
    height: 100%;
    width: 120px;
  }

  span {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    a {
      font-size: 25px;
      color: #fff;
    }
  }
}
.el-aside {
  background-color: #575757;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #fff;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: rgba(87, 87, 87, 0.3);
  font-size: 10px;
  line-height: 24px;
  color: #fb5020;
  text-align: center;
  letter-spacing: 0.3em;
  font-weight: 700;
  cursor: pointer;
}

.quitButton {
  background-color: #fb5020;
}
</style>