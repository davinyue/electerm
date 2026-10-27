/**
 * transfer-history-modal
 */

import { memo, useState } from 'react'
import { CloseOutlined, CloseCircleOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import time from '../../common/time'
import Tag from '../sftp/transfer-tag'
import './transfer-history.styl'
import { get as _get } from 'lodash-es'
import { filesize } from 'filesize'
import { refsStatic } from '../common/ref'
import { combineTransferRecords, removeCompletedRecords } from '../sftp/TransferPanel/transfer-records'

const e = window.translate
const timeRender = t => time(t)
const sorterFactory = prop => {
  return (a, b) => {
    return _get(a, prop) > _get(b, prop) ? 1 : -1
  }
}
export default memo(function TransferHistoryModal (props) {
  const [pageSize, setPageSize] = useState(props.fileTransfers ? 10 : 5)

  const handlePageSizeChange = (page, pageSize) => {
    setPageSize(pageSize)
  }

  const {
    clearTransferHistory
  } = window.store
  const transferHistory = props.transferHistory
  const combined = !!props.fileTransfers
  const fileTransfers = props.fileTransfers || []
  const allPaused = fileTransfers.length > 0 && fileTransfers.every(t => t.pausing)
  const updateTransfer = (id, operation, update) => {
    refsStatic.get('transfer-queue')?.addToQueue(operation, id, update)
  }
  const pauseOrResumeAll = () => {
    window.store.fileTransfers.filter(t => t.tabId === props.tabId).forEach(t => { t.pausing = !allPaused })
  }
  const cancelAll = () => {
    window.store.fileTransfers = window.store.fileTransfers.filter(t => t.tabId !== props.tabId)
  }
  const columns = [{
    title: e('startTime'),
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: sorterFactory('startTime'),
    render: combined ? t => t ? timeRender(t) : '-' : timeRender
  }, {
    title: e('finishTime'),
    dataIndex: 'finishTime',
    key: 'finishTime',
    sorter: sorterFactory('finishTime'),
    render: combined ? t => t ? timeRender(t) : '-' : timeRender
  }, {
    title: e('type'),
    dataIndex: 'type',
    key: 'typeFrom',
    sorter: sorterFactory('typeFrom'),
    render: (type, inst) => {
      return (
        <Tag transfer={inst} variant='solid' />
      )
    }
  }, {
    title: e('host'),
    dataIndex: 'host',
    key: 'host',
    sorter: sorterFactory('host')
  }, {
    title: e('fromPath'),
    dataIndex: 'fromPath',
    key: 'fromPath',
    render: (txt, inst) => {
      const t = inst.fromPathReal || txt
      return (
        <div className='sftp-file history-file' title={t}>{t}</div>
      )
    },
    sorter: sorterFactory('fromPath')
  }, {
    title: e('toPath'),
    dataIndex: 'toPath',
    key: 'toPath',
    render: (txt, inst) => {
      const t = inst.toPathReal || txt
      return (
        <div className='sftp-file history-file' title={t}>{t}</div>
      )
    },
    sorter: sorterFactory('toPath')
  }, {
    title: e('size'),
    dataIndex: 'size',
    key: 'size',
    sorter: sorterFactory('size'),
    render: (v, inst) => filesize(v || (combined && inst.fromFile?.size) || 0)
  }, {
    title: e('speed'),
    dataIndex: 'speed',
    key: 'speed',
    sorter: sorterFactory('speed')
  }]
  if (combined) {
    columns.forEach(column => { delete column.sorter })
    columns.push({
      title: '%',
      key: 'progress',
      render: (value, transfer) => transfer.active ? `${transfer.percent || 0}%` : transfer.error ? '-' : '100%'
    }, {
      title: '',
      key: 'actions',
      render: (value, transfer) => {
        if (!transfer.active) return null
        const Icon = transfer.pausing ? PlayCircleOutlined : PauseCircleOutlined
        return (
          <span>
            {transfer.typeFrom !== transfer.typeTo && (
              <Icon className='pointer transfer-record-action' title={e(transfer.pausing ? 'resume' : 'pause')} onClick={() => updateTransfer(transfer.id, 'update', { pausing: !transfer.pausing })} />
            )}
            <CloseCircleOutlined className='pointer' title={e('cancel')} onClick={() => updateTransfer(transfer.id, 'delete')} />
          </span>
        )
      }
    })
  }
  const tabConf = {
    dataSource: combined ? combineTransferRecords(fileTransfers, transferHistory) : transferHistory,
    columns,
    bordered: true,
    pagination: {
      pageSize,
      showSizeChanger: true,
      pageSizeOptions: [5, 10, 20, 50, 100],
      placement: 'topEnd',
      onChange: handlePageSizeChange
    },
    size: 'small',
    rowKey: 'id'
  }
  return (
    <div className='pd2'>
      <div className={combined ? 'transfer-record-controls' : undefined}>
        {combined && fileTransfers.length > 0 && (
          <>
            <span className='pointer' onClick={pauseOrResumeAll}>{e(allPaused ? 'resume' : 'pause')}</span>
            <span className='pointer' onClick={cancelAll}>{e('cancelAll')}</span>
          </>
        )}
        <span
          className='iblock pointer'
          onClick={props.tabId
            ? () => {
                const store = window.store
                store.transferHistory = removeCompletedRecords(props.tabId, store.fileTransfers, store.transferHistory)
              }
            : clearTransferHistory}
        >
          <CloseOutlined className='mg1r' />
          {e('clear')}
        </span>
      </div>
      <div className='table-scroll-wrap'>
        <Table
          {...tabConf}
        />
      </div>
    </div>
  )
})
