const { test } = require('node:test')
const assert = require('node:assert/strict')

test('传输记录按进行中、失败、完成排序，并去除完成瞬间的重复记录', async () => {
  const { combineTransferRecords } = await import('../../client/components/sftp/TransferPanel/transfer-records.js')
  const active = [{ id: 'active' }, { id: 'transition' }]
  const history = [{ id: 'done' }, { id: 'failed', error: 'failed' }, { id: 'transition' }]
  const result = combineTransferRecords(active, history)
  assert.deepEqual(result.map(record => record.id), ['active', 'transition', 'failed', 'done'])
  assert.deepEqual(result.map(record => record.active), [true, true, false, false])
  assert.equal(active[0].active, undefined)
  assert.equal(history[0].active, undefined)
})

test('清屏仅删除当前会话的已完成记录，保留任务、失败和其他会话记录', async () => {
  const { removeCompletedRecords } = await import('../../client/components/sftp/TransferPanel/transfer-records.js')
  const active = [{ id: 'running', tabId: 'one' }, { id: 'waiting', tabId: 'one' }]
  const history = [
    { id: 'done', tabId: 'one' },
    { id: 'running', tabId: 'one' },
    { id: 'failed', tabId: 'one', error: 'failed' },
    { id: 'other', tabId: 'two' }
  ]
  const result = removeCompletedRecords('one', active, history)
  assert.deepEqual(result.map(record => record.id), ['running', 'failed', 'other'])
  assert.deepEqual(active.map(record => record.id), ['running', 'waiting'])
})
