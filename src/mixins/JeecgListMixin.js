/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { getFileAccessHttpUrl } from '@/api/manage'
import { filterObj } from '@/utils/util'
import { deleteAction, getAction, downFile, getFileDownloadHttpUrl,} from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import _ from 'lodash'

export const JeecgListMixin = {
  data() {
    return {
      msgList: false,
      // token headerd
      tokenHeader: { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) },
      /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
      queryParam: {},
      /* 数据源 */
      dataSource: [],
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30', '100'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
      /* 排序参数 */
      isorter: {
        column: 'createTime',
        order: 'desc',
      },
      /* 筛选参数 */
      filters: {},
      /* table加载状态 */
      loading: false,
      /* table选中keys */
      selectedRowKeys: [],
      /* table选中records */
      selectionRows: [],
      /* 查询折叠 */
      toggleSearchStatus: false,
      /* 高级查询条件生效状态 */
      superQueryFlag: false,
      /* 高级查询条件 */
      superQueryParams: '',
      /** 高级查询拼接方式 */
      superQueryMatchType: 'and',
    }
  },
  created() {
    if (!this.disableMixinCreated) {
      if (this.startEndTime) {
        this.queryParams()
      }
      this.loadData()
      // 初始化字典配置 在自己页面定义
      this.initDictConfig()
    }
  },
  methods: {
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() // 查询条件
      if (this.memberSiteMenuType) params['memberSiteMenuType'] = this.memberSiteMenuType
      if (this.mobileOrPc) params['mobileOrPc'] = this.mobileOrPc
      if (this.delFlag) params['delFlag'] = this.delFlag
      if (this.onTheJobState) params['onTheJobState'] = this.onTheJobState
      if (this.isMenuType) params['menuType'] = this.isMenuType
      this.loading = true
      getAction(this.url.list, params).then(res => {
        if (res.success && res.result) {
          this.msgList = true
          this.dataSource = res.result.records
          this.ipagination.total = this.newIpagination ? this.dataSource.length : res.result.total
          if (this.getPreList === '1') {
            this.getPreLists()
          }
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    initDictConfig() {},
    handleSuperQuery(params, matchType) {
      // 高级查询方法
      if (!params) {
        this.superQueryParams = ''
        this.superQueryFlag = false
      } else {
        this.superQueryFlag = true
        this.superQueryParams = JSON.stringify(params)
        this.superQueryMatchType = matchType
      }
      this.loadData(1)
    },
    getQueryParams() {
      // 获取查询条件
      console.log('111')
      let sqp = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      console.log('param', param)
      return filterObj(param)
    },
    getQueryField() {
      // TODO 字段权限控制
      var str = 'id,'
      console.log('this.columns', this.columns)
      this.columns
        && this.columns.forEach(function (value) {
          str += ',' + value.dataIndex
        })
      return str
    },
    // 搜索框的搜索功能
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      console.log('selectedRowKeys', selectedRowKeys, selectionRows)
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
    },
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    searchQuery() {
      this.loadData(1)
    },
    superQuery() {
      this.$refs.superQueryModal.show()
    },
    searchReset() {
      this.queryParam = {}
      this.loadData(1)
    },
    batchDel: function () {
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      if (!this.url.deleteBatch) {
        this.$message.error('请设置url.deleteBatch属性!')
        return
      }
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
      } else {
        let ids = ''
        for (let a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ','
        }
        let that = this
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function () {
            that.loading = true
            deleteAction(that.url.deleteBatch, { ids: ids })
              .then(res => {
                if (res.success) {
                  that.$message.success(res.message)
                  that.loadData()
                  that.onClearSelected()
                } else {
                  that.$message.warning(res.message)
                }
              })
              .finally(() => {
                that.loading = false
              })
          },
        })
      }
    },
    handleDelete: function (id) {
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      deleteAction(that.url.delete, { id: id }).then(res => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    // id和userId的删除
    handleDeleteAndUserId: function ({ id, userId }) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      deleteAction(that.url.delete, {
        id: id,
        userId: userId,
      }).then(res => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    handleEdit: function (record) {
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      console.log('record', record)
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = '编辑'
      this.$refs.modalForm.disableSubmit = false
    },
    handleAdd: function (record = {}) {
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      this.$refs.modalForm.add(record)
      this.$refs.modalForm.title = '新增'
      this.$refs.modalForm.disableSubmit = false
    },
    handleTableChange(pagination, filters, sorter) {
      // 分页、排序、筛选变化时触发
      // TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = sorter.order == 'ascend' ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.loadData()
    },
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus
    },
    // 给popup查询使用(查询区域不支持回填多个字段，限制只返回一个字段)
    getPopupField(fields) {
      return fields.split(',')[0]
    },
    modalFormOk() {
      // 新增/修改 成功时，重载列表
      this.loadData()
    },
    handleDetail: function (record) {
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = '详情'
      this.$refs.modalForm.disableSubmit = true
    },
    /* 导出 */
    handleExportXls2() {
      let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()))
      let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`
      window.location.href = url
    },
    handleExportXls: _.debounce(function (fileName) {
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      if (!fileName || typeof fileName !== 'string') {
        fileName = '导出文件'
      }
      let param = { ...this.queryParam }
      if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
        param['selections'] = this.selectedRowKeys.join(',')
      }
      downFile(this.url.exportXlsUrl, param).then(data => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(
            new Blob([data], { type: 'application/vnd.ms-excel' }),
            fileName + '.xls',
          )
        } else {
          let url = window.URL.createObjectURL(
            new Blob([data], { type: 'application/vnd.ms-excel' }),
          )
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(url) // 释放掉blob对象
        }
      })
    }, 600),
    /* 导入 */
    handleImportExcel(info) {
      console.log(info)

      console.log('进行导入操作')
      if (this.onlineBtn && !this.onlineBtnPermission) {
        this.$message.warning('该账号不可进行操作！')
        return
      }
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          // this.$message.success(`${info.file.name} 文件上传成功`);
          if (info.file.response.code === 201) {
            let {
              message,
              result: { msg, fileUrl, fileName },
            } = info.file.response
            let href = window._CONFIG['domianURL'] + fileUrl
            this.$warning({
              title: message,
              content: (
                <div>
                  <span> {msg} </span>
                  <br />
                  <span>
                    {' '}
                    具体详情请{' '}
                    <a href={href} target="_blank" download={fileName}>
                      {' '}
                      点击下载{' '}
                    </a>{' '}
                  </span>
                </div>
              ),
            })
          } else {
            if (this.importFeedback) {
              this.$success({
                title: info.file.response.message || `${info.file.name} 文件上传成功`,
              })
            } else {
              this.$message.success(info.file.response.message || `${info.file.name} 文件上传成功`)
            }
            console.log('this.user_manage', this.user_manage)
            if (this.user_manage) {
              this.handleOkUserImport()
            }
            this.loadData(1)
          }
          this.loadData()
        } else {
          if (this.importFeedback) {
            this.$error({
              title: `${info.file.name} ${info.file.response.message}.`,
            })
          } else {
            this.$message.error(`${info.file.name} ${info.file.response.message}.`, 7)
          }
        }
      } else if (info.file.status === 'error') {
        if (this.importFeedback) {
          this.$error({
            title: `文件上传失败: ${info.file.msg} `,
          })
        } else {
          this.$message.error(`文件上传失败: ${info.file.msg} `, 7)
        }
      }
    },
    /* 图片预览 */
    getImgView(text) {
      if (text && text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      return getFileAccessHttpUrl(text)
    },
    uploadFile(text) {
      if (!text) {
        this.$message.warning('未知的文件')
        return
      }
      if (text || text.indexOf(',') > 0) {
        text = text.split(',')
        text.map(item => {
          let info = getFileDownloadHttpUrl(item)
          downFile(info.avatar).then(data => {
            if (!data) {
              this.$message.warning('文件下载失败')
              return
            }
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
              window.navigator.msSaveBlob(new Blob([data]), `${info.fileName}.${info.fileType}`)
            } else {
              let url = window.URL.createObjectURL(new Blob([data]))
              let link = document.createElement('a')
              link.style.display = 'none'
              link.href = url
              link.setAttribute('download', `${info.fileName}.${info.fileType}`)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link) // 下载完成移除元素
              window.URL.revokeObjectURL(url) // 释放掉blob对象
            }
          })
        })
      }
    },

    batchDelSelect: function () {
      if (!this.url.deleteBatch) {
        this.$message.error('请设置url.deleteBatch属性!')
        return
      }
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
      } else {
        const result = this.selectionRows.some(item => item.bpmStatus && item.bpmStatus !== '1')
        if (result) {
          this.$warning({
            title: '警告',
            content: '该审批状态下不可进行批量删除操作,请重新选择!',
          })
        } else {
          var ids = ''
          for (var a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ','
          }
          var that = this
          this.$confirm({
            title: '确认删除',
            content: '是否删除选中数据?',
            onOk: function () {
              that.loading = true
              deleteAction(that.url.deleteBatch, { ids: ids })
                .then(res => {
                  if (res.success) {
                    that.$message.success(res.message)
                    that.loadData()
                    that.onClearSelected()
                  } else {
                    that.$message.warning(res.message)
                  }
                })
                .finally(() => {
                  that.loading = false
                })
            },
          })
        }
      }
    },
  },
}
